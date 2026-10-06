-- ==============================================================================
-- MIGRACIÓN 09: SISTEMA DE TELEMETRÍA Y LOGS EN TIEMPO REAL (CAJA NEGRA)
-- Archivo: supabase/migrations/09_system_telemetry_logs.sql
-- Permite que la TV, celular anfitrión y clientes reporten eventos y errores
-- ==============================================================================

-- 1. Tabla de Logs de Auditoría y Diagnóstico en Tiempo Real
CREATE TABLE IF NOT EXISTS public.karaoke_system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT NOT NULL DEFAULT 'FIESTA',
    node_type TEXT NOT NULL, -- 'tv', 'host', 'guest', 'api', 'db'
    level TEXT NOT NULL DEFAULT 'info', -- 'info', 'warn', 'error'
    event TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.karaoke_system_logs IS 'Caja negra y telemetría en tiempo real de eventos de TV, Host y Clientes.';

-- 2. Índices para consultas rápidas de diagnóstico
CREATE INDEX IF NOT EXISTS idx_system_logs_room_created 
ON public.karaoke_system_logs (room_code, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_logs_level_created 
ON public.karaoke_system_logs (level, created_at DESC);

-- 3. Habilitar RLS y Políticas de Inserción y Lectura
ALTER TABLE public.karaoke_system_logs ENABLE ROW LEVEL SECURITY;

-- Permitir a cualquier nodo (anon) insertar logs de telemetría
CREATE POLICY "Permitir insercion anonima de logs"
ON public.karaoke_system_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permitir lectura de logs para monitoreo y soporte
CREATE POLICY "Permitir lectura publica de logs"
ON public.karaoke_system_logs
FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Publicación en Realtime para poder monitorear en vivo si se desea
ALTER TABLE public.karaoke_system_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.karaoke_system_logs;

NOTIFY pgrst, 'reload schema';
