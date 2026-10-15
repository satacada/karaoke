import { useRef, useState, useCallback, useEffect, type FC } from 'react';
import { Sparkles, Settings } from 'lucide-react'; import { recordRestrictedVideoId } from '../../services/videoRestrictionService';
import { useTvRealtime } from '../../hooks/useTvRealtime'; import { useTvAutoDj } from '../../hooks/useTvAutoDj'; import { useMediaSession } from '../../hooks/useMediaSession'; import { useWakeLock } from '../../hooks/useWakeLock'; import { useTvVoiceControl } from '../../hooks/useTvVoiceControl'; import { useTvRemoteHandler } from '../../hooks/useTvRemoteHandler';
import { TvPlayer, type TvPlayerRef } from './TvPlayer';
import { TvIdleScreen } from './TvIdleScreen';
import { TvNowPlayingHUD } from './TvNowPlayingHUD';
import { TvNextQueueTicker } from './TvNextQueueTicker';
import { TvThemeFrame } from './TvThemeFrame';
import { TvRentalBadge } from './TvRentalBadge';
import { TvVoiceHUD } from './TvVoiceHUD';
import { TvViewOverlays } from './TvViewOverlays';
import { TvFloatingQr } from './TvFloatingQr';
import { TvFloatingReactions } from './TvFloatingReactions';
import { TvUnlinkModal } from './TvUnlinkModal';
import { updatePlaybackTick } from '../../services/karaokeApi';
import { purgeAutoDjSongs } from '../../services/autoDjService'; import { clearRamQueue } from '../../services/autoDjRamQueueService'; import { setLocalAutoDjActive, isLocalAutoDjActive } from '../../services/autoDjStateService'; import { logError } from '../../services/loggerService'; import { getJoinUrl } from '../../utils/appUrl'; import { supabase } from '../../lib/supabaseClient';
import type { TvScale } from '../../types'; const SCALE_MAP: Record<TvScale, number> = { compact: 0.85, normal: 1.0, large: 1.15, xl: 1.30 };

