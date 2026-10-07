import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { KaraokeRoom, QueueItem, RemoteCommand } from '../types';
import { getRoomByCode, getQueueForRoom, advanceNextSong, markCommandExecuted } from '../services/karaokeApi';
import { isLocalAutoDjActive, setLocalAutoDjActive, getLocalAutoDjGenre, fetchRemoteAutoDjSettings } from '../services/autoDjStateService';
import { getRamQueue, dequeueRamSong, fetchDailySeedRamTrack, replenishRamQueue } from '../services/autoDjRamQueueService';
import { getRoomChannelName } from '../utils/channelUtils';
import { logInfo } from '../services/loggerService';

export function useTvRealtime(roomCode: string, onRemoteCommand?: (command: RemoteCommand) => void) {
  const [room, setRoom] = useState<KaraokeRoom | null>(null);
  const [currentSong, setCurrentSong] = useState<QueueItem | null>(null);
  const [nextSongs, setNextSongs] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const roomRef = useRef<KaraokeRoom | null>(null); roomRef.current = room;
  const onCommandRef = useRef(onRemoteCommand); onCommandRef.current = onRemoteCommand;
  const ramSongRef = useRef<QueueItem | null>(null);

  const refreshState = useCallback(async (currentRoomId?: string) => {
    const targetId = currentRoomId || roomRef.current?.id;
    if (!targetId) return;
    const queue = await getQueueForRoom(targetId);
    const playing = queue.find((q) => q.status === 'playing') || null;
    const queued = queue.filter((q) => q.status === 'queued');
    setCurrentSong(playing || ramSongRef.current);
    setNextSongs([...queued, ...getRamQueue()]);
  }, []);

  const handleNextSong = useCallback(async () => {
    const activeRoom = roomRef.current;
    if (!activeRoom) return null;
    let next = await advanceNextSong(activeRoom.id);
    if (next) { ramSongRef.current = null; await refreshState(activeRoom.id); return next; }
    if (activeRoom.auto_dj_enabled || isLocalAutoDjActive(activeRoom.room_code)) {
      const g = activeRoom.auto_dj_genre || getLocalAutoDjGenre(activeRoom.room_code) || 'cumbia_fiesta';
      let ramSong = dequeueRamSong() || await fetchDailySeedRamTrack(activeRoom.id, g);
      ramSongRef.current = ramSong; setCurrentSong(ramSong);
      replenishRamQueue(activeRoom.id, g, 3).then(() => setNextSongs(getRamQueue()));
      return ramSong;
    }
    ramSongRef.current = null; setCurrentSong(null); await refreshState(activeRoom.id); return null;
  }, [refreshState]);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      setIsLoading(true);
      const loaded = await getRoomByCode(roomCode);
      if (!isMounted || !loaded) { setIsLoading(false); return; }
      const autoDj = await fetchRemoteAutoDjSettings(loaded.id, roomCode);
      loaded.auto_dj_enabled = autoDj.enabled; loaded.auto_dj_genre = autoDj.genre;
      setRoom(loaded); await refreshState(loaded.id); setIsLoading(false);
      logInfo(roomCode, 'tv', 'room_loaded', `Sala ${roomCode} conectada`, { roomId: loaded.id, autoDj });
    }
    init(); return () => { isMounted = false; };
  }, [roomCode, refreshState]);

  const roomId = room?.id;
  useEffect(() => {
    if (!roomId) return;
    const ch = supabase.channel(getRoomChannelName(roomId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'karaoke_queue', filter: `room_id=eq.${roomId}` }, () => refreshState(roomId))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'karaoke_commands', filter: `room_id=eq.${roomId}` }, async (payload) => {
        const cmd = payload.new as RemoteCommand;
        if (cmd.command === 'volume' && cmd.payload?.action === 'set_auto_dj') {
          const en = Boolean(cmd.payload.enabled); const gn = String(cmd.payload.genre || 'cumbia_fiesta');
          setLocalAutoDjActive(roomCode, en, gn); setRoom((p) => p ? { ...p, auto_dj_enabled: en, auto_dj_genre: gn } : p);
        }
        if (!cmd.is_executed && onCommandRef.current) {
          if (cmd.command === 'volume' && cmd.payload?.action === 'set_promo_banners') onCommandRef.current({ ...cmd, command: 'set_promo_banners' });
          else onCommandRef.current(cmd);
          await markCommandExecuted(cmd.id);
        }
      })
      .on('broadcast', { event: 'set_promo_banners' }, ({ payload }) => {
        if (onCommandRef.current && payload?.banners) onCommandRef.current({ id: 'b_local', room_id: roomId, command: 'set_promo_banners', payload: { banners: payload.banners }, is_executed: true, created_at: new Date().toISOString() });
      })
      .on('broadcast', { event: 'set_tv_theme' }, ({ payload }) => {
        if (onCommandRef.current && payload?.theme) onCommandRef.current({ id: 'b_theme', room_id: roomId, command: 'volume', payload: { action: 'set_tv_theme', theme: payload.theme }, is_executed: true, created_at: new Date().toISOString() });
      })
      .on('broadcast', { event: 'set_tv_scale' }, ({ payload }) => {
        if (onCommandRef.current && payload?.scale) onCommandRef.current({ id: 'b_scale', room_id: roomId, command: 'volume', payload: { action: 'set_tv_scale', scale: payload.scale }, is_executed: true, created_at: new Date().toISOString() });
      })
      .on('broadcast', { event: 'set_auto_dj' }, ({ payload }) => {
        if (payload) {
          setLocalAutoDjActive(roomCode, Boolean(payload.enabled), payload.genre);
          setRoom((p) => p ? { ...p, auto_dj_enabled: payload.enabled, auto_dj_genre: payload.genre } : p);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'karaoke_rooms', filter: `id=eq.${roomId}` }, (payload) => {
        const updated = payload.new as KaraokeRoom;
        updated.auto_dj_enabled = isLocalAutoDjActive(roomCode); updated.auto_dj_genre = getLocalAutoDjGenre(roomCode);
        setRoom((prev) => (!prev || JSON.stringify(prev) !== JSON.stringify(updated)) ? updated : prev);
      })
      .subscribe();

    const poll = setInterval(() => { if (!document.hidden) refreshState(roomId); }, 3500);
    const onVis = () => { if (!document.hidden) refreshState(roomId); };
    window.addEventListener('focus', onVis); document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(poll); window.removeEventListener('focus', onVis); document.removeEventListener('visibilitychange', onVis); supabase.removeChannel(ch); };
  }, [roomId, roomCode, refreshState]);

  return { room, currentSong, nextSongs, isLoading, handleNextSong, refreshState: () => roomRef.current ? refreshState(roomRef.current.id) : Promise.resolve() };
}
