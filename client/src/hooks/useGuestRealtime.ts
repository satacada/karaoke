import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getRoomByCode, getQueueForRoom } from '../services/karaokeApi';
import { getRoomChannelName } from '../utils/channelUtils';
import type { KaraokeRoom, QueueItem } from '../types';

export function useGuestRealtime(roomCode: string = 'FIESTA') {
  const [room, setRoom] = useState<KaraokeRoom | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [tvCurrentSong, setTvCurrentSong] = useState<QueueItem | null>(null);
  const [tvNextSongs, setTvNextSongs] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const roomRef = useRef<KaraokeRoom | null>(null);
  roomRef.current = room;

  const refreshQueue = useCallback(async (targetRoomId?: string) => {
    const id = targetRoomId || roomRef.current?.id;
    if (!id) return;
    const latest = await getQueueForRoom(id);
    setQueue(latest);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      const r = await getRoomByCode(roomCode);
      if (!isMounted || !r) { setIsLoading(false); return; }
      setRoom(r);
      await refreshQueue(r.id);
      setIsLoading(false);
    }
    load();
    return () => { isMounted = false; };
  }, [roomCode, refreshQueue]);

  const roomId = room?.id;
  useEffect(() => {
    if (!roomId) return;
    const channelName = getRoomChannelName(roomId);
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'karaoke_queue', filter: `room_id=eq.${roomId}` }, () => refreshQueue(roomId))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'karaoke_rooms', filter: `id=eq.${roomId}` }, (p) => setRoom(p.new as KaraokeRoom))
      .on('broadcast', { event: 'tv_sync_state' }, ({ payload }) => {
        if (payload?.currentSong !== undefined) setTvCurrentSong(payload.currentSong);
        if (payload?.nextSongs !== undefined) setTvNextSongs(payload.nextSongs || []);
      })
      .subscribe();

    supabase.channel(channelName).send({ type: 'broadcast', event: 'request_tv_state', payload: {} }).catch(() => {});

    const pollTimer = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) refreshQueue(roomId);
    }, 3500);

    const onVisible = () => {
      if (typeof document !== 'undefined' && !document.hidden) refreshQueue(roomId);
    };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(pollTimer);
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
      supabase.removeChannel(channel);
    };
  }, [roomId, refreshQueue]);

  return { room, queue, tvCurrentSong, tvNextSongs, setRoom, setQueue, refreshQueue, isLoading };
}
