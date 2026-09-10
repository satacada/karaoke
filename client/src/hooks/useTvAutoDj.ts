import { useEffect, useRef } from 'react';
import { enqueueAutoDjSong } from '../services/autoDjService';
import type { KaraokeRoom, QueueItem } from '../types';

export function useTvAutoDj(
  room: KaraokeRoom | null,
  currentSong: QueueItem | null,
  nextSongs: QueueItem[],
  refreshState: () => Promise<void>,
  onAdvanceIfIdle?: () => void
) {
  const isQueueingRef = useRef(false);
  const lastQueuedAtRef = useRef(0);
  const hasUserStartedRef = useRef(false);

  useEffect(() => {
    if (room?.auto_dj_enabled && currentSong) {
      hasUserStartedRef.current = true;
    } else if (!room?.auto_dj_enabled) {
      hasUserStartedRef.current = false;
    }
  }, [room?.auto_dj_enabled, currentSong?.id]);

  useEffect(() => {
    if (!room || !room.auto_dj_enabled) return;
    if (room.status === 'closed' || room.status === 'paused') return;
    if (nextSongs.length > 0) return;
    if (isQueueingRef.current) return;

    // Solo auto-encolar si ya inició la sesión activa de música inteligente
    if (!currentSong && !hasUserStartedRef.current) return;

    const now = Date.now();
    if (now - lastQueuedAtRef.current < 4000) return;

    let isMounted = true;
    isQueueingRef.current = true;
    lastQueuedAtRef.current = now;

    const delayMs = currentSong ? 2000 : 500;
    const timer = setTimeout(async () => {
      try {
        const ok = await enqueueAutoDjSong(room.id, room.auto_dj_genre);
        if (ok && isMounted) {
          await refreshState();
          if (!currentSong && onAdvanceIfIdle) {
            onAdvanceIfIdle();
          }
        }
      } catch (err) {
        console.error('Auto-DJ queueing error:', err);
      } finally {
        if (isMounted) isQueueingRef.current = false;
      }
    }, delayMs);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      isQueueingRef.current = false;
    };
  }, [
    room?.id,
    room?.auto_dj_enabled,
    room?.auto_dj_genre,
    room?.status,
    currentSong?.id,
    nextSongs.length,
    refreshState,
    onAdvanceIfIdle,
  ]);
}
