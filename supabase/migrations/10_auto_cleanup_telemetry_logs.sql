-- ==============================================================================
-- MIGRACIÓN 10: AUTO-LIMPIEZA DE TELEMETRÍA Y TAREA PROGRAMADA (IDEMPOTENTE)
-- Archivo: supabase/migrations/10_auto_cleanup_telemetry_logs.sql
-- Motor: PostgreSQL 15+ (Supabase)
-- ==============================================================================

-- 1. Asegurar tabla karaoke_system_logs
CREATE TABLE IF NOT EXISTS public.karaoke_system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT NOT NULL DEFAULT 'FIESTA',
    node_type TEXT NOT NULL, -- 'tv', 'host', 'guest', 'api', 'system'
    level TEXT NOT NULL DEFAULT 'info', -- 'info', 'warn', 'error'
    event TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices optimizados
CREATE INDEX IF NOT EXISTS idx_system_logs_room_created 
ON public.karaoke_system_logs (room_code, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_logs_created 
ON public.karaoke_system_logs (created_at DESC);

-- Habilitar RLS
ALTER TABLE public.karaoke_system_logs ENABLE ROW LEVEL SECURITY;

-- Limpieza segura de políticas previas (evita error 42710)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir insercion anonima de logs" ON public.karaoke_system_logs;
    DROP POLICY IF EXISTS "Permitir lectura publica de logs" ON public.karaoke_system_logs;
END $$;

CREATE POLICY "Permitir insercion anonima de logs"
ON public.karaoke_system_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Permitir lectura publica de logs"
ON public.karaoke_system_logs
FOR SELECT
TO anon, authenticated
USING (true);

-- 2. Función de Limpieza Automática (Buffer Máximo de 1,000 filas y purga de logs > 3 días)
CREATE OR REPLACE FUNCTION public.fn_cleanup_old_telemetry_logs()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER := 0;
BEGIN
    -- Regla 1: Borrar logs que tengan más de 3 días de antigüedad
    DELETE FROM public.karaoke_system_logs
    WHERE created_at < NOW() - INTERVAL '3 days';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    -- Regla 2: Mantener buffer circular estricto (máximo 1000 registros más recientes)
    DELETE FROM public.karaoke_system_logs
    WHERE id NOT IN (
        SELECT id FROM public.karaoke_system_logs
        ORDER BY created_at DESC
        LIMIT 1000
    );

    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Disparador de auto-limpieza al insertar (se ejecuta de forma ultra liviana)
CREATE OR REPLACE FUNCTION public.tr_trigger_auto_cleanup_logs()
RETURNS TRIGGER AS $$
BEGIN
    -- Ejecuta la purga con probabilidad en cada inserción para no afectar rendimiento
    IF (random() < 0.05) THEN
        PERFORM public.fn_cleanup_old_telemetry_logs();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_cleanup_logs_probabilistic ON public.karaoke_system_logs;
CREATE TRIGGER tr_cleanup_logs_probabilistic
AFTER INSERT ON public.karaoke_system_logs
FOR EACH STATEMENT
EXECUTE FUNCTION public.tr_trigger_auto_cleanup_logs();

-- 4. Función de borrado definitivo total (cuando finalicen las pruebas generales)
CREATE OR REPLACE FUNCTION public.fn_drop_telemetry_logs_completely()
RETURNS VOID AS $$
BEGIN
    DROP TABLE IF EXISTS public.karaoke_system_logs CASCADE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

NOTIFY pgrst, 'reload schema';
