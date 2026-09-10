import { useEffect } from 'react';
import { enableBackgroundAudioKeepAlive, disableBackgroundAudioKeepAlive } from '../utils/backgroundAudio';
import type { QueueItem } from '../types';

interface MediaSessionCallbacks {
  onPlay?: () => void;
  onPause?: () => void;
  onNext?: () => void;
}

export function useMediaSession(
  currentSong: QueueItem | null,
  roomName: string,
  isPlaying: boolean,
  callbacks: MediaSessionCallbacks
) {
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    if (currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.author || 'Rockola Live',
        album: roomName || 'Rockola Digital',
        artwork: currentSong.thumbnail_url
          ? [
              { src: currentSong.thumbnail_url, sizes: '96x96', type: 'image/jpeg' },
              { src: currentSong.thumbnail_url, sizes: '128x128', type: 'image/jpeg' },
              { src: currentSong.thumbnail_url, sizes: '512x512', type: 'image/jpeg' },
            ]
          : [],
      });
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      enableBackgroundAudioKeepAlive();
    } else {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
    }

    try {
      if (callbacks.onPlay) navigator.mediaSession.setActionHandler('play', callbacks.onPlay);
      if (callbacks.onPause) navigator.mediaSession.setActionHandler('pause', callbacks.onPause);
      if (callbacks.onNext) navigator.mediaSession.setActionHandler('nexttrack', callbacks.onNext);
    } catch {}

    return () => {
      try {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      } catch {}
    };
  }, [currentSong?.id, currentSong?.title, currentSong?.author, currentSong?.thumbnail_url, isPlaying, roomName, callbacks]);

  useEffect(() => {
    return () => disableBackgroundAudioKeepAlive();
  }, []);
}
