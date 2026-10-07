import { useEffect, useRef } from 'react';
import { enqueueAutoDjSong } from '../services/autoDjService';
import type { KaraokeRoom, QueueItem } from '../types';

import { isLocalAutoDjActive, getLocalAutoDjGenre } from '../services/autoDjStateService';

export function useTvAutoDj(
  room: KaraokeRoom | null,
  currentSong: QueueItem | null,
  nextSongs: QueueItem[],
  refreshState: () => Promise<void>,
  onAdvanceIfIdle?: () => void,
  roomCode: string = 'FIESTA'
) {
  const isQueueingRef = useRef(false);
  const lastQueuedAtRef = useRef(0);
  const refreshRef = useRef(refreshState); refreshRef.current = refreshState;
  const advanceRef = useRef(onAdvanceIfIdle); advanceRef.current = onAdvanceIfIdle;

  const isAutoDjEnabled = Boolean(room?.auto_dj_enabled) || isLocalAutoDjActive(roomCode);
  const roomId = room?.id;
  const genre = room?.auto_dj_genre || getLocalAutoDjGenre(roomCode) || 'cumbia_fiesta';
  const status = room?.status;
  const hasCurrentSong = Boolean(currentSong);
  const nextCount = nextSongs.length;

  useEffect(() => {
    if (!roomId || !isAutoDjEnabled) return;
    if (status === 'closed' || status === 'paused') return;

    // Si ya hay temas de invitados reales en cola, no encolar Auto-DJ
    const hasGuestSongs = nextSongs.some((s) => !s.requested_by.includes('Auto-DJ'));
    if (hasGuestSongs) return;

    // Mantener una lista buffer de 3 canciones como mínimo
    if (nextCount >= 3) return;
    if (isQueueingRef.current) return;

    const now = Date.now();
    if (now - lastQueuedAtRef.current < 2500) return;

    let isMounted = true;
    isQueueingRef.current = true;
    lastQueuedAtRef.current = now;

    const delayMs = hasCurrentSong ? 1500 : 300;
    const timer = setTimeout(async () => {
      try {
        const ok = await enqueueAutoDjSong(roomId, genre);
        if (ok && isMounted) {
          await refreshRef.current();
          if (!hasCurrentSong && advanceRef.current) {
            advanceRef.current();
          }
        }
      } catch (err) {
        console.error('Auto-DJ continuous queueing error:', err);
      } finally {
        if (isMounted) isQueueingRef.current = false;
      }
    }, delayMs);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      isQueueingRef.current = false;
    };
  }, [roomId, isAutoDjEnabled, genre, status, hasCurrentSong, nextCount]);
}
