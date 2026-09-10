import { useRef, useState, useCallback, useEffect, type FC } from 'react';
import { AlertCircle, Settings, Sparkles } from 'lucide-react';
import { useTvRealtime } from '../../hooks/useTvRealtime'; import { useTvAutoDj } from '../../hooks/useTvAutoDj';
import { TvPlayer, type TvPlayerRef } from './TvPlayer'; import { TvIdleScreen } from './TvIdleScreen';
import { TvNowPlayingHUD } from './TvNowPlayingHUD'; import { TvNextQueueTicker } from './TvNextQueueTicker';
import { TvFloatingQr } from './TvFloatingQr'; import { TvDedicationBanner } from './TvDedicationBanner';
import { TvPromoTicker } from './TvPromoTicker'; import { TvFloatingReactions } from './TvFloatingReactions';
import { TvVintageFrame } from './TvVintageFrame'; import { TvUnlinkModal } from './TvUnlinkModal';
import { updatePlaybackTick } from '../../services/karaokeApi';
import type { RemoteCommand, PromoBanner } from '../../types';

export const TvView: FC<{ roomCode?: string; onUnlink?: () => void }> = ({ roomCode = 'FIESTA', onUnlink }) => {
  const playerRef = useRef<TvPlayerRef>(null); const lastSyncRef = useRef<number>(0); const handleNextSongRef = useRef<() => void>(() => {});
  const [currentTime, setCurrentTime] = useState(0); const [duration, setDuration] = useState(0);
  const [errorNotice, setErrorNotice] = useState<string | null>(null); const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false); const [isFlashing, setIsFlashing] = useState(false);
  const [tvTheme, setTvTheme] = useState<'vintage' | 'modern'>(() => (localStorage.getItem(`tv_theme_${roomCode}`) as 'vintage' | 'modern') || 'modern');

  const handleRemoteCommand = useCallback((cmd: RemoteCommand) => {
    switch (cmd.command) {
      case 'play': playerRef.current?.play(); break;
      case 'pause': playerRef.current?.pause(); break;
      case 'skip': handleNextSongRef.current(); break;
      case 'seek': if (cmd.payload?.seconds !== undefined) playerRef.current?.seekTo(cmd.payload.seconds); break;
      case 'unlink_tv': try { localStorage.removeItem('tv_paired_room'); } catch {} onUnlink?.(); break;
      case 'flash_identify': setIsFlashing(true); setTimeout(() => setIsFlashing(false), 4500); break;
      case 'volume':
        if (cmd.payload?.action === 'set_tv_theme' && cmd.payload.theme) {
          const t = cmd.payload.theme as 'vintage' | 'modern'; setTvTheme(t);
          try { localStorage.setItem(`tv_theme_${roomCode}`, t); } catch {}
        } else if (cmd.payload?.action === 'set_promo_banners' && cmd.payload.banners) {
          setBanners(cmd.payload.banners as PromoBanner[]);
          try { localStorage.setItem(`tv_banners_${roomCode}`, JSON.stringify(cmd.payload.banners)); } catch {}
        } else if (cmd.payload?.volume !== undefined) playerRef.current?.setVolume(cmd.payload.volume);
        break;
      case 'set_promo_banners':
        if (cmd.payload?.banners) {
          setBanners(cmd.payload.banners as PromoBanner[]);
          try { localStorage.setItem(`tv_banners_${roomCode}`, JSON.stringify(cmd.payload.banners)); } catch {}
        }
        break;
    }
  }, [roomCode, onUnlink]);

  const { room, currentSong, nextSongs, isLoading, handleNextSong, refreshState } = useTvRealtime(roomCode, handleRemoteCommand);
  handleNextSongRef.current = handleNextSong;
  useTvAutoDj(room, currentSong, nextSongs, refreshState);

  useEffect(() => {
    if (room?.promo_banners && room.promo_banners.length > 0) {
      setBanners(room.promo_banners);
      try { localStorage.setItem(`tv_banners_${roomCode}`, JSON.stringify(room.promo_banners)); } catch {}
    } else {
      const saved = localStorage.getItem(`tv_banners_${roomCode}`);
      if (saved) { try { setBanners(JSON.parse(saved)); } catch {} }
    }
  }, [room?.promo_banners, roomCode]);

  useEffect(() => {
    if (!isLoading && !currentSong && nextSongs.length > 0) handleNextSongRef.current();
  }, [isLoading, currentSong, nextSongs.length]);

  const handlePlayerError = useCallback(() => {
    setErrorNotice('Video con restricción en YouTube. Saltando...'); setTimeout(() => { setErrorNotice(null); handleNextSongRef.current(); }, 2000);
  }, []);

  const handleTimeUpdate = useCallback((curr: number, dur: number) => {
    setCurrentTime(curr); setDuration(dur); const now = Date.now();
    if (room && now - lastSyncRef.current > 3000) { lastSyncRef.current = now; updatePlaybackTick(room.id, true, curr).catch(() => {}); }
  }, [room]);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 font-mono text-sm tracking-widest uppercase">Conectando a Sala {roomCode}...</p>
      </div>
    );
  }

  const joinUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/join?room=${roomCode}`;
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {isFlashing && (
        <div className="absolute inset-0 border-8 border-emerald-400 pointer-events-none z-50 flex items-center justify-center bg-emerald-950/20 animate-pulse">
          <span className="px-6 py-3 rounded-2xl bg-emerald-500 text-zinc-950 font-black text-xl shadow-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6" />⚡ PANTALLA IDENTIFICADA: {room?.zone_name || room?.name}
          </span>
        </div>
      )}
      {errorNotice && <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-rose-600/90 backdrop-blur-md text-white px-5 py-2 rounded-2xl shadow-2xl border border-rose-400/40 text-sm font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-300 animate-pulse" /><span>{errorNotice}</span></div>}
      {!currentSong ? (
        <TvIdleScreen roomCode={roomCode} joinUrl={joinUrl} roomName={room?.name || 'Rockola Digital Live'} zoneName={room?.zone_name} status={room?.status} banners={banners} autoDjActive={Boolean(room?.auto_dj_enabled)} />
      ) : (
        <>
          <TvVintageFrame active={tvTheme === 'vintage'}><TvPlayer ref={playerRef} videoId={currentSong.video_id} onEnded={handleNextSong} onError={handlePlayerError} onTimeUpdate={handleTimeUpdate} onPlayingStateChange={(pl) => { if (room) updatePlaybackTick(room.id, pl, currentTime).catch(() => {}); }} /></TvVintageFrame>
          <TvNextQueueTicker queue={nextSongs} />
          <TvNowPlayingHUD song={currentSong} currentTime={currentTime} duration={duration} />
          <TvDedicationBanner currentSong={currentSong} />
        </>
      )}
      <aside className="absolute top-6 right-6 z-40 flex flex-col gap-2.5 w-52 pointer-events-none">
        <div className="flex justify-end pointer-events-auto">
          <button type="button" onClick={() => setShowUnlinkModal(true)} title="Configuración de pantalla" className="p-1.5 rounded-xl bg-black/40 hover:bg-black/80 text-zinc-400 hover:text-white border border-white/10 transition-colors">
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="pointer-events-auto"><TvFloatingQr roomCode={roomCode} joinUrl={joinUrl} currentSongId={currentSong?.id} /></div>
        <TvPromoTicker banners={banners} roomCode={roomCode} />
      </aside>
      <TvFloatingReactions roomCode={roomCode} />
      <TvUnlinkModal isOpen={showUnlinkModal} roomCode={roomCode} roomName={room?.zone_name || room?.name} onClose={() => setShowUnlinkModal(false)} onConfirmUnlink={() => { try { localStorage.removeItem('tv_paired_room'); } catch {} setShowUnlinkModal(false); onUnlink?.(); }} />
    </div>
  );
};
