-- ==============================================================================
-- MIGRACIÓN DDL: FUNCIÓN PARA REINICIAR COLA DE SALA A CERO
-- Archivo: supabase/migrations/02_reset_room_queue.sql
-- Motor: PostgreSQL 15+ (Supabase)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.fn_reset_room_queue(
    p_room_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- 1. Cancelar canciones activas o encoladas
    UPDATE public.karaoke_queue
    SET status = 'purged_by_host',
        finished_at = NOW()
    WHERE room_id = p_room_id 
      AND status IN ('queued', 'playing');

    -- 2. Restablecer la sala a estado limpio / idle
    UPDATE public.karaoke_rooms
    SET current_song_id = NULL,
        is_playing = false,
        current_time_seconds = 0,
        updated_at = NOW()
    WHERE id = p_room_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
