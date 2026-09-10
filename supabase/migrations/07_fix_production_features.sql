-- ==============================================================================
-- MIGRACIÓN CONSOLIDADA DE PRODUCCIÓN: ROCKOLA DIGITAL LIVE
-- Archivo: supabase/migrations/07_fix_production_features.sql
-- Ejecutar en: Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Ampliar columnas en karaoke_rooms
ALTER TABLE public.karaoke_rooms 
ADD COLUMN IF NOT EXISTS is_queue_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_dj_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_dj_genre TEXT DEFAULT 'rockola_latina',
ADD COLUMN IF NOT EXISTS promo_banners JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS zone_name TEXT DEFAULT 'Salón Principal',
ADD COLUMN IF NOT EXISTS allowed_genres TEXT[] DEFAULT ARRAY['all']::TEXT[],
ADD COLUMN IF NOT EXISTS vip_price_ars NUMERIC(10,2) DEFAULT 500.00,
ADD COLUMN IF NOT EXISTS is_synced_master BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS master_room_id UUID REFERENCES public.karaoke_rooms(id) ON DELETE SET NULL;

-- 2. Actualizar restricción de comandos remotos en karaoke_commands
ALTER TABLE public.karaoke_commands 
DROP CONSTRAINT IF EXISTS ck_command_type;

ALTER TABLE public.karaoke_commands 
ADD CONSTRAINT ck_command_type 
CHECK (command IN ('play', 'pause', 'skip', 'previous', 'seek', 'volume', 'set_promo_banners', 'toggle_queue_lock'));

-- 3. Ampliar columnas de Likes en karaoke_queue
ALTER TABLE public.karaoke_queue 
ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS liked_by TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- 4. Función RPC para traspaso de colas entre ambientes
CREATE OR REPLACE FUNCTION public.fn_transfer_room_queue(
    p_source_room_id UUID,
    p_target_room_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_target_max_priority INTEGER;
    v_transferred_count INTEGER := 0;
BEGIN
    SELECT COALESCE(MAX(priority_order), 0)
    INTO v_target_max_priority
    FROM public.karaoke_queue
    WHERE room_id = p_target_room_id AND status = 'queued';

    WITH moved_songs AS (
        UPDATE public.karaoke_queue
        SET 
            room_id = p_target_room_id,
            priority_order = v_target_max_priority + row_num
        FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY priority_order ASC, requested_at ASC) as row_num
            FROM public.karaoke_queue
            WHERE room_id = p_source_room_id AND status = 'queued'
        ) sub
        WHERE public.karaoke_queue.id = sub.id
        RETURNING public.karaoke_queue.id
    )
    SELECT COUNT(*) INTO v_transferred_count FROM moved_songs;

    RETURN jsonb_build_object('success', true, 'transferred_count', v_transferred_count);
END;
$$;

-- 5. Función RPC para Me Gusta en tiempo real
CREATE OR REPLACE FUNCTION public.fn_toggle_song_like(
    p_song_id UUID,
    p_guest_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_liked BOOLEAN;
    v_likes_count INTEGER;
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.karaoke_queue 
        WHERE id = p_song_id AND p_guest_name = ANY(liked_by)
    ) THEN
        UPDATE public.karaoke_queue
        SET 
            liked_by = array_remove(liked_by, p_guest_name),
            likes_count = GREATEST(0, likes_count - 1)
        WHERE id = p_song_id
        RETURNING likes_count INTO v_likes_count;
        v_liked := false;
    ELSE
        UPDATE public.karaoke_queue
        SET 
            liked_by = array_append(liked_by, p_guest_name),
            likes_count = likes_count + 1
        WHERE id = p_song_id
        RETURNING likes_count INTO v_likes_count;
        v_liked := true;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'liked', v_liked,
        'likes_count', v_likes_count
    );
END;
$$;

NOTIFY pgrst, 'reload schema';
