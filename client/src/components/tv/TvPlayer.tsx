import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import type { YTPlayerInstance } from '../../types/youtube';

export interface TvPlayerRef {
  play: () => void; pause: () => void; seekTo: (seconds: number) => void; setVolume: (volume: number) => void;
}

interface TvPlayerProps {
  videoId: string;
  onEnded: () => void;
  onError?: (errorCode: number) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlayingStateChange?: (isPlaying: boolean) => void;
}

export const TvPlayer = forwardRef<TvPlayerRef, TvPlayerProps>(function TvPlayer(
  { videoId, onEnded, onError, onTimeUpdate, onPlayingStateChange },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const isReadyRef = useRef<boolean>(false);
  const currentVideoRef = useRef<string>(videoId);
  const onEndedRef = useRef(onEnded); onEndedRef.current = onEnded;
  const onErrorRef = useRef(onError); onErrorRef.current = onError;
  const onPlayingRef = useRef(onPlayingStateChange); onPlayingRef.current = onPlayingStateChange;
  const onTimeUpdateRef = useRef(onTimeUpdate); onTimeUpdateRef.current = onTimeUpdate;
  const hasEndedRef = useRef<boolean>(false);

  useImperativeHandle(ref, () => ({
    play: () => playerRef.current?.playVideo(),
    pause: () => playerRef.current?.pauseVideo(),
    seekTo: (seconds: number) => playerRef.current?.seekTo(seconds, true),
    setVolume: (vol: number) => playerRef.current?.setVolume(vol),
  }));

  // Poll current time while playing and perform smart outro cutoff before YouTube suggestions
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const current = playerRef.current.getCurrentTime() || 0;
        const duration = playerRef.current.getDuration() || 0;
        onTimeUpdateRef.current?.(current, duration);
        if (duration > 8 && current >= duration - 1.8 && !hasEndedRef.current) {
          hasEndedRef.current = true;
          onEndedRef.current();
        }
      }
    }, 500);

    return () => clearInterval(timer);
  }, []);

  // Handle videoId switch cleanly via loadVideoById without destroying the player
  useEffect(() => {
    hasEndedRef.current = false;
    if (isReadyRef.current && playerRef.current && currentVideoRef.current !== videoId) {
      currentVideoRef.current = videoId;
      playerRef.current.loadVideoById(videoId);
    }
  }, [videoId]);

  // One-time player initialization
  useEffect(() => {
    let isMounted = true;

    function init() {
      if (!containerRef.current || !window.YT || playerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          enablejsapi: 1,
          fs: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (evt) => { if (isMounted) { isReadyRef.current = true; evt.target.playVideo(); } },
          onStateChange: (evt) => {
            if (evt.data === 0 && !hasEndedRef.current) { hasEndedRef.current = true; onEndedRef.current(); }
            else if (evt.data === 1) onPlayingRef.current?.(true);
            else if (evt.data === 2) onPlayingRef.current?.(false);
          },
          onError: (evt) => onErrorRef.current?.(evt.data),
        },
      });
    }

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      window.onYouTubeIframeAPIReady = init;
      document.body.appendChild(tag);
    } else { init(); }

    return () => {
      isMounted = false;
      try { playerRef.current?.destroy(); } catch {}
      playerRef.current = null; isReadyRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onClick={() => playerRef.current?.playVideo()}
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden cursor-pointer tv-player-container"
    >
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
});
