import { useRef, useState, useCallback, useEffect, type FC } from 'react';
import { AlertCircle } from 'lucide-react';
import { useTvRealtime } from '../../hooks/useTvRealtime';
import { TvPlayer, type TvPlayerRef } from './TvPlayer';
import { TvIdleScreen } from './TvIdleScreen'; import { TvNowPlayingHUD } from './TvNowPlayingHUD';
import { TvNextQueueTicker } from './TvNextQueueTicker'; import { TvFloatingQr } from './TvFloatingQr';
import { TvDedicationBanner } from './TvDedicationBanner'; import { TvPromoTicker } from './TvPromoTicker';
import { TvFloatingReactions } from './TvFloatingReactions'; import { TvVintageFrame } from './TvVintageFrame';
import { updatePlaybackTick } from '../../services/karaokeApi';
import type { RemoteCommand, PromoBanner } from '../../types';

export const TvView: FC<{ roomCode?: string }> = ({ roomCode = 'FIESTA' }) => {
  const playerRef = useRef<TvPlayerRef>(null);
  const lastSyncRef = useRef<number>(0);
  const handleNextSongRef = useRef<() => void>(() => {});
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [tvTheme, setTvTheme] = useState<'vintage' | 'modern'>(() => {
    return (localStorage.getItem(`tv_theme_${roomCode}`) as 'vintage' | 'modern') || 'modern';
  });

  const handleRemoteCommand = useCallback((cmd: RemoteCommand) => {
    switch (cmd.command) {
      case 'play': playerRef.current?.play(); break;
      case 'pause': playerRef.current?.pause(); break;
      case 'skip': handleNextSongRef.current(); break;
      case 'seek': if (cmd.payload?.seconds !== undefined) playerRef.current?.seekTo(cmd.payload.seconds); break;
      case 'volume':
        if (cmd.payload?.action === 'set_tv_theme' && cmd.payload.theme) {
          const t = cmd.payload.theme as 'vintage' | 'modern'; setTvTheme(t);
          try { localStorage.setItem(`tv_theme_${roomCode}`, t); } catch {}
        } else if (cmd.payload?.volume !== undefined) playerRef.current?.setVolume(cmd.payload.volume);
        break;
      case 'set_promo_banners':
        if (cmd.payload?.banners) {
          const b = cmd.payload.banners as PromoBanner[]; setBanners(b);
          try { localStorage.setItem(`tv_banners_${roomCode}`, JSON.stringify(b)); } catch {}
        }
        break;
    }
  }, [roomCode]);

  const { room, currentSong, nextSongs, isLoading, handleNextSong } = useTvRealtime(roomCode, handleRemoteCommand);
  handleNextSongRef.current = handleNextSong;

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
    setErrorNotice('Video con restricción de derechos en YouTube. Saltando al siguiente...');
    setTimeout(() => { setErrorNotice(null); handleNextSongRef.current(); }, 2000);
  }, []);

  const handleTimeUpdate = useCallback((curr: number, dur: number) => {
    setCurrentTime(curr); setDuration(dur);
    const now = Date.now();
    if (room && now - lastSyncRef.current > 3000) {
      lastSyncRef.current = now; updatePlaybackTick(room.id, true, curr).catch(() => {});
    }
  }, [room]);

  const handlePlayingStateChange = useCallback((playing: boolean) => {
    if (room) updatePlaybackTick(room.id, playing, currentTime).catch(() => {});
  }, [room, currentTime]);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 font-mono text-sm tracking-widest uppercase">Conectando a Sala {roomCode}...</p>
      </div>
    );
  }

  const joinUrl = `${window.location.origin}/join?room=${roomCode}`;
  if (!currentSong) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden select-none">
        <TvIdleScreen roomCode={roomCode} joinUrl={joinUrl} roomName={room?.name || 'Rockola Digital Live'} zoneName={room?.zone_name} status={room?.status} banners={banners} autoDjActive={Boolean(room?.auto_dj_enabled)} />
        <TvFloatingReactions roomCode={roomCode} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {errorNotice && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-rose-600/90 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-rose-400/40 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-300 animate-pulse" /><span>{errorNotice}</span>
        </div>
      )}
      <TvVintageFrame active={tvTheme === 'vintage'}>
        <TvPlayer ref={playerRef} videoId={currentSong.video_id} onEnded={handleNextSong} onError={handlePlayerError} onTimeUpdate={handleTimeUpdate} onPlayingStateChange={handlePlayingStateChange} />
      </TvVintageFrame>
      <TvNextQueueTicker queue={nextSongs} />
      <aside className="absolute top-6 right-6 z-40 flex flex-col gap-2.5 w-52 pointer-events-none">
        <div className="pointer-events-auto"><TvFloatingQr roomCode={roomCode} joinUrl={joinUrl} currentSongId={currentSong.id} /></div>
        <TvPromoTicker banners={banners} roomCode={roomCode} />
      </aside>
      <TvNowPlayingHUD song={currentSong} currentTime={currentTime} duration={duration} />
      <TvDedicationBanner currentSong={currentSong} />
      <TvFloatingReactions roomCode={roomCode} />
    </div>
  );
};

