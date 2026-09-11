import { useRef, useState, useCallback, useEffect, type FC } from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';
import { useTvRealtime } from '../../hooks/useTvRealtime';
import { useTvAutoDj } from '../../hooks/useTvAutoDj';
import { useMediaSession } from '../../hooks/useMediaSession';
import { useWakeLock } from '../../hooks/useWakeLock';
import { useTvVoiceControl } from '../../hooks/useTvVoiceControl';
import { useTvRemoteHandler } from '../../hooks/useTvRemoteHandler';
import { TvPlayer, type TvPlayerRef } from './TvPlayer';
import { TvIdleScreen } from './TvIdleScreen';
import { TvNowPlayingHUD } from './TvNowPlayingHUD';
import { TvNextQueueTicker } from './TvNextQueueTicker';
import { TvThemeFrame } from './TvThemeFrame';
import { TvRentalBadge } from './TvRentalBadge';
import { TvVoiceHUD } from './TvVoiceHUD';
import { TvViewOverlays } from './TvViewOverlays';
import { TvFloatingReactions } from './TvFloatingReactions';
import { updatePlaybackTick, updateRoomSettings } from '../../services/karaokeApi';
import { enqueueAutoDjSong, purgeAutoDjSongs } from '../../services/autoDjService';
import { setLocalAutoDjActive } from '../../services/autoDjStateService';
import { getJoinUrl } from '../../utils/appUrl';
import { supabase } from '../../lib/supabaseClient';
import type { TvScale } from '../../types';

const SCALE_MAP: Record<TvScale, number> = { compact: 0.85, normal: 1.0, large: 1.15, xl: 1.30 };

