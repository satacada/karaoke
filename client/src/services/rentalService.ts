import { supabase } from '../lib/supabaseClient';
import { sendRemoteCommand } from './karaokeApi';
import type { RoomRentalSession } from '../types';

const RENTAL_KEY_PREFIX = 'karaoke_rental_room_';

export function getLocalRentalSession(roomCode: string): RoomRentalSession | null {
  try {
    const raw = localStorage.getItem(`${RENTAL_KEY_PREFIX}${roomCode}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RoomRentalSession;
    return parsed.enabled ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveRoomRental(
  roomId: string,
  roomCode: string,
  session: RoomRentalSession | null
): Promise<void> {
  const payload = session || { enabled: false, totalMinutes: 0, startedAt: 0, expiresAt: 0 };
  try {
    if (session?.enabled) {
      localStorage.setItem(`${RENTAL_KEY_PREFIX}${roomCode}`, JSON.stringify(session));
    } else {
      localStorage.removeItem(`${RENTAL_KEY_PREFIX}${roomCode}`);
    }
  } catch {}

  // 1. Broadcast en tiempo real para sincronización instantánea
  try {
    const channel = supabase.channel(`tv-room-${roomId}`);
    channel.send({
      type: 'broadcast',
      event: 'set_rental_time',
      payload,
    }).catch(() => {});
  } catch {}

  // 2. Comando remoto para TVs en segundo plano o que reconectan
  await sendRemoteCommand(roomId, 'volume', {
    action: 'set_rental_time',
    rental_session: payload,
  });
}

export function formatRentalRemaining(expiresAt: number, totalMinutes = 0): {
  text: string;
  isExpired: boolean;
  remainingSeconds: number;
  percentRemaining: number;
} {
  const diffSecs = Math.floor((expiresAt - Date.now()) / 1000);
  if (diffSecs <= 0) {
    return { text: '00:00:00', isExpired: true, remainingSeconds: 0, percentRemaining: 0 };
  }

  const hours = Math.floor(diffSecs / 3600);
  const minutes = Math.floor((diffSecs % 3600) / 60);
  const seconds = diffSecs % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const text = hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;

  const totalSecs = Math.max(1, totalMinutes * 60);
  const percentRemaining = Math.min(100, Math.max(0, (diffSecs / totalSecs) * 100));

  return { text, isExpired: false, remainingSeconds: diffSecs, percentRemaining };
}
