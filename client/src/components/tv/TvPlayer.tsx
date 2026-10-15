import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
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

export const TvPlayer = forwardRef<TvPlayerRef, TvPlayerProps>(function TvPlayer({ videoId, onEnded, onError, onTimeUpdate, onPlayingStateChange }, ref) {
  const containerRef = useRef<HTMLDivElement>(null); const playerRef = useRef<YTPlayerInstance | null>(null);
  const isReadyRef = useRef<boolean>(false); const currentVideoRef = useRef<string>(videoId);
  const onEndedRef = useRef(onEnded); onEndedRef.current = onEnded; const onErrorRef = useRef(onError); onErrorRef.current = onError;
  const onPlayingRef = useRef(onPlayingStateChange); onPlayingRef.current = onPlayingStateChange; const onTimeUpdateRef = useRef(onTimeUpdate); onTimeUpdateRef.current = onTimeUpdate;
  const hasEndedRef = useRef<boolean>(false);
  const hasStartedRef = useRef<boolean>(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);

  const togglePlayPause = useCallback(() => {
    if (!playerRef.current) return;
    const state = playerRef.current.getPlayerState?.();
    if (state === 1) playerRef.current.pauseVideo();
    else { playerRef.current.playVideo(); setIsAutoplayBlocked(false); }
  }, []);

  useImperativeHandle(ref, () => ({
    play: () => { playerRef.current?.playVideo(); setIsAutoplayBlocked(false); },
    pause: () => playerRef.current?.pauseVideo(), togglePlayPause,
    seekTo: (sec: number) => playerRef.current?.seekTo(sec, true), setVolume: (vol: number) => playerRef.current?.setVolume(vol),
  }));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLButtonElement) return;
      if ((e.target as HTMLElement)?.closest('button, a, [role="dialog"], [role="button"]')) return;
      if (['MediaPlayPause', 'MediaPlay', 'MediaPause'].includes(e.key) || e.keyCode === 179) { e.preventDefault(); togglePlayPause(); }
      else if (e.key === ' ' && (!e.target || e.target === document.body)) { e.preventDefault(); togglePlayPause(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause]);

  useEffect(() => {
    let lastTime = 0;
    const timer = window.setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const c = playerRef.current.getCurrentTime() || 0; const d = playerRef.current.getDuration() || 0;
        const st = playerRef.current.getPlayerState?.();
        onTimeUpdateRef.current?.(c, d);
        if (st === 1 || (c > 0 && Math.abs(c - lastTime) > 0.05)) {
          hasStartedRef.current = true; setIsAutoplayBlocked(false); onPlayingRef.current?.(true);
        } else if (st === 2) onPlayingRef.current?.(false);
        lastTime = c;
        if (d > 8 && c < d - 4 && hasEndedRef.current) hasEndedRef.current = false;
        if (d > 8 && c >= d - 1.8 && !hasEndedRef.current) { hasEndedRef.current = true; onEndedRef.current(); }
      }
    }, 500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    hasEndedRef.current = false; setIsAutoplayBlocked(false);
    if (isReadyRef.current && playerRef.current) {
      currentVideoRef.current = videoId; logInfo('TV', 'tv', 'yt_load_video', `Cargando video: ${videoId}`);
      playerRef.current.loadVideoById(videoId); onPlayingRef.current?.(true);
    }
  }, [videoId]);

  useEffect(() => {
    let isMounted = true;
    function init() {
      if (!containerRef.current || !window.YT || playerRef.current) return;
      logInfo('TV', 'tv', 'yt_init', `Inicializando YouTube IFrame: ${videoId}`);
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: { autoplay: 1, controls: 0, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, enablejsapi: 1, fs: 0, cc_load_policy: 0, origin: window.location.origin },
        events: {
          onReady: (evt) => {
            if (!isMounted) return;
            isReadyRef.current = true;
            try { evt.target.unloadModule?.('captions'); evt.target.setOption?.('captions', 'track', {}); } catch {}
            evt.target.playVideo(); logInfo('TV', 'tv', 'yt_ready', 'YouTube listo');
            setTimeout(() => { if (isMounted && !hasStartedRef.current && playerRef.current?.getPlayerState?.() === -1) setIsAutoplayBlocked(true); }, 8000);
          },
          onStateChange: (evt) => {
            try { evt.target.unloadModule?.('captions'); } catch {}
            if (evt.data === 0 && !hasEndedRef.current) { hasEndedRef.current = true; onEndedRef.current(); }
            else if (evt.data === 1) { hasEndedRef.current = false; hasStartedRef.current = true; setIsAutoplayBlocked(false); onPlayingRef.current?.(true); }
            else if (evt.data === 2) { onPlayingRef.current?.(false); }
          },
          onError: (evt) => { logError('TV', 'tv', 'yt_error', `YT Error: ${YT_ERRORS[evt.data] || evt.data}`, { errorCode: evt.data, videoId }); onErrorRef.current?.(evt.data); },
        },
      });
    }
    if (!window.YT) { const tag = document.createElement('script'); tag.src = 'https://www.youtube.com/iframe_api'; window.onYouTubeIframeAPIReady = init; document.body.appendChild(tag); } else init();
    return () => { isMounted = false; try { playerRef.current?.destroy(); } catch {} playerRef.current = null; isReadyRef.current = false; };
  }, []);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden tv-player-container select-none">
      <div ref={containerRef} className="w-full h-full pointer-events-none" />
      {isAutoplayBlocked && <TvAutoplayBlockedPrompt onUnlock={togglePlayPause} />}
    </div>
  );
});
