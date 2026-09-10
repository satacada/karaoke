-- ==============================================================================
-- MIGRACIÓN 08: SOPORTE PARA TIEMPO DE SALA ALQUILADA POR HORAS (KTV / BOXES)
-- Archivo: supabase/migrations/08_room_rental_sessions.sql
-- Ejecutar en: Supabase Dashboard -> SQL Editor (Opcional, la app cuenta con fallback Realtime y LocalStorage)
-- ==============================================================================

-- 1. Ampliar karaoke_rooms con soporte nativo de sesión de alquiler
ALTER TABLE public.karaoke_rooms 
ADD COLUMN IF NOT EXISTS rental_duration_minutes INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rental_started_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rental_expires_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Actualizar restricción de comandos remotos en karaoke_commands
ALTER TABLE public.karaoke_commands 
DROP CONSTRAINT IF EXISTS ck_command_type;

ALTER TABLE public.karaoke_commands 
ADD CONSTRAINT ck_command_type 
CHECK (command IN ('play', 'pause', 'skip', 'previous', 'seek', 'volume', 'set_promo_banners', 'toggle_queue_lock', 'sync_master_track', 'flash_identify', 'unlink_tv', 'set_rental_time'));

NOTIFY pgrst, 'reload schema';
