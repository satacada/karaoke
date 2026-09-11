import { useState, useCallback, type MutableRefObject } from 'react';
import type { RemoteCommand, PromoBanner, RoomRentalSession, TvTheme, TvScale } from '../types';
import { getLocalRentalSession } from '../services/rentalService';
import type { TvPlayerRef } from '../components/tv/TvPlayer';

export function useTvRemoteHandler(
  roomCode: string,
  playerRef: MutableRefObject<TvPlayerRef | null>,
  handleNextSongRef: MutableRefObject<() => void>,
  handleStartAutoDjRef: MutableRefObject<() => void>,
  onUnlink?: () => void
) {
  const [isPaused, setIsPaused] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [rentalSession, setRentalSession] = useState<RoomRentalSession | null>(() => getLocalRentalSession(roomCode));
  const [tvTheme, setTvTheme] = useState<TvTheme>(() => (localStorage.getItem(`tv_theme_${roomCode}`) as TvTheme) || 'modern');
  const [tvScale, setTvScale] = useState<TvScale>(() => (localStorage.getItem(`tv_scale_${roomCode}`) as TvScale) || 'normal');

  const handleRemoteCommand = useCallback((cmd: RemoteCommand) => {
    switch (cmd.command) {
      case 'play': playerRef.current?.play(); setIsPaused(false); break;
      case 'pause': playerRef.current?.pause(); setIsPaused(true); break;
      case 'skip': handleNextSongRef.current(); break;
      case 'seek': if (cmd.payload?.seconds !== undefined) playerRef.current?.seekTo(cmd.payload.seconds); break;
      case 'unlink_tv': try { localStorage.removeItem('tv_paired_room'); } catch {} onUnlink?.(); break;
      case 'flash_identify': setIsFlashing(true); setTimeout(() => setIsFlashing(false), 4500); break;
      case 'set_rental_time':
        if (cmd.payload?.rental_session) setRentalSession((cmd.payload.rental_session as RoomRentalSession).enabled ? (cmd.payload.rental_session as RoomRentalSession) : null);
        break;
      case 'volume':
        if (cmd.payload?.action === 'unlink_tv') { try { localStorage.removeItem('tv_paired_room'); } catch {} onUnlink?.(); }
        else if (cmd.payload?.action === 'set_tv_theme' && cmd.payload.theme) {
          const t = cmd.payload.theme as TvTheme; setTvTheme(t); try { localStorage.setItem(`tv_theme_${roomCode}`, t); } catch {}
        } else if (cmd.payload?.action === 'set_tv_scale' && cmd.payload.scale) {
          const s = cmd.payload.scale as TvScale; setTvScale(s); try { localStorage.setItem(`tv_scale_${roomCode}`, s); } catch {}
        } else if (cmd.payload?.action === 'set_rental_time' && cmd.payload.rental_session) {
          setRentalSession((cmd.payload.rental_session as RoomRentalSession).enabled ? (cmd.payload.rental_session as RoomRentalSession) : null);
        } else if (cmd.payload?.volume !== undefined) playerRef.current?.setVolume(cmd.payload.volume);
        break;
      case 'set_promo_banners':
        if (cmd.payload?.banners) { setBanners(cmd.payload.banners as PromoBanner[]); try { localStorage.setItem(`tv_banners_${roomCode}`, JSON.stringify(cmd.payload.banners)); } catch {} }
        break;
    }
  }, [roomCode, playerRef, handleNextSongRef, handleStartAutoDjRef, onUnlink]);

  return { isPaused, setIsPaused, isFlashing, banners, setBanners, rentalSession, tvTheme, tvScale, handleRemoteCommand };
}
