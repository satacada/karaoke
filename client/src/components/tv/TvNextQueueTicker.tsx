import type { FC } from 'react';
import { ListMusic, User, ArrowRight } from 'lucide-react';
import type { QueueItem } from '../../types';

interface TvNextQueueTickerProps {
  queue: QueueItem[];
}

export const TvNextQueueTicker: FC<TvNextQueueTickerProps> = ({ queue }) => {
  const upcoming = queue.slice(0, 2);

  if (upcoming.length === 0) {
    return (
      <aside
        aria-label="Estado de la cola"
        className="absolute top-3 left-3 z-40 flex items-center gap-1.5 px-2.5 py-1 bg-transparent text-white text-xs font-bold whitespace-nowrap tv-text-outline select-none"
      >
        <ListMusic className="w-3.5 h-3.5 text-purple-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] shrink-0" />
        <span className="tracking-wide">Cola libre: ¡pide tu tema!</span>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Próximas canciones en cola"
      className="absolute top-3 left-3 z-40 flex flex-col gap-1 w-[clamp(14rem,23vw,19rem)] bg-transparent p-1.5 select-none"
    >
      <header className="flex items-center gap-1 text-[clamp(9px,0.7vw,11px)] font-black text-white uppercase tracking-wider tv-text-outline">
        <ListMusic className="w-3 h-3 text-pink-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] shrink-0" />
        <span>A continuación ({queue.length})</span>
      </header>

      <ul className="flex flex-col gap-1 list-none p-0 m-0">
        {upcoming.map((item, index) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-1.5 px-2 py-1 rounded-lg bg-black/25 backdrop-blur-[2px] border border-white/10 text-white shadow-sm"
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-purple-600/90 text-white text-[9px] font-black font-mono shrink-0 shadow-sm border border-purple-400/40">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[clamp(10px,0.75vw,12px)] font-bold text-white truncate leading-tight tv-text-outline">
                  {item.title}
                </p>
                <div className="flex items-center gap-1 text-[clamp(8px,0.6vw,10px)] text-zinc-200 tv-text-outline-sm">
                  <User className="w-2.5 h-2.5 text-pink-300 shrink-0" />
                  <span className="truncate font-medium">
                    {item.requested_by.includes('Auto-DJ') ? 'Auto-DJ' : item.requested_by} • {item.author}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[clamp(8px,0.6vw,10px)] font-mono font-bold text-white tv-text-outline-sm shrink-0">
              <ArrowRight className="w-2.5 h-2.5 text-purple-300 shrink-0" />
              <span>{item.duration_text || '3:00'}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};