export const TvView: FC<{ roomCode?: string; onUnlink?: () => void; onSwitchToHost?: () => void }> = ({ roomCode = 'FIESTA', onUnlink, onSwitchToHost }) => {
  const playerRef = useRef<TvPlayerRef>(null);
  const lastSyncRef = useRef<number>(0);
  const handleNextSongRef = useRef<() => void>(() => {});
  const handleStartAutoDjRef = useRef<() => void>(() => {});
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [isStartingAutoDj, setIsStartingAutoDj] = useState(false);

  const { isPaused, setIsPaused, isFlashing, banners, setBanners, rentalSession, tvTheme, tvScale, handleRemoteCommand } =
    useTvRemoteHandler(roomCode, playerRef, handleNextSongRef, handleStartAutoDjRef, onUnlink);

  const { room, currentSong, nextSongs, isLoading, handleNextSong, refreshState } = useTvRealtime(roomCode, handleRemoteCommand);
  handleNextSongRef.current = handleNextSong;
  useTvAutoDj(room, currentSong, nextSongs, refreshState, handleNextSong);
  useWakeLock(Boolean(currentSong));
  useMediaSession(currentSong, room?.name || 'Rockola', room?.is_playing !== false, {
    onPlay: () => { playerRef.current?.play(); setIsPaused(false); }, onPause: () => { playerRef.current?.pause(); setIsPaused(true); }, onNext: () => handleNextSongRef.current(),
  });

  const handleStartAutoDj = useCallback(async () => {
    if (!room || isStartingAutoDj) return;
    setIsStartingAutoDj(true);
    try {
      setLocalAutoDjActive(roomCode, true, room.auto_dj_genre);
      supabase.channel(`tv-room-${room.id}`).send({ type: 'broadcast', event: 'set_auto_dj', payload: { enabled: true, genre: room.auto_dj_genre } }).catch(() => {});
      await updateRoomSettings(room.id, { is_playing: true });
      if (currentSong) { await refreshState(); return; }
      if (nextSongs.length === 0) await enqueueAutoDjSong(room.id, room.auto_dj_genre);
      await handleNextSongRef.current();
    } catch (err) { console.error('Auto-DJ start error:', err); }
    finally { setIsStartingAutoDj(false); }
  }, [room, roomCode, isStartingAutoDj, currentSong, nextSongs.length, refreshState]);
  handleStartAutoDjRef.current = handleStartAutoDj;

  const handleStopAutoDj = useCallback(async () => {
    if (!room) return;
    setLocalAutoDjActive(roomCode, false);
    supabase.channel(`tv-room-${room.id}`).send({ type: 'broadcast', event: 'set_auto_dj', payload: { enabled: false } }).catch(() => {});
    await purgeAutoDjSongs(room.id);
    await refreshState();
  }, [room, roomCode, refreshState]);

  const { isListening, lastCommand, isSupported, startVoice } = useTvVoiceControl({
    onPause: () => { playerRef.current?.pause(); setIsPaused(true); }, onPlay: () => { playerRef.current?.play(); setIsPaused(false); handleStartAutoDj(); },
    onNext: () => handleNextSong(), onStartAutoDj: handleStartAutoDj, onStopAutoDj: handleStopAutoDj,
  });

  useEffect(() => {
    if (room?.promo_banners?.length) { setBanners(room.promo_banners); try { localStorage.setItem(`tv_banners_${roomCode}`, JSON.stringify(room.promo_banners)); } catch {} }
  }, [room?.promo_banners, roomCode]);

  useEffect(() => {
    if (!isLoading && !currentSong && nextSongs.length > 0) handleNextSongRef.current();
  }, [isLoading, currentSong, nextSongs.length]);

  const handlePlayerError = useCallback(() => {
    setErrorNotice('Video restringido en YouTube. Saltando...'); setTimeout(() => { setErrorNotice(null); handleNextSongRef.current(); }, 2000);
  }, []);

  const handleTimeUpdate = useCallback((curr: number, dur: number) => {
    setCurrentTime(curr); setDuration(dur); const now = Date.now();
    if (room && now - lastSyncRef.current > 3000) { lastSyncRef.current = now; updatePlaybackTick(room.id, true, curr).catch(() => {}); }
  }, [room]);

  if (isLoading) return (<div className="w-full h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3"><div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /><p className="text-zinc-400 font-mono text-sm tracking-widest uppercase">Conectando a Sala {roomCode}...</p></div>);

  const joinUrl = getJoinUrl(roomCode);
  const scaleFactor = SCALE_MAP[tvScale] || 1.0;
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {isFlashing && (<div className="absolute inset-0 border-8 border-emerald-400 pointer-events-none z-50 flex items-center justify-center bg-emerald-950/20 animate-pulse"><span className="px-6 py-3 rounded-2xl bg-emerald-500 text-zinc-950 font-black text-xl shadow-2xl flex items-center gap-2"><Sparkles className="w-6 h-6" />⚡ PANTALLA IDENTIFICADA: {room?.zone_name || room?.name}</span></div>)}
      {errorNotice && <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-rose-600/90 backdrop-blur-md text-white px-5 py-2 rounded-2xl shadow-2xl border border-rose-400/40 text-sm font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-300 animate-pulse" /><span>{errorNotice}</span></div>}
      <div className="absolute top-0 left-0 z-40 pointer-events-none" style={{ transform: `scale(${scaleFactor})`, transformOrigin: 'top left' }}>
        <TvRentalBadge rentalSession={rentalSession} className="absolute top-4 left-4 z-40 pointer-events-auto" />
        {currentSong && <TvNextQueueTicker queue={nextSongs} />}
      </div>
      <TvVoiceHUD isSupported={isSupported} isListening={isListening} lastCommand={lastCommand} onToggleVoice={startVoice} />
      {!currentSong ? (
        <TvIdleScreen roomCode={roomCode} joinUrl={joinUrl} roomName={room?.name || 'Rockola Digital Live'} zoneName={room?.zone_name} status={room?.status} banners={banners} autoDjActive={Boolean(room?.auto_dj_enabled)} onStartAutoDj={handleStartAutoDj} isStartingAutoDj={isStartingAutoDj} onSwitchToHost={onSwitchToHost} />
      ) : (
        <>
          <TvThemeFrame theme={tvTheme}><TvPlayer ref={playerRef} videoId={currentSong.video_id} onEnded={handleNextSong} onError={handlePlayerError} onTimeUpdate={handleTimeUpdate} rentalSession={rentalSession} onPlayingStateChange={(pl) => { setIsPaused(!pl); if (room) updatePlaybackTick(room.id, pl, currentTime).catch(() => {}); }} /></TvThemeFrame>
          <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none" style={{ transform: `scale(${scaleFactor})`, transformOrigin: 'bottom center' }}><TvNowPlayingHUD song={currentSong} currentTime={currentTime} duration={duration} isPaused={isPaused} onTogglePlayPause={() => playerRef.current?.togglePlayPause()} /></div>
        </>
      )}
      <div className="absolute top-0 right-0 z-40 pointer-events-none" style={{ transform: `scale(${scaleFactor})`, transformOrigin: 'top right' }}><TvViewOverlays roomCode={roomCode} roomName={room?.zone_name || room?.name} joinUrl={joinUrl} currentSong={currentSong} banners={banners} showUnlinkModal={showUnlinkModal} setShowUnlinkModal={setShowUnlinkModal} onUnlink={onUnlink} onSwitchToHost={onSwitchToHost} /></div>
      <TvFloatingReactions roomCode={roomCode} />
    </div>
  );
};
