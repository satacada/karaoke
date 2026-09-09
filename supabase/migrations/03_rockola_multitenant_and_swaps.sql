-- ==============================================================================
-- MIGRACIÓN 03: MULTI-TENANT, GESTIÓN DE LOCALES Y PODERES DE TURNO ROCKOLA
-- Archivo: supabase/migrations/03_rockola_multitenant_and_swaps.sql
-- ==============================================================================

-- 1. Ampliar tabla karaoke_rooms con datos del dueño y modelo de cobro
ALTER TABLE public.karaoke_rooms
ADD COLUMN IF NOT EXISTS owner_id UUID,
ADD COLUMN IF NOT EXISTS owner_email TEXT,
ADD COLUMN IF NOT EXISTS business_name TEXT DEFAULT 'Mi Rockola',
ADD COLUMN IF NOT EXISTS pricing_mode TEXT DEFAULT 'free' CONSTRAINT ck_rooms_pricing CHECK (pricing_mode IN ('free', 'paid_per_song')),
ADD COLUMN IF NOT EXISTS price_per_song NUMERIC(10,2) DEFAULT 0.00;

-- 2. Procedimiento Almacenado: Reemplazar una canción en espera manteniendo su turno
CREATE OR REPLACE FUNCTION public.fn_replace_guest_song(
    p_song_id UUID,
    p_new_video_id TEXT,
    p_new_title TEXT,
    p_new_author TEXT,
    p_new_thumbnail TEXT,
    p_new_duration_secs INTEGER,
    p_new_duration_text TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_status TEXT;
BEGIN
    SELECT status INTO v_status
    FROM public.karaoke_queue
    WHERE id = p_song_id;

    -- Solo se puede reemplazar si la canción aún no ha comenzado a sonar
    IF v_status IS NULL OR v_status != 'queued' THEN
        RETURN FALSE;
    END IF;

    UPDATE public.karaoke_queue
    SET video_id = p_new_video_id,
        title = p_new_title,
        author = p_new_author,
        thumbnail_url = p_new_thumbnail,
        duration_seconds = p_new_duration_secs,
        duration_text = p_new_duration_text
    WHERE id = p_song_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Procedimiento Almacenado: Intercambiar orden entre dos canciones del mismo invitado (Swap)
CREATE OR REPLACE FUNCTION public.fn_swap_guest_songs(
    p_song_id_1 UUID,
    p_song_id_2 UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_order_1 INTEGER;
    v_order_2 INTEGER;
    v_room_1 UUID;
    v_room_2 UUID;
    v_status_1 TEXT;
    v_status_2 TEXT;
    v_guest_1 TEXT;
    v_guest_2 TEXT;
BEGIN
    SELECT priority_order, room_id, status, LOWER(requested_by)
    INTO v_order_1, v_room_1, v_status_1, v_guest_1
    FROM public.karaoke_queue
    WHERE id = p_song_id_1;

    SELECT priority_order, room_id, status, LOWER(requested_by)
    INTO v_order_2, v_room_2, v_status_2, v_guest_2
    FROM public.karaoke_queue
    WHERE id = p_song_id_2;

    -- Validar que ambas existen, están en la misma sala, ambas están queued y son del mismo solicitante
    IF v_order_1 IS NULL OR v_order_2 IS NULL THEN
        RETURN FALSE;
    END IF;

    IF v_room_1 != v_room_2 OR v_status_1 != 'queued' OR v_status_2 != 'queued' THEN
        RETURN FALSE;
    END IF;

    IF v_guest_1 != v_guest_2 THEN
        RETURN FALSE;
    END IF;

    -- Intercambio atómico usando valor temporal (-1)
    UPDATE public.karaoke_queue SET priority_order = -1 WHERE id = p_song_id_1;
    UPDATE public.karaoke_queue SET priority_order = v_order_1 WHERE id = p_song_id_2;
    UPDATE public.karaoke_queue SET priority_order = v_order_2 WHERE id = p_song_id_1;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
