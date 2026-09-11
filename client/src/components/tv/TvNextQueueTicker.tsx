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
        className="absolute top-[clamp(0.5rem,1.5vh,1rem)] left-[clamp(0.5rem,1.5vw,1rem)] z-30 flex items-center gap-1 px-2 py-1 rounded-xl bg-black/35 backdrop-blur-sm border border-white/10 text-zinc-300 text-[clamp(9px,0.7vw,11px)] font-semibold shadow-md transition-all"
      >
        <ListMusic className="w-3 h-3 text-purple-400 drop-shadow-[0_1px_2px_#000]" />
        <span className="tv-text-outline">Cola libre: ¡pide tu tema!</span>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Próximas canciones en cola"
      className="absolute top-3 left-3 z-40 flex flex-col gap-1 w-[clamp(14rem,23vw,19rem)] bg-zinc-950/90 backdrop-blur-md border border-white/20 rounded-xl p-2 shadow-2xl"
    >
      <header className="flex items-center gap-1 text-[clamp(8px,0.65vw,10px)] font-bold text-zinc-200 uppercase tracking-wide">
        <ListMusic className="w-3 h-3 text-pink-400 shrink-0" />
        <span>A continuación ({queue.length})</span>
      </header>

      <ul className="flex flex-col gap-1 list-none p-0 m-0">
        {upcoming.map((item, index) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-1.5 px-2 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800 text-white shadow-xs"
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-black font-mono shrink-0">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[clamp(10px,0.75vw,12px)] font-bold text-white truncate leading-tight">
                  {item.title}
                </p>
                <div className="flex items-center gap-1 text-[clamp(8px,0.6vw,10px)] text-pink-300">
                  <User className="w-2.5 h-2.5 text-pink-400 shrink-0" />
                  <span className="truncate font-medium">
                    {item.requested_by.includes('Auto-DJ') ? 'Auto-DJ' : item.requested_by}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[clamp(8px,0.6vw,10px)] font-mono font-medium text-zinc-400 shrink-0">
              <ArrowRight className="w-2.5 h-2.5 text-purple-400 shrink-0" />
              <span>{item.duration_text || '3:00'}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};
