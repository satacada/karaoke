-- ==============================================================================
-- MIGRACIÓN 05: FUNCIONALIDADES AVANZADAS DE ROCKOLA
-- Archivo: supabase/migrations/05_rockola_features.sql
-- ==============================================================================

-- 1. Soporte para control de horario / Última ronda y Auto-DJ en salas
ALTER TABLE public.karaoke_rooms
ADD COLUMN IF NOT EXISTS is_queue_locked BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_dj_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_dj_genre TEXT NOT NULL DEFAULT 'rock_nacional',
ADD COLUMN IF NOT EXISTS promo_banners JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2. Soporte para votos / likes comunitarios en temas de la fila
ALTER TABLE public.karaoke_queue
ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS liked_by JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 3. Función RPC para dar / quitar like de manera concurrente y segura
CREATE OR REPLACE FUNCTION public.fn_toggle_song_like(
    p_song_id UUID,
    p_guest_name TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_likes_count INTEGER;
    v_liked_by JSONB;
    v_already_liked BOOLEAN;
BEGIN
    SELECT likes_count, COALESCE(liked_by, '[]'::jsonb)
    INTO v_likes_count, v_liked_by
    FROM public.karaoke_queue
    WHERE id = p_song_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Song not found');
    END IF;

    -- Verificar si el usuario ya dio like
    v_already_liked := v_liked_by ? p_guest_name;

    IF v_already_liked THEN
        -- Quitar like
        v_liked_by := (
            SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
            FROM jsonb_array_elements_text(v_liked_by) elem
            WHERE elem != p_guest_name
        );
        v_likes_count := GREATEST(0, v_likes_count - 1);
    ELSE
        -- Agregar like
        v_liked_by := v_liked_by || to_jsonb(p_guest_name);
        v_likes_count := v_likes_count + 1;
    END IF;

    UPDATE public.karaoke_queue
    SET likes_count = v_likes_count,
        liked_by = v_liked_by
    WHERE id = p_song_id;

    RETURN jsonb_build_object(
        'success', true,
        'liked', NOT v_already_liked,
        'likes_count', v_likes_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
