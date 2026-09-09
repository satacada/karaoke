-- ==============================================================================
-- MIGRACIÓN 04: SISTEMA DE COMPUERTA Y APROBACIÓN POR EL SUPER ADMINISTRADOR
-- Archivo: supabase/migrations/04_owner_approval_system.sql
-- ==============================================================================

-- 1. Agregar columnas de aprobación y auditoría a karaoke_rooms
ALTER TABLE public.karaoke_rooms
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by TEXT;

-- 2. Asegurar que la sala inicial de prueba FIESTA quede aprobada
UPDATE public.karaoke_rooms
SET is_approved = true,
    approved_at = NOW(),
    approved_by = 'system_seed'
WHERE room_code = 'FIESTA';

-- 3. Índice para consultas rápidas de estado de aprobación
CREATE INDEX IF NOT EXISTS idx_rooms_approval ON public.karaoke_rooms (is_approved);

-- 4. Procedimiento almacenado para aprobar o suspender una sala
CREATE OR REPLACE FUNCTION public.fn_approve_room(
    p_room_id UUID,
    p_approved_by TEXT,
    p_status BOOLEAN
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.karaoke_rooms
    SET is_approved = p_status,
        approved_at = CASE WHEN p_status THEN NOW() ELSE NULL END,
        approved_by = CASE WHEN p_status THEN p_approved_by ELSE NULL END,
        updated_at = NOW()
    WHERE id = p_room_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
