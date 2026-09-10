import { useState, useEffect, type FC } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import type { QueueItem } from '../../types';
import { parseSongMeta } from '../../utils/songMeta';

interface TvDedicationBannerProps {
  currentSong: QueueItem | null;
}

export const TvDedicationBanner: FC<TvDedicationBannerProps> = ({ currentSong }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dedicationText, setDedicationText] = useState<string | null>(null);
  const [requestedBy, setRequestedBy] = useState('');

  useEffect(() => {
    if (!currentSong) {
      setIsVisible(false);
      setDedicationText(null);
      return;
    }

    const { dedication } = parseSongMeta(currentSong);
    if (!dedication || !dedication.trim()) {
      setIsVisible(false);
      setDedicationText(null);
      return;
    }

    setDedicationText(dedication.trim());
    setRequestedBy(currentSong.requested_by || 'Un invitado');
    setIsVisible(true);

    let timer: ReturnType<typeof setTimeout>;
    const scheduleNext = (showing: boolean) => {
      timer = setTimeout(() => {
        setIsVisible(!showing);
        scheduleNext(!showing);
      }, showing ? 12000 : 33000);
    };

    scheduleNext(true);

    return () => {
      clearTimeout(timer);
      setIsVisible(false);
    };
  }, [currentSong?.id]);

  if (!isVisible || !dedicationText) return null;

  return (
    <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500 pointer-events-auto">
      <div className="relative bg-gradient-to-br from-pink-950/95 via-purple-950/90 to-zinc-950/95 border-2 border-pink-500/70 rounded-2xl p-3 shadow-[0_0_25px_rgba(236,72,153,0.35)] backdrop-blur-xl flex flex-col gap-1 text-left overflow-hidden">
        <div className="flex items-center justify-between gap-1">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 bg-pink-500 text-white shadow-[0_0_10px_#ec4899]">
            <Heart className="w-3 h-3 fill-white" />
            <span>DEDICATORIA</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-pink-300 truncate max-w-[130px]">
            <Sparkles className="w-2.5 h-2.5 text-amber-300 shrink-0" />
            <span className="truncate">De {requestedBy}</span>
          </span>
        </div>
        <p className="text-xs font-bold text-white leading-snug line-clamp-3 mt-0.5 italic tv-text-outline-sm">
          "{dedicationText}"
        </p>
      </div>
    </div>
  );
};
