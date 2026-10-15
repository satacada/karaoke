import type { FC } from 'react';
import { ListMusic } from 'lucide-react';
import type { QueueItem } from '../../types';
import { isTvHudIntervalActive } from '../../utils/tvPlaybackInterval';

interface TvNextQueueTickerProps {
  queue: QueueItem[];
  currentTime?: number;
  duration?: number;
  isPaused?: boolean;
  hasRental?: boolean;
}

export const TvNextQueueTicker: FC<TvNextQueueTickerProps> = ({
  queue,
  currentTime = 0,
  duration = 0,
  isPaused = false,
  hasRental = false,
}) => {
  const nextSong = queue[0];
  const isVisible = isTvHudIntervalActive(currentTime, duration, isPaused);

  if (!nextSong) {
    return null;
  }

  return (
    <aside
      aria-label="Siguiente canción en cola"
      className={`absolute ${hasRental ? 'top-16' : 'top-3'} left-3 z-40 flex items-center gap-2 max-w-[clamp(16rem,28vw,24rem)] bg-black/40 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/10 select-none pointer-events-none transition-opacity duration-700 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <ListMusic className="w-4 h-4 text-pink-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] shrink-0" />
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-black text-pink-300 uppercase tracking-wider block tv-text-outline leading-tight">
          Siguiente:
        </span>
        <p className="text-[clamp(11px,0.85vw,13px)] font-bold text-white/90 truncate leading-tight tv-text-outline">
          {nextSong.title}
        </p>
        {nextSong.author && (
          <p className="text-[9px] font-medium text-white/60 truncate leading-tight tv-text-outline-sm">
            {nextSong.author}
          </p>
        )}
      </div>
    </aside>
  );
};
