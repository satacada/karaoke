-- ==============================================================================
-- MIGRACIÓN 06: GESTIÓN MULTI-AMBIENTES Y MASTER VENUE HUB
-- Archivo: supabase/migrations/06_multiroom_management.sql
-- ==============================================================================

-- 1. Ampliar karaoke_rooms con soporte para sectores, políticas y sincronización
ALTER TABLE public.karaoke_rooms
ADD COLUMN IF NOT EXISTS zone_name TEXT NOT NULL DEFAULT 'Salón Principal',
ADD COLUMN IF NOT EXISTS allowed_genres JSONB NOT NULL DEFAULT '["all"]'::jsonb,
ADD COLUMN IF NOT EXISTS vip_price_ars INTEGER NOT NULL DEFAULT 500,
ADD COLUMN IF NOT EXISTS is_synced_master BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS master_room_id UUID REFERENCES public.karaoke_rooms(id) ON DELETE SET NULL;

-- 2. Asegurar que la sala base FIESTA tenga su sector definido
UPDATE public.karaoke_rooms
SET zone_name = 'Salón Principal'
WHERE room_code = 'FIESTA' AND (zone_name IS NULL OR zone_name = '');

-- 3. Procedimiento transaccional para traspasar canciones en cola entre ambientes
CREATE OR REPLACE FUNCTION public.fn_transfer_room_queue(
    p_source_room_id UUID,
    p_target_room_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_target_last_priority INTEGER;
    v_transferred_count INTEGER := 0;
BEGIN
    IF p_source_room_id = p_target_room_id THEN
        RETURN jsonb_build_object('success', false, 'message', 'Source and target must be different');
    END IF;

    -- Obtener la última prioridad de la sala destino
    SELECT COALESCE(MAX(priority_order), 0)
    INTO v_target_last_priority
    FROM public.karaoke_queue
    WHERE room_id = p_target_room_id AND status = 'queued';

    -- Reasignar y traspasar las canciones en cola manteniendo su orden relativo
    WITH moved_songs AS (
        UPDATE public.karaoke_queue
        SET room_id = p_target_room_id,
            priority_order = v_target_last_priority + ROW_NUMBER() OVER (ORDER BY priority_order ASC)
        WHERE room_id = p_source_room_id AND status = 'queued'
        RETURNING id
    )
    SELECT COUNT(*) INTO v_transferred_count FROM moved_songs;

    RETURN jsonb_build_object(
        'success', true,
        'transferred_count', v_transferred_count,
        'target_room_id', p_target_room_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
