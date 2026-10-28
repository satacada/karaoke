import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient'; import type { KaraokeRoom, QueueItem, RemoteCommand } from '../types';
import { getRoomByCode, getQueueForRoom, advanceNextSong, markCommandExecuted, markSongFinished } from '../services/karaokeApi';
import { isLocalAutoDjActive, setLocalAutoDjActive, getLocalAutoDjGenre, fetchRemoteAutoDjSettings } from '../services/autoDjStateService';
import { getRamQueue, dequeueRamSong, fetchDiverseRamTrack, replenishRamQueue, clearRamQueue, setRamQueue, initializeGenreRamQueue } from '../services/autoDjRamQueueService';
import { getRoomChannelName } from '../utils/channelUtils'; import { logInfo, logError } from '../services/loggerService';

export function useTvRealtime(roomCode: string, onRemoteCommand?: (command: RemoteCommand) => void) {
  const [room, setRoom] = useState<KaraokeRoom | null>(null), [currentSong, setCurrentSong] = useState<QueueItem | null>(null);
  const [nextSongs, setNextSongs] = useState<QueueItem[]>([]), [isLoading, setIsLoading] = useState(true);
  const roomRef = useRef<KaraokeRoom | null>(null); roomRef.current = room;
  const onCommandRef = useRef(onRemoteCommand); onCommandRef.current = onRemoteCommand;
  const ramSongRef = useRef<QueueItem | null>(null), currentSongRef = useRef<QueueItem | null>(null); currentSongRef.current = currentSong;
  const nextSongsRef = useRef<QueueItem[]>([]); nextSongsRef.current = nextSongs;
  const handleNextSongRef = useRef<() => Promise<QueueItem | null>>(() => Promise.resolve(null));

  const refreshState = useCallback(async (currentRoomId?: string) => {
    const targetId = currentRoomId || roomRef.current?.id; if (!targetId) return;
    const queue = await getQueueForRoom(targetId);
    const playing = queue.find((q) => q.status === 'playing') || ramSongRef.current;
    setCurrentSong(playing);
    const queuedClient = queue.filter((q) => q.status === 'queued');
    const nxt = [...queuedClient, ...getRamQueue()];
    setNextSongs(nxt);
    broadcastSync(targetId, playing, nxt);
  }, []);

  const broadcastSync = (roomId: string, cur: QueueItem | null, nxt: QueueItem[]) => {
    const p = { currentSong: cur, nextSongs: nxt };
    supabase.channel(getRoomChannelName(roomId)).send({ type: 'broadcast', event: 'tv_sync_state', payload: p }).catch(() => {});
    supabase.channel(`tv-room-${roomId}`).send({ type: 'broadcast', event: 'tv_sync_state', payload: p }).catch(() => {});
  };

  const handleNextSong = useCallback(async () => {
    const activeRoom = roomRef.current; if (!activeRoom) return null;
    const finishedSong = currentSongRef.current;
    if (finishedSong?.id) await markSongFinished(activeRoom.id, finishedSong.id);
    let next = await advanceNextSong(activeRoom.id);
    if (next) {
      ramSongRef.current = null; setCurrentSong(next); await refreshState(activeRoom.id);
      const q = await getQueueForRoom(activeRoom.id);
      broadcastSync(activeRoom.id, next, q.filter((x) => x.status === 'queued'));
      return next;
    }
    if (activeRoom.auto_dj_enabled || isLocalAutoDjActive(activeRoom.room_code)) {
      const g = activeRoom.auto_dj_genre || getLocalAutoDjGenre(activeRoom.room_code) || 'cumbia_fiesta';
      let ramSong = dequeueRamSong(finishedSong?.video_id, g) || await fetchDiverseRamTrack(activeRoom.id, g, finishedSong?.video_id ? [finishedSong.video_id] : []);
      ramSongRef.current = ramSong; setCurrentSong(ramSong);
      const nxt = await replenishRamQueue(activeRoom.id, g, 3, ramSong.video_id);
      setNextSongs(nxt); broadcastSync(activeRoom.id, ramSong, nxt);
      return ramSong;
    }
    ramSongRef.current = null; setCurrentSong(null); await refreshState(activeRoom.id); broadcastSync(activeRoom.id, null, []); return null;
  }, [refreshState]);
  handleNextSongRef.current = handleNextSong;

  useEffect(() => {
    let isMounted = true;
    async function init() {
      setIsLoading(true); const loaded = await getRoomByCode(roomCode);
      if (!isMounted) return;
      if (!loaded) { logError(roomCode, 'tv', 'room_load_failed', `No se pudo cargar/crear la sala ${roomCode}`); setIsLoading(false); return; }
      const autoDj = await fetchRemoteAutoDjSettings(loaded.id, roomCode);
      loaded.auto_dj_enabled = autoDj.enabled; loaded.auto_dj_genre = autoDj.genre; setRoom(loaded); await refreshState(loaded.id); setIsLoading(false);
      logInfo(roomCode, 'tv', 'room_loaded', `Sala ${roomCode} conectada`, { roomId: loaded.id, autoDj });
      supabase.channel(getRoomChannelName(loaded.id)).send({ type: 'broadcast', event: 'request_tv_state', payload: {} }).catch(() => {});
    }
    init(); return () => { isMounted = false; };
  }, [roomCode, refreshState]);

  const roomId = room?.id;
  useEffect(() => {
    if (!roomId) return;
    const ch = supabase.channel(getRoomChannelName(roomId))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'karaoke_queue', filter: `room_id=eq.${roomId}` }, () => {
        refreshState(roomId);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'karaoke_commands', filter: `room_id=eq.${roomId}` }, async (p) => {
        const cmd = p.new as RemoteCommand;
        if (cmd.command === 'volume' && cmd.payload?.action === 'set_auto_dj') {
          const en = Boolean(cmd.payload.enabled), gn = String(cmd.payload.genre || 'cumbia_fiesta');
          setLocalAutoDjActive(roomCode, en, gn); setRoom((pr) => pr ? { ...pr, auto_dj_enabled: en, auto_dj_genre: gn } : pr);
        }
        if (!cmd.is_executed && onCommandRef.current) {
          if (cmd.command === 'volume' && cmd.payload?.action === 'set_promo_banners') onCommandRef.current({ ...cmd, command: 'set_promo_banners' });
          else onCommandRef.current(cmd);
          await markCommandExecuted(cmd.id);
        }
      })
      .on('broadcast', { event: 'remote_command' }, ({ payload }) => { if (onCommandRef.current && payload?.command) onCommandRef.current({ id: 'b_cmd', room_id: roomId, command: payload.command, payload: payload.payload || {}, is_executed: true, created_at: new Date().toISOString() }); })
      .on('broadcast', { event: 'admin_linked' }, () => { if (onCommandRef.current) onCommandRef.current({ id: 'b_adm', room_id: roomId, command: 'admin_linked', payload: {}, is_executed: true, created_at: new Date().toISOString() }); })
      .on('broadcast', { event: 'set_promo_banners' }, ({ payload }) => { if (onCommandRef.current && payload?.banners) onCommandRef.current({ id: 'b_l', room_id: roomId, command: 'set_promo_banners', payload: { banners: payload.banners }, is_executed: true, created_at: new Date().toISOString() }); })
      .on('broadcast', { event: 'set_tv_theme' }, ({ payload }) => { if (onCommandRef.current && payload?.theme) onCommandRef.current({ id: 'b_t', room_id: roomId, command: 'volume', payload: { action: 'set_tv_theme', theme: payload.theme }, is_executed: true, created_at: new Date().toISOString() }); })
      .on('broadcast', { event: 'set_tv_scale' }, ({ payload }) => { if (onCommandRef.current && payload?.scale) onCommandRef.current({ id: 'b_s', room_id: roomId, command: 'volume', payload: { action: 'set_tv_scale', scale: payload.scale }, is_executed: true, created_at: new Date().toISOString() }); })
      .on('broadcast', { event: 'request_tv_state' }, () => { if (currentSongRef.current || ramSongRef.current) broadcastSync(roomId, currentSongRef.current || ramSongRef.current, nextSongsRef.current); })
      .on('broadcast', { event: 'set_auto_dj' }, async ({ payload }) => {
        if (!payload) return; setLocalAutoDjActive(roomCode, Boolean(payload.enabled), payload.genre); setRoom((pr) => pr ? { ...pr, auto_dj_enabled: payload.enabled, auto_dj_genre: payload.genre } : pr);
        if (payload.genre) {
          clearRamQueue(); const qInit = initializeGenreRamQueue(roomId, payload.genre); const first = dequeueRamSong(undefined, payload.genre) || qInit[0];
          ramSongRef.current = first; setCurrentSong(first); const q = await replenishRamQueue(roomId, payload.genre, 3, first?.video_id);
          setNextSongs(q); broadcastSync(roomId, first, q);
        }
      })
      .on('broadcast', { event: 'tv_sync_state' }, ({ payload }) => {
        if (payload?.currentSong !== undefined) { ramSongRef.current = payload.currentSong; setCurrentSong(payload.currentSong); }
        if (payload?.nextSongs) { setRamQueue(payload.nextSongs); setNextSongs(payload.nextSongs); }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'karaoke_rooms', filter: `id=eq.${roomId}` }, (p) => {
        const u = p.new as KaraokeRoom; u.auto_dj_enabled = isLocalAutoDjActive(roomCode); u.auto_dj_genre = getLocalAutoDjGenre(roomCode);
        setRoom((prev) => (!prev || JSON.stringify(prev) !== JSON.stringify(u)) ? u : prev);
      }).subscribe();

    const poll = setInterval(() => { if (!document.hidden) refreshState(roomId); }, 3500), onVis = () => { if (!document.hidden) refreshState(roomId); };
    window.addEventListener('focus', onVis); document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(poll); window.removeEventListener('focus', onVis); document.removeEventListener('visibilitychange', onVis); supabase.removeChannel(ch); };
  }, [roomId, roomCode, refreshState]);

  return { room, currentSong, nextSongs, isLoading, handleNextSong, refreshState: () => roomRef.current ? refreshState(roomRef.current.id) : Promise.resolve() };
}
