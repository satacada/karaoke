-- ==============================================================================
-- MIGRACIÓN DDL INICIAL OPTIMIZADA: SISTEMA DE KARAOKE COLABORATIVO
-- Archivo: supabase/migrations/01_initial_schema.sql
-- Motor: PostgreSQL 15+ (Supabase)
-- Estándares: supabase-postgres-best-practices (v1.1.1)
-- ==============================================================================

-- 1. Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Limpieza idempotente
DROP TABLE IF EXISTS public.karaoke_history CASCADE;
DROP TABLE IF EXISTS public.karaoke_commands CASCADE;
DROP TABLE IF EXISTS public.karaoke_queue CASCADE;
DROP TABLE IF EXISTS public.karaoke_guests CASCADE;
DROP TABLE IF EXISTS public.karaoke_rooms CASCADE;
DROP FUNCTION IF EXISTS public.fn_set_updated_at CASCADE;

-- ------------------------------------------------------------------------------
-- 3. Función Utilidad: Actualizador Automático de Timestamp 'updated_at'
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 4. Tabla: karaoke_rooms (Salas y Estado de Reproducción de la TV)
-- ------------------------------------------------------------------------------
CREATE TABLE public.karaoke_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT NOT NULL UNIQUE CONSTRAINT ck_rooms_code_length CHECK (char_length(room_code) BETWEEN 3 AND 8),
    host_pin TEXT NOT NULL DEFAULT '1234' CONSTRAINT ck_rooms_pin_length CHECK (char_length(host_pin) BETWEEN 4 AND 8),
    name TEXT NOT NULL DEFAULT 'Fiesta Karaoke' CONSTRAINT ck_rooms_name_length CHECK (char_length(name) <= 100),
    status TEXT NOT NULL DEFAULT 'active' CONSTRAINT ck_rooms_status CHECK (status IN ('active', 'paused', 'closed')),
    current_song_id UUID,
    is_playing BOOLEAN NOT NULL DEFAULT false,
    current_time_seconds INTEGER NOT NULL DEFAULT 0 CONSTRAINT ck_rooms_time_non_negative CHECK (current_time_seconds >= 0),
    volume_percent INTEGER NOT NULL DEFAULT 100 CONSTRAINT ck_rooms_volume_range CHECK (volume_percent BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.karaoke_rooms IS 'Salas de fiesta de karaoke activas y estado de reproducción en la TV.';
COMMENT ON COLUMN public.karaoke_rooms.room_code IS 'Código alfanumérico único para unirse escaneando QR o ingresando URL.';
COMMENT ON COLUMN public.karaoke_rooms.host_pin IS 'PIN de seguridad para el celular del anfitrión (control DJ).';

CREATE TRIGGER tr_karaoke_rooms_updated_at
BEFORE UPDATE ON public.karaoke_rooms
FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- ------------------------------------------------------------------------------
-- 5. Tabla: karaoke_guests (Invitados conectados vía 4G/5G)
-- ------------------------------------------------------------------------------
CREATE TABLE public.karaoke_guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.karaoke_rooms(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL CONSTRAINT ck_guests_token_length CHECK (char_length(session_token) <= 64),
    guest_name TEXT NOT NULL CONSTRAINT ck_guests_name_length CHECK (char_length(guest_name) BETWEEN 1 AND 50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_guest_session_per_room UNIQUE (room_id, session_token)
);

COMMENT ON TABLE public.karaoke_guests IS 'Registro de invitados en red celular 4G/5G identificados por sesión.';

-- ------------------------------------------------------------------------------
-- 6. Tabla: karaoke_queue (Cola de Canciones FIFO & Reordenable)
-- ------------------------------------------------------------------------------
CREATE TABLE public.karaoke_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.karaoke_rooms(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES public.karaoke_guests(id) ON DELETE SET NULL,
    video_id TEXT NOT NULL CONSTRAINT ck_queue_video_id CHECK (char_length(video_id) BETWEEN 8 AND 20),
    title TEXT NOT NULL CONSTRAINT ck_queue_title_length CHECK (char_length(title) <= 250),
    author TEXT NOT NULL DEFAULT 'Desconocido' CONSTRAINT ck_queue_author_length CHECK (char_length(author) <= 100),
    thumbnail_url TEXT,
    duration_seconds INTEGER NOT NULL DEFAULT 180 CONSTRAINT ck_queue_duration_positive CHECK (duration_seconds > 0),
    duration_text TEXT NOT NULL DEFAULT '3:00' CONSTRAINT ck_queue_duration_text CHECK (char_length(duration_text) <= 10),
    requested_by TEXT NOT NULL CONSTRAINT ck_queue_requested_by CHECK (char_length(requested_by) <= 50),
    priority_order INTEGER NOT NULL DEFAULT 1 CONSTRAINT ck_queue_priority_positive CHECK (priority_order >= 1),
    status TEXT NOT NULL DEFAULT 'queued' 
        CONSTRAINT ck_queue_status CHECK (status IN ('queued', 'playing', 'finished', 'skipped', 'purged_by_host', 'cancelled_by_guest')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ
);

COMMENT ON TABLE public.karaoke_queue IS 'Lista de canciones solicitadas con orden ordinal y trazabilidad de estado.';

-- Clave foránea circular controlada de la canción actual
ALTER TABLE public.karaoke_rooms
ADD CONSTRAINT fk_rooms_current_song
FOREIGN KEY (current_song_id) 
REFERENCES public.karaoke_queue(id) 
ON DELETE SET NULL;

-- ------------------------------------------------------------------------------
-- 7. Tabla: karaoke_commands (Comandos Remotos: Celular Anfitrión -> Android TV)
-- ------------------------------------------------------------------------------
CREATE TABLE public.karaoke_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.karaoke_rooms(id) ON DELETE CASCADE,
    command TEXT NOT NULL CONSTRAINT ck_command_type CHECK (command IN ('play', 'pause', 'skip', 'previous', 'seek', 'volume')),
    payload JSONB DEFAULT '{}'::jsonb,
    is_executed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.karaoke_commands IS 'Canal de comandos remotos emitidos desde el celular del DJ hacia la TV.';

-- ------------------------------------------------------------------------------
-- 8. Tabla: karaoke_history (Historial de Canciones de la Noche)
-- ------------------------------------------------------------------------------
CREATE TABLE public.karaoke_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.karaoke_rooms(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    author TEXT DEFAULT 'Desconocido',
    requested_by TEXT NOT NULL,
    played_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.karaoke_history IS 'Registro de auditoría de canciones reproducidas durante la sesión.';

-- ------------------------------------------------------------------------------
-- 9. Índices Optimizados (Cumplimiento de Buenas Prácticas Supabase)
-- ------------------------------------------------------------------------------

-- Regla: Foreign Keys deben estar indexadas explícitamente para JOINs y CASCADEs rápidos
CREATE INDEX idx_fk_guests_room_id ON public.karaoke_guests (room_id);
CREATE INDEX idx_fk_queue_room_id ON public.karaoke_queue (room_id);
CREATE INDEX idx_fk_queue_guest_id ON public.karaoke_queue (guest_id);
CREATE INDEX idx_fk_commands_room_id ON public.karaoke_commands (room_id);
CREATE INDEX idx_fk_history_room_id ON public.karaoke_history (room_id);
CREATE INDEX idx_fk_rooms_current_song ON public.karaoke_rooms (current_song_id);

-- Regla: Índices parciales para optimizar consultas en rutas calientes (Hot Paths)
CREATE UNIQUE INDEX idx_rooms_code_upper ON public.karaoke_rooms (upper(room_code));
CREATE INDEX idx_queue_active_order ON public.karaoke_queue (room_id, priority_order) WHERE status = 'queued';
CREATE INDEX idx_queue_guest_purge ON public.karaoke_queue (room_id, lower(requested_by)) WHERE status = 'queued';
CREATE INDEX idx_commands_pending ON public.karaoke_commands (room_id, is_executed) WHERE is_executed = false;

-- ------------------------------------------------------------------------------
-- 10. Procedimiento Almacenado: Purgar canciones de invitado ausente
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_purge_guest_songs(
    p_room_id UUID,
    p_guest_name TEXT
)
RETURNS INTEGER AS $$
DECLARE
    v_purged_count INTEGER := 0;
BEGIN
    UPDATE public.karaoke_queue
    SET status = 'purged_by_host',
        finished_at = NOW()
    WHERE room_id = p_room_id
      AND status = 'queued'
      AND LOWER(requested_by) = LOWER(TRIM(p_guest_name));
      
    GET DIAGNOSTICS v_purged_count = ROW_COUNT;

    -- Recompactar ordinales de canciones restantes (1, 2, 3...)
    WITH reordered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY priority_order ASC, requested_at ASC) AS new_order
        FROM public.karaoke_queue
        WHERE room_id = p_room_id AND status = 'queued'
    )
    UPDATE public.karaoke_queue q
    SET priority_order = r.new_order
    FROM reordered r
    WHERE q.id = r.id;

    RETURN v_purged_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 11. Procedimiento Almacenado: Reordenar cola atómicamente
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_reorder_queue(
    p_room_id UUID,
    p_song_id UUID,
    p_new_position INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_old_position INTEGER;
BEGIN
    SELECT priority_order INTO v_old_position
    FROM public.karaoke_queue
    WHERE id = p_song_id AND room_id = p_room_id AND status = 'queued';

    IF v_old_position IS NULL OR v_old_position = p_new_position THEN
        RETURN FALSE;
    END IF;

    IF v_old_position < p_new_position THEN
        UPDATE public.karaoke_queue
        SET priority_order = priority_order - 1
        WHERE room_id = p_room_id 
          AND status = 'queued' 
          AND priority_order > v_old_position 
          AND priority_order <= p_new_position;
    ELSE
        UPDATE public.karaoke_queue
        SET priority_order = priority_order + 1
        WHERE room_id = p_room_id 
          AND status = 'queued' 
          AND priority_order >= p_new_position 
          AND priority_order < v_old_position;
    END IF;

    UPDATE public.karaoke_queue
    SET priority_order = p_new_position
    WHERE id = p_song_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 12. Procedimiento Almacenado: Avanzar a la siguiente canción
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_advance_next_song(
    p_room_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_next_song RECORD;
    v_current_song_id UUID;
BEGIN
    SELECT current_song_id INTO v_current_song_id
    FROM public.karaoke_rooms
    WHERE id = p_room_id;

    IF v_current_song_id IS NOT NULL THEN
        UPDATE public.karaoke_queue
        SET status = 'finished',
            finished_at = NOW()
        WHERE id = v_current_song_id;
        
        INSERT INTO public.karaoke_history (room_id, video_id, title, author, requested_by)
        SELECT room_id, video_id, title, author, requested_by
        FROM public.karaoke_queue
        WHERE id = v_current_song_id;
    END IF;

    SELECT * INTO v_next_song
    FROM public.karaoke_queue
    WHERE room_id = p_room_id AND status = 'queued'
    ORDER BY priority_order ASC, requested_at ASC
    LIMIT 1;

    IF v_next_song.id IS NOT NULL THEN
        UPDATE public.karaoke_queue
        SET status = 'playing',
            started_at = NOW()
        WHERE id = v_next_song.id;

        UPDATE public.karaoke_rooms
        SET current_song_id = v_next_song.id,
            is_playing = true,
            current_time_seconds = 0,
            updated_at = NOW()
        WHERE id = p_room_id;

        WITH reordered AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY priority_order ASC, requested_at ASC) AS new_order
            FROM public.karaoke_queue
            WHERE room_id = p_room_id AND status = 'queued'
        )
        UPDATE public.karaoke_queue q
        SET priority_order = r.new_order
        FROM reordered r
        WHERE q.id = r.id;

        RETURN to_jsonb(v_next_song);
    ELSE
        UPDATE public.karaoke_rooms
        SET current_song_id = NULL,
            is_playing = false,
            current_time_seconds = 0,
            updated_at = NOW()
        WHERE id = p_room_id;

        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 13. Publicaciones Supabase Realtime con Replica Identity Full
-- ------------------------------------------------------------------------------
ALTER TABLE public.karaoke_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.karaoke_queue REPLICA IDENTITY FULL;
ALTER TABLE public.karaoke_commands REPLICA IDENTITY FULL;
ALTER TABLE public.karaoke_guests REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.karaoke_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.karaoke_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.karaoke_commands;
ALTER PUBLICATION supabase_realtime ADD TABLE public.karaoke_guests;

-- ------------------------------------------------------------------------------
-- 14. Datos semilla iniciales
-- ------------------------------------------------------------------------------
INSERT INTO public.karaoke_rooms (id, room_code, host_pin, name)
VALUES ('a0000000-0000-0000-0000-000000000001', 'FIESTA', '1234', 'Karaoke Party Live')
ON CONFLICT DO NOTHING;
