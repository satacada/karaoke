import type { FC } from 'react';
import { ListMusic, User, ArrowRight } from 'lucide-react';
import type { QueueItem } from '../../types';

interface TvNextQueueTickerProps {
  queue: QueueItem[];
}

export const TvNextQueueTicker: FC<TvNextQueueTickerProps> = ({ queue }) => {
  const upcoming = queue.slice(0, 3);

  if (upcoming.length === 0) {
    return (
      <aside
        aria-label="Estado de la cola"
        className="absolute top-3 left-3 z-40 flex items-center gap-1.5 px-2 py-1 bg-transparent text-white/50 text-xs font-bold whitespace-nowrap tv-text-outline select-none pointer-events-none"
      >
        <ListMusic className="w-3.5 h-3.5 text-pink-400/60 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] shrink-0" />
        <span className="tracking-wide">Cola libre: ¡pide tu tema!</span>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Próximas canciones en cola"
      className="absolute top-3 left-3 z-40 flex flex-col gap-1 w-[clamp(14rem,24vw,20rem)] bg-transparent p-1 select-none pointer-events-none"
    >
      <header className="flex items-center gap-1 text-[clamp(9px,0.7vw,11px)] font-black text-white/50 uppercase tracking-wider tv-text-outline">
        <ListMusic className="w-3 h-3 text-pink-400/60 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] shrink-0" />
        <span>A continuación ({queue.length})</span>
      </header>

      <ul className="flex flex-col gap-1 list-none p-0 m-0">
        {upcoming.map((item, index) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-1.5 py-0.5 bg-transparent"
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-pink-600/50 text-white/80 text-[9px] font-black font-mono shrink-0 shadow-sm">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[clamp(11px,0.8vw,13px)] font-bold text-white/45 truncate leading-tight tv-text-outline">
                  {item.title}
                </p>
                <div className="flex items-center gap-1 text-[clamp(9px,0.65vw,11px)] text-white/35 font-medium tv-text-outline-sm">
                  <User className="w-2.5 h-2.5 text-pink-400/50 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
                  <span className="truncate">
                    {item.requested_by.includes('Auto-DJ') ? 'Auto-DJ' : item.requested_by} • {item.author}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[clamp(9px,0.65vw,11px)] font-mono text-white/35 shrink-0 tv-text-outline-sm">
              <ArrowRight className="w-2.5 h-2.5 text-pink-400/50 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
              <span>{item.duration_text || '3:00'}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};
