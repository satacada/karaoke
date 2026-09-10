import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { KaraokeRoom, QueueItem, RemoteCommand } from '../types';
import {
  getRoomByCode,
  getQueueForRoom,
  advanceNextSong,
  markCommandExecuted,
} from '../services/karaokeApi';

export function useTvRealtime(
  roomCode: string,
  onRemoteCommand?: (command: RemoteCommand) => void
) {
  const [room, setRoom] = useState<KaraokeRoom | null>(null);
  const [currentSong, setCurrentSong] = useState<QueueItem | null>(null);
  const [nextSongs, setNextSongs] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const roomRef = useRef<KaraokeRoom | null>(null);
  roomRef.current = room;
  const onCommandRef = useRef(onRemoteCommand);
  onCommandRef.current = onRemoteCommand;

  const refreshState = useCallback(async (currentRoomId: string) => {
    const queue = await getQueueForRoom(currentRoomId);
    const playing = queue.find((q) => q.status === 'playing') || null;
    const queued = queue.filter((q) => q.status === 'queued');
    setCurrentSong(playing);
    setNextSongs(queued);
  }, []);

  const handleNextSong = useCallback(async () => {
    const activeRoom = roomRef.current;
    if (!activeRoom) return null;
    const next = await advanceNextSong(activeRoom.id);
    await refreshState(activeRoom.id);
    return next;
  }, [refreshState]);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      setIsLoading(true);
      const loadedRoom = await getRoomByCode(roomCode);
      if (!isMounted || !loadedRoom) {
        setIsLoading(false);
        return;
      }
      setRoom(loadedRoom);
      await refreshState(loadedRoom.id);
      setIsLoading(false);
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [roomCode, refreshState]);

  // Realtime subscription depends strictly on the room ID, preventing reconnection loops
  const roomId = room?.id;
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`tv-room-${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'karaoke_queue', filter: `room_id=eq.${roomId}` },
        () => refreshState(roomId)
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'karaoke_commands', filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const command = payload.new as RemoteCommand;
          if (!command.is_executed && onCommandRef.current) {
            onCommandRef.current(command);
            await markCommandExecuted(command.id);
          }
        }
      )
      .on('broadcast', { event: 'set_promo_banners' }, ({ payload }) => {
        if (onCommandRef.current && payload?.banners) {
          onCommandRef.current({ id: 'b_local', room_id: roomId, command: 'set_promo_banners', payload: { banners: payload.banners }, is_executed: true, created_at: new Date().toISOString() });
        }
      })
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'karaoke_rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          const updated = payload.new as KaraokeRoom;
          setRoom((prev) => {
            if (!prev) return updated;
            if (
              prev.current_song_id !== updated.current_song_id ||
              prev.status !== updated.status ||
              prev.is_queue_locked !== updated.is_queue_locked ||
              JSON.stringify(prev.promo_banners) !== JSON.stringify(updated.promo_banners)
            ) {
              return updated;
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, refreshState]);

  return {
    room,
    currentSong,
    nextSongs,
    isLoading,
    handleNextSong,
    refreshState: () => (roomRef.current ? refreshState(roomRef.current.id) : Promise.resolve()),
  };
}
