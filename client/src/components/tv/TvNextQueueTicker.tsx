import type { FC } from 'react';
import { ListMusic } from 'lucide-react';
import type { QueueItem } from '../../types';

interface TvNextQueueTickerProps {
  queue: QueueItem[];
  currentTime?: number;
  duration?: number;
}

export const TvNextQueueTicker: FC<TvNextQueueTickerProps> = ({
  queue,
  currentTime = 0,
  duration = 0,
}) => {
  const nextSong = queue[0];
  const effectiveDuration = duration > 0 ? duration : 180;

  // Solo aparece los primeros 20 segundos al iniciar y los últimos 20 segundos antes de terminar
  const isVisible = currentTime <= 20 || (effectiveDuration > 25 && currentTime >= effectiveDuration - 20);

  if (!nextSong) {
    return (
      <aside
        aria-label="Estado de la cola"
        className={`absolute top-3 left-3 z-40 flex items-center gap-1.5 px-2 py-1 bg-transparent text-white/80 text-xs font-bold whitespace-nowrap tv-text-outline select-none pointer-events-none transition-opacity duration-700 ease-in-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <ListMusic className="w-3.5 h-3.5 text-pink-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] shrink-0" />
        <span className="tracking-wide">Cola libre: ¡pide tu tema!</span>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Siguiente canción en cola"
      className={`absolute top-3 left-3 z-40 flex items-center gap-1.5 max-w-[clamp(14rem,26vw,22rem)] bg-transparent p-1 select-none pointer-events-none transition-opacity duration-700 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <ListMusic className="w-3.5 h-3.5 text-pink-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] shrink-0" />
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-black text-pink-300 uppercase tracking-wider block tv-text-outline leading-tight">
          Siguiente:
        </span>
        <p className="text-[clamp(11px,0.85vw,13px)] font-bold text-white/85 truncate leading-tight tv-text-outline">
          {nextSong.title}
        </p>
      </div>
    </aside>
  );
};