export const TvView: FC<{ roomCode?: string; onUnlink?: () => void; onSwitchToHost?: () => void }> = ({ roomCode = 'FIESTA', onUnlink, onSwitchToHost }) => {
  const playerRef = useRef<TvPlayerRef>(null);
  const lastSyncRef = useRef<number>(0), handleNextSongRef = useRef<() => void>(() => {}), handleStartAutoDjRef = useRef<() => void>(() => {});
  const [currentTime, setCurrentTime] = useState(0), [duration, setDuration] = useState(0), [showUnlinkModal, setShowUnlinkModal] = useState(false), [isStartingAutoDj, setIsStartingAutoDj] = useState(false);

  const { isPaused, setIsPaused, isFlashing, banners, setBanners, rentalSession, tvTheme, tvScale, handleRemoteCommand } = useTvRemoteHandler(roomCode, playerRef, handleNextSongRef, handleStartAutoDjRef, onUnlink, () => setShowUnlinkModal(false));
  useEffect(() => {
    const ch = supabase.channel(`tv-room-${roomCode}`).on('broadcast', { event: 'admin_linked' }, () => setShowUnlinkModal(false)).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [roomCode]);
  const { room, currentSong, nextSongs, isLoading, handleNextSong, refreshState } = useTvRealtime(roomCode, handleRemoteCommand);
  handleNextSongRef.current = handleNextSong; useTvAutoDj(room, currentSong, nextSongs, refreshState, handleNextSong, roomCode); useWakeLock(Boolean(currentSong));
  useMediaSession(currentSong, room?.name || 'Rockola', room?.is_playing !== false, {
    onPlay: () => { playerRef.current?.play(); setIsPaused(false); }, onPause: () => { playerRef.current?.pause(); setIsPaused(true); }, onNext: () => handleNextSongRef.current(),
  });

  const handleStartAutoDj = useCallback(async () => {
    if (!room || isStartingAutoDj) return; setIsStartingAutoDj(true);
    try {
      setLocalAutoDjActive(roomCode, true, room.auto_dj_genre);
      supabase.channel(`tv-room-${room.id}`).send({ type: 'broadcast', event: 'set_auto_dj', payload: { enabled: true, genre: room.auto_dj_genre } }).catch(() => {});
      if (currentSong) { await refreshState(); return; }
      await handleNextSongRef.current();
    } catch (err) { console.error('Auto-DJ start error:', err); }
    finally { setIsStartingAutoDj(false); }
  }, [room, roomCode, isStartingAutoDj, currentSong, refreshState]);
  handleStartAutoDjRef.current = handleStartAutoDj;

  const handleStopAutoDj = useCallback(async () => {
    if (!room) return; setLocalAutoDjActive(roomCode, false);
    supabase.channel(`tv-room-${room.id}`).send({ type: 'broadcast', event: 'set_auto_dj', payload: { enabled: false } }).catch(() => {});
    clearRamQueue(); await purgeAutoDjSongs(room.id); await refreshState();
  }, [room, roomCode, refreshState]);

  const { isListening, lastCommand, isSupported, startVoice } = useTvVoiceControl({
    onPause: () => { playerRef.current?.pause(); setIsPaused(true); }, onPlay: () => { playerRef.current?.play(); setIsPaused(false); handleStartAutoDj(); }, onNext: () => handleNextSong(), onStartAutoDj: handleStartAutoDj, onStopAutoDj: handleStopAutoDj,
  });

  useEffect(() => {
    if (room?.promo_banners?.length) { setBanners(room.promo_banners); try { localStorage.setItem(`tv_banners_${roomCode}`, JSON.stringify(room.promo_banners)); } catch {} }
  }, [room?.promo_banners, roomCode]);

  useEffect(() => {
    let t: number | undefined;
    const resetBlur = () => { window.clearTimeout(t); if (currentSong && !isPaused && !showUnlinkModal) t = window.setTimeout(() => (document.activeElement as HTMLElement)?.blur(), 10000); };
    resetBlur();
    const handleKey = (e: KeyboardEvent) => {
      resetBlur();
      if (['ContextMenu', 'Settings', 'Menu', 'F1', 'm', 'M', 'q', 'Q'].includes(e.key) || e.keyCode === 82) { e.preventDefault(); setShowUnlinkModal((p) => !p); }
      else if (!showUnlinkModal && (!e.target || e.target === document.body)) {
        if (e.key === 'ArrowUp') { e.preventDefault(); document.getElementById('tv-gear-btn')?.focus(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); document.getElementById('tv-timeline-bar')?.focus(); }
      }
    };
    window.addEventListener('keydown', handleKey); return () => { window.clearTimeout(t); window.removeEventListener('keydown', handleKey); };
  }, [showUnlinkModal, currentSong, isPaused]);
  useEffect(() => {
    if (!isLoading && !currentSong && nextSongs.length > 0 && (nextSongs.some((s) => !s.id.startsWith('ram_')) || room?.auto_dj_enabled || isLocalAutoDjActive(roomCode))) handleNextSongRef.current();
  }, [isLoading, currentSong, nextSongs.length, room?.auto_dj_enabled, roomCode]);

  const handlePlayerError = useCallback(() => {
    if (currentSong?.video_id) recordRestrictedVideoId(currentSong.video_id);
    logError(roomCode, 'tv', 'yt_restricted_skip', `Video no disponible`, { currentSongId: currentSong?.id, videoId: currentSong?.video_id }); handleNextSongRef.current();
  }, [roomCode, currentSong]);

  const handleTimeUpdate = useCallback((curr: number, dur: number) => {
    setCurrentTime(curr); setDuration(dur); const now = Date.now();
    if (room && now - lastSyncRef.current > 3000) { lastSyncRef.current = now; updatePlaybackTick(room.id, true, curr).catch(() => {}); }
  }, [room]);

  if (isLoading) return (<div className="w-full h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3"><div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /><p className="text-zinc-400 font-mono text-sm tracking-widest uppercase">Conectando a Sala {roomCode}...</p></div>);

  const joinUrl = getJoinUrl(roomCode), scaleFactor = SCALE_MAP[tvScale] || 1.0;
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {isFlashing && (<div className="absolute inset-0 border-8 border-emerald-400 pointer-events-none z-50 flex items-center justify-center bg-emerald-950/20 animate-pulse"><span className="px-6 py-3 rounded-2xl bg-emerald-500 text-zinc-950 font-black text-xl shadow-2xl flex items-center gap-2"><Sparkles className="w-6 h-6" />⚡ PANTALLA: {room?.zone_name || room?.name}</span></div>)}

      {/* Tuerca Superior Derecha: Solo el contorno de la tuerca rosada más pequeña */}
      <button id="tv-gear-btn" type="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); setShowUnlinkModal(true); }} onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); document.getElementById('tv-timeline-bar')?.focus(); } }} title="Ajustes y Salir" className="absolute top-4 right-4 z-[999] bg-transparent border-0 outline-none p-1 cursor-pointer pointer-events-auto flex items-center justify-center group transition-transform focus:outline-none">
        <Settings className="w-4 h-4 text-pink-500 hover:text-pink-400 fill-none stroke-[2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] group-hover:rotate-45 group-focus:rotate-45 group-focus:scale-125 group-focus:text-yellow-400 group-focus:fill-yellow-400 group-focus:stroke-black group-focus:stroke-[2.5] group-focus:drop-shadow-[0_0_10px_rgba(250,204,21,1)] transition-all" />
      </button>

      <div className="absolute top-0 left-0 z-40 pointer-events-none" style={{ transform: `scale(${scaleFactor})`, transformOrigin: 'top left' }}>
        <TvRentalBadge rentalSession={rentalSession} className="absolute top-4 left-4 z-40 pointer-events-auto" />{currentSong && <TvNextQueueTicker queue={nextSongs} currentTime={currentTime} duration={duration} isPaused={isPaused} hasRental={Boolean(rentalSession?.enabled)} />}
      </div>
      <TvVoiceHUD lastCommand={lastCommand} />

      {!currentSong ? (
        <TvIdleScreen roomCode={roomCode} joinUrl={joinUrl} roomName={room?.name || 'Rockola Digital Live'} zoneName={room?.zone_name} status={room?.status} banners={banners} autoDjActive={Boolean(room?.auto_dj_enabled)} onStartAutoDj={handleStartAutoDj} isStartingAutoDj={isStartingAutoDj} onSwitchToHost={onSwitchToHost} onOpenSettings={() => setShowUnlinkModal(true)} />
      ) : (
        <>
          <TvThemeFrame theme={tvTheme}><TvPlayer ref={playerRef} videoId={currentSong.video_id} onEnded={handleNextSong} onError={handlePlayerError} onTimeUpdate={handleTimeUpdate} rentalSession={rentalSession} onPlayingStateChange={(pl) => { setIsPaused(!pl); if (room) updatePlaybackTick(room.id, pl, currentTime).catch(() => {}); }} /></TvThemeFrame>
          <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none" style={{ transform: `scale(${scaleFactor})`, transformOrigin: 'bottom center' }}><TvNowPlayingHUD song={currentSong} currentTime={currentTime} duration={duration} isPaused={isPaused} onTogglePlayPause={() => playerRef.current?.togglePlayPause()} /></div>
        </>
      )}
      <div className="absolute top-0 right-0 z-40 pointer-events-none" style={{ transform: `scale(${scaleFactor})`, transformOrigin: 'top right' }}><TvViewOverlays roomCode={roomCode} currentSong={currentSong} banners={banners} /></div>
      {currentSong && <div className="absolute bottom-3 right-3 z-40" style={{ transform: `scale(${scaleFactor})`, transformOrigin: 'bottom right' }}><TvFloatingQr roomCode={roomCode} joinUrl={joinUrl} onSwitchToHost={onSwitchToHost} onOpenSettings={() => setShowUnlinkModal(true)} /></div>}
      <TvFloatingReactions roomCode={roomCode} />
      <TvUnlinkModal isOpen={showUnlinkModal} roomCode={roomCode} roomName={room?.zone_name || room?.name} onClose={() => setShowUnlinkModal(false)} onSwitchToHost={onSwitchToHost} onConfirmUnlink={() => { try { localStorage.removeItem('tv_paired_room'); } catch {} setShowUnlinkModal(false); onUnlink?.(); }} isVoiceSupported={isSupported} isListeningVoice={isListening} onToggleVoice={startVoice} />
    </div>
  );
};
