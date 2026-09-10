import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { KaraokeRoom, QueueItem, RemoteCommand } from '../types';
import { getRoomByCode, getQueueForRoom, advanceNextSong, markCommandExecuted } from '../services/karaokeApi';
import { isLocalAutoDjActive, setLocalAutoDjActive, getLocalAutoDjGenre } from '../services/autoDjStateService';

export function useTvRealtime(roomCode: string, onRemoteCommand?: (command: RemoteCommand) => void) {
  const [room, setRoom] = useState<KaraokeRoom | null>(null);
  const [currentSong, setCurrentSong] = useState<QueueItem | null>(null);
  const [nextSongs, setNextSongs] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const roomRef = useRef<KaraokeRoom | null>(null); roomRef.current = room;
  const onCommandRef = useRef(onRemoteCommand); onCommandRef.current = onRemoteCommand;

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

  const refreshRoomState = useCallback(async () => {
    if (roomRef.current) await refreshState(roomRef.current.id);
  }, [refreshState]);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      setIsLoading(true);
      const loaded = await getRoomByCode(roomCode);
      if (!isMounted || !loaded) { setIsLoading(false); return; }
      if (isLocalAutoDjActive(roomCode)) {
        loaded.auto_dj_enabled = true;
        loaded.auto_dj_genre = getLocalAutoDjGenre(roomCode) || loaded.auto_dj_genre;
      }
      setRoom(loaded);
      await refreshState(loaded.id);
      setIsLoading(false);
    }
    init();
    return () => { isMounted = false; };
  }, [roomCode, refreshState]);

  const roomId = room?.id;
  useEffect(() => {
    if (!roomId) return;
    const uid = Math.random().toString(36).slice(2, 7);
    const channel = supabase
      .channel(`tv-rt-${roomId}-${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'karaoke_queue', filter: `room_id=eq.${roomId}` }, () => refreshState(roomId))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'karaoke_commands', filter: `room_id=eq.${roomId}` }, async (payload) => {
        const command = payload.new as RemoteCommand;
        if (!command.is_executed && onCommandRef.current) {
          if (command.command === 'volume' && command.payload?.action === 'set_promo_banners') onCommandRef.current({ ...command, command: 'set_promo_banners' });
          else onCommandRef.current(command);
          await markCommandExecuted(command.id);
        }
      })
      .on('broadcast', { event: 'set_promo_banners' }, ({ payload }) => {
        if (onCommandRef.current && payload?.banners) onCommandRef.current({ id: 'b_local', room_id: roomId, command: 'set_promo_banners', payload: { banners: payload.banners }, is_executed: true, created_at: new Date().toISOString() });
      })
      .on('broadcast', { event: 'set_tv_theme' }, ({ payload }) => {
        if (onCommandRef.current && payload?.theme) onCommandRef.current({ id: 'b_theme', room_id: roomId, command: 'volume', payload: { action: 'set_tv_theme', theme: payload.theme }, is_executed: true, created_at: new Date().toISOString() });
      })
      .on('broadcast', { event: 'set_auto_dj' }, ({ payload }) => {
        if (payload) {
          setLocalAutoDjActive(roomCode, Boolean(payload.enabled), payload.genre);
          setRoom((p) => p ? { ...p, auto_dj_enabled: payload.enabled, auto_dj_genre: payload.genre } : p);
        }
      })
      .on('broadcast', { event: 'set_rental_time' }, ({ payload }) => {
        if (onCommandRef.current && payload) onCommandRef.current({ id: 'b_rent', room_id: roomId, command: 'set_rental_time', payload: { rental_session: payload }, is_executed: true, created_at: new Date().toISOString() });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'karaoke_rooms', filter: `id=eq.${roomId}` }, (payload) => {
        const updated = payload.new as KaraokeRoom;
        if (isLocalAutoDjActive(roomCode)) {
          updated.auto_dj_enabled = true;
          updated.auto_dj_genre = getLocalAutoDjGenre(roomCode) || updated.auto_dj_genre;
        }
        setRoom((prev) => (!prev || JSON.stringify(prev) !== JSON.stringify(updated)) ? updated : prev);
      })
      .subscribe();

    const pollTimer = setInterval(() => { if (!document.hidden) refreshState(roomId); }, 3500);
    const onVis = () => { if (!document.hidden) refreshState(roomId); };
    window.addEventListener('focus', onVis); document.addEventListener('visibilitychange', onVis);

    return () => {
      clearInterval(pollTimer); window.removeEventListener('focus', onVis); document.removeEventListener('visibilitychange', onVis);
      supabase.removeChannel(channel);
    };
  }, [roomId, roomCode, refreshState]);

  return { room, currentSong, nextSongs, isLoading, handleNextSong, refreshState: refreshRoomState };
}
