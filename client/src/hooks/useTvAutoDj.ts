import { useEffect, useRef } from 'react';
import { enqueueAutoDjSong } from '../services/autoDjService';
import type { KaraokeRoom, QueueItem } from '../types';

export function useTvAutoDj(
  room: KaraokeRoom | null,
  currentSong: QueueItem | null,
  nextSongs: QueueItem[],
  refreshState: () => Promise<void>
) {
  const isQueueingRef = useRef(false);
  const lastQueuedAtRef = useRef(0);

  useEffect(() => {
    if (!room || !room.auto_dj_enabled) return;
    if (room.status === 'closed' || room.status === 'paused') return;
    if (nextSongs.length > 0) return;
    if (isQueueingRef.current) return;

    const now = Date.now();
    if (now - lastQueuedAtRef.current < 8000) return;

    let isMounted = true;
    isQueueingRef.current = true;
    lastQueuedAtRef.current = now;

    const timer = setTimeout(async () => {
      try {
        const ok = await enqueueAutoDjSong(room.id, room.auto_dj_genre);
        if (ok && isMounted) {
          await refreshState();
        }
      } catch (err) {
        console.error('Auto-DJ queueing error:', err);
      } finally {
        if (isMounted) isQueueingRef.current = false;
      }
    }, currentSong ? 1500 : 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      isQueueingRef.current = false;
    };
  }, [room?.id, room?.auto_dj_enabled, room?.auto_dj_genre, room?.status, currentSong?.id, nextSongs.length, refreshState]);
}
