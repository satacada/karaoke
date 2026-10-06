import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { TvPauseOverlay } from './TvPauseOverlay';
import { TvAutoplayBlockedPrompt } from './TvAutoplayBlockedPrompt';
import { logInfo, logError } from '../../services/loggerService';
import type { YTPlayerInstance } from '../../types/youtube';

export interface TvPlayerRef {
  play: () => void; pause: () => void; togglePlayPause: () => void;
  seekTo: (seconds: number) => void; setVolume: (volume: number) => void;
}

interface TvPlayerProps {
  videoId: string; onEnded: () => void; onError?: (errorCode: number) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlayingStateChange?: (isPlaying: boolean) => void;
  rentalSession?: import('../../types').RoomRentalSession | null;
}

const YT_ERRORS: Record<number, string> = { 2: 'Parámetros inválidos', 5: 'Error HTML5', 100: 'Video privado/no encontrado', 101: 'Restricción externa (101)', 150: 'Restricción externa (150)' };

export const TvPlayer = forwardRef<TvPlayerRef, TvPlayerProps>(function TvPlayer({ videoId, onEnded, onError, onTimeUpdate, onPlayingStateChange, rentalSession }, ref) {
  const containerRef = useRef<HTMLDivElement>(null); const playerRef = useRef<YTPlayerInstance | null>(null);
  const isReadyRef = useRef<boolean>(false); const currentVideoRef = useRef<string>(videoId);
  const onEndedRef = useRef(onEnded); onEndedRef.current = onEnded; const onErrorRef = useRef(onError); onErrorRef.current = onError;
  const onPlayingRef = useRef(onPlayingStateChange); onPlayingRef.current = onPlayingStateChange; const onTimeUpdateRef = useRef(onTimeUpdate); onTimeUpdateRef.current = onTimeUpdate;
  const hasEndedRef = useRef<boolean>(false);
  const [isPaused, setIsPaused] = useState(false); const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);

  const togglePlayPause = useCallback(() => {
    if (!playerRef.current) return;
    const state = playerRef.current.getPlayerState?.();
    if (state === 1) playerRef.current.pauseVideo();
    else { playerRef.current.playVideo(); setIsAutoplayBlocked(false); }
  }, []);

  useImperativeHandle(ref, () => ({
    play: () => { playerRef.current?.playVideo(); setIsAutoplayBlocked(false); },
    pause: () => playerRef.current?.pauseVideo(), togglePlayPause,
    seekTo: (sec: number) => playerRef.current?.seekTo(sec, true),
    setVolume: (vol: number) => playerRef.current?.setVolume(vol),
  }));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ([' ', 'Enter', 'MediaPlayPause', 'MediaPlay', 'MediaPause'].includes(e.key) || e.keyCode === 179) {
        e.preventDefault(); togglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const c = playerRef.current.getCurrentTime() || 0; const d = playerRef.current.getDuration() || 0;
        onTimeUpdateRef.current?.(c, d);
        if (d > 8 && c >= d - 1.8 && !hasEndedRef.current) { hasEndedRef.current = true; onEndedRef.current(); }
      }
    }, 500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    hasEndedRef.current = false;
    if (isReadyRef.current && playerRef.current && currentVideoRef.current !== videoId) {
      currentVideoRef.current = videoId; logInfo('TV', 'tv', 'yt_load_video', `Cargando video: ${videoId}`);
      playerRef.current.loadVideoById(videoId);
    }
  }, [videoId]);

  useEffect(() => {
    let isMounted = true;
    function init() {
      if (!containerRef.current || !window.YT || playerRef.current) return;
      logInfo('TV', 'tv', 'yt_init', `Inicializando YouTube IFrame: ${videoId}`);
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: { autoplay: 1, controls: 0, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, enablejsapi: 1, fs: 0, origin: window.location.origin },
        events: {
          onReady: (evt) => {
            if (!isMounted) return;
            isReadyRef.current = true; evt.target.playVideo();
            logInfo('TV', 'tv', 'yt_ready', 'YouTube Player listo, ejecutando playVideo()');
            setTimeout(() => {
              if (isMounted && playerRef.current?.getPlayerState?.() !== 1) {
                setIsAutoplayBlocked(true); logInfo('TV', 'tv', 'yt_autoplay_blocked', 'Autoplay bloqueado por navegador');
              }
            }, 2500);
          },
          onStateChange: (evt) => {
            if (evt.data === 0 && !hasEndedRef.current) { hasEndedRef.current = true; onEndedRef.current(); }
            else if (evt.data === 1) { setIsPaused(false); setIsAutoplayBlocked(false); onPlayingRef.current?.(true); logInfo('TV', 'tv', 'yt_playing', 'Reproducción activa con éxito'); }
            else if (evt.data === 2) { setIsPaused(true); onPlayingRef.current?.(false); }
          },
          onError: (evt) => {
            const msg = YT_ERRORS[evt.data] || `Error ${evt.data}`;
            logError('TV', 'tv', 'yt_error', `YouTube Error: ${msg}`, { errorCode: evt.data, videoId });
            onErrorRef.current?.(evt.data);
          },
        },
      });
    }
    if (!window.YT) {
      const tag = document.createElement('script'); tag.src = 'https://www.youtube.com/iframe_api';
      window.onYouTubeIframeAPIReady = init; document.body.appendChild(tag);
    } else init();
    return () => { isMounted = false; try { playerRef.current?.destroy(); } catch {} playerRef.current = null; isReadyRef.current = false; };
  }, []);

  return (
    <div onClick={togglePlayPause} className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden cursor-pointer tv-player-container">
      <div ref={containerRef} className="w-full h-full" />
      {isAutoplayBlocked && <TvAutoplayBlockedPrompt onUnlock={togglePlayPause} />}
      <TvPauseOverlay isPaused={isPaused && !isAutoplayBlocked} rentalSession={rentalSession} onPlay={togglePlayPause} />
    </div>
  );
});
