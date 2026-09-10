import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getRoomByCode, getQueueForRoom } from '../services/karaokeApi';
import type { KaraokeRoom, QueueItem } from '../types';

export function useGuestRealtime(roomCode: string = 'FIESTA') {
  const [room, setRoom] = useState<KaraokeRoom | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
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
    const uid = Math.random().toString(36).slice(2, 7);
    const channel = supabase
      .channel(`guest-rt-${roomId}-${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'karaoke_queue', filter: `room_id=eq.${roomId}` }, () => refreshQueue(roomId))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'karaoke_rooms', filter: `id=eq.${roomId}` }, (p) => setRoom(p.new as KaraokeRoom))
      .subscribe();

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

  return { room, queue, setRoom, setQueue, refreshQueue, isLoading };
}
