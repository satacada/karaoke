import { supabase } from '../lib/supabaseClient';
import { getRoomChannelName } from '../utils/channelUtils';

const KEY_ENABLED = 'tv_auto_dj_active_';
const KEY_GENRE = 'tv_auto_dj_genre_';
const DEFAULT_GENRE = 'cumbia_fiesta';

export function isLocalAutoDjActive(roomCode: string): boolean {
  try {
    const val = localStorage.getItem(`${KEY_ENABLED}${roomCode}`);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setLocalAutoDjActive(roomCode: string, active: boolean, genre?: string): void {
  try {
    localStorage.setItem(`${KEY_ENABLED}${roomCode}`, active ? 'true' : 'false');
    if (genre) {
      localStorage.setItem(`${KEY_GENRE}${roomCode}`, genre);
    }
  } catch {}
}

export function getLocalAutoDjGenre(roomCode: string): string {
  try {
    return localStorage.getItem(`${KEY_GENRE}${roomCode}`) || DEFAULT_GENRE;
  } catch {
    return DEFAULT_GENRE;
  }
}

export async function saveRemoteAutoDjSettings(
  roomId: string,
  roomCode: string,
  enabled: boolean,
  genre: string
): Promise<void> {
  setLocalAutoDjActive(roomCode, enabled, genre);
  try {
    const ch = getRoomChannelName(roomId);
    supabase.channel(ch).send({
      type: 'broadcast',
      event: 'set_auto_dj',
      payload: { enabled, genre },
    }).catch(() => {});

    await supabase.from('karaoke_commands').insert([
      {
        room_id: roomId,
        command: 'volume',
        payload: { action: 'set_auto_dj', enabled, genre },
        is_executed: true,
      },
    ]);
  } catch (err) {
    console.error('Error saving remote Auto-DJ settings:', err);
  }
}

export async function fetchRemoteAutoDjSettings(
  roomId: string,
  roomCode: string
): Promise<{ enabled: boolean; genre: string }> {
  try {
    const { data } = await supabase
      .from('karaoke_commands')
      .select('payload')
      .eq('room_id', roomId)
      .eq('command', 'volume')
      .filter('payload->>action', 'eq', 'set_auto_dj')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.payload && typeof data.payload === 'object') {
      const payload = data.payload as { enabled?: boolean; genre?: string };
      const enabled = payload.enabled !== undefined ? Boolean(payload.enabled) : true;
      const genre = payload.genre || DEFAULT_GENRE;
      setLocalAutoDjActive(roomCode, enabled, genre);
      return { enabled, genre };
    }
  } catch (err) {
    console.warn('Fallback reading local Auto-DJ settings:', err);
  }

  const enabled = isLocalAutoDjActive(roomCode);
  const genre = getLocalAutoDjGenre(roomCode) || DEFAULT_GENRE;
  return { enabled, genre };
}
