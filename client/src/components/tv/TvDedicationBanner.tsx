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
      return;
    }

    const { dedication } = parseSongMeta(currentSong);
    if (dedication && dedication.trim()) {
      setDedicationText(dedication.trim());
      setRequestedBy(currentSong.requested_by);
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 40000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [currentSong?.id, currentSong?.thumbnail_url, currentSong?.requested_by]);

  if (!isVisible || !dedicationText) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[90%] animate-in fade-in slide-in-from-bottom-6 duration-700 pointer-events-none">
      <div className="bg-gradient-to-r from-purple-950/90 via-pink-950/90 to-purple-950/90 border-2 border-pink-500/60 rounded-3xl p-4 shadow-[0_0_50px_rgba(236,72,153,0.4)] backdrop-blur-xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg animate-pulse">
          <Heart className="w-6 h-6 text-white fill-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-pink-300 tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Dedicatoria de {requestedBy}</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-white tracking-wide truncate mt-0.5">
            "{dedicationText}"
          </p>
        </div>
      </div>
    </div>
  );
};
