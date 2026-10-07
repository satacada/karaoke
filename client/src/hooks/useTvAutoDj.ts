import { useEffect, useRef } from 'react';
import type { KaraokeRoom, QueueItem } from '../types';
import { isLocalAutoDjActive, getLocalAutoDjGenre } from '../services/autoDjStateService';
import { getRamQueue, replenishRamQueue } from '../services/autoDjRamQueueService';

export function useTvAutoDj(
  room: KaraokeRoom | null,
  currentSong: QueueItem | null,
  nextSongs: QueueItem[],
  refreshState: () => Promise<void>,
  onAdvanceIfIdle?: () => void,
  roomCode = 'FIESTA'
) {
  const isBufferingRef = useRef(false);
  const refreshRef = useRef(refreshState); refreshRef.current = refreshState;
  const advanceRef = useRef(onAdvanceIfIdle); advanceRef.current = onAdvanceIfIdle;

  const isAutoDjEnabled = Boolean(room?.auto_dj_enabled) || isLocalAutoDjActive(roomCode);
  const roomId = room?.id;
  const genre = room?.auto_dj_genre || getLocalAutoDjGenre(roomCode) || 'cumbia_fiesta';
  const status = room?.status;
  const hasCurrentSong = Boolean(currentSong);

  useEffect(() => {
    if (!roomId || !isAutoDjEnabled) return;
    if (status === 'closed' || status === 'paused') return;

    // Si no hay canción sonando en la TV, arrancar de inmediato desde la RAM
    if (!hasCurrentSong && advanceRef.current) {
      advanceRef.current();
      return;
    }

    // Si hay pedidos reales de invitados en cola, no recargar canciones de fondo
    const hasGuestOrders = nextSongs.some((s) => !s.id.startsWith('ram_') && !s.requested_by.includes('Auto-DJ'));
    if (hasGuestOrders) return;

    // Mantener siempre el buffer de 3 canciones en la memoria RAM
    const ramBuffer = getRamQueue();
    if (ramBuffer.length >= 3 || isBufferingRef.current) return;

    let isMounted = true;
    isBufferingRef.current = true;
    replenishRamQueue(roomId, genre, 3)
      .then(() => {
        if (isMounted) refreshRef.current();
      })
      .finally(() => {
        if (isMounted) isBufferingRef.current = false;
      });

    return () => { isMounted = false; };
  }, [roomId, isAutoDjEnabled, genre, status, hasCurrentSong, nextSongs.length]);
}
