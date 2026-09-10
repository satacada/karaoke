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
        className="absolute top-[clamp(0.75rem,2vh,1.5rem)] left-[clamp(0.75rem,2vw,1.5rem)] z-30 flex items-center gap-1.5 px-[clamp(0.6rem,1.2vw,1rem)] py-[clamp(0.35rem,0.8vh,0.6rem)] rounded-2xl tv-translucent-card text-zinc-200 text-[clamp(11px,0.85vw,13px)] font-semibold shadow-xl transition-all"
      >
        <ListMusic className="w-3.5 h-3.5 text-purple-400 drop-shadow-[0_1px_2px_#000]" />
        <span className="tv-text-outline">Cola libre: ¡sé el próximo en poner música!</span>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Próximas canciones en cola"
      className="absolute top-[clamp(0.75rem,2vh,1.5rem)] left-[clamp(0.75rem,2vw,1.5rem)] z-30 flex flex-col gap-1 max-w-[clamp(13rem,24vw,22rem)] w-full"
    >
      <header className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg tv-translucent-card text-[clamp(10px,0.75vw,12px)] font-bold text-zinc-200 uppercase tracking-wide w-fit shadow-sm">
        <ListMusic className="w-3 h-3 text-pink-400 drop-shadow-[0_1px_2px_#000]" />
        <span className="tv-text-outline">A continuación ({queue.length})</span>
      </header>

      <ul className="flex flex-col gap-1 list-none p-0 m-0">
        {upcoming.map((item, index) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 px-[clamp(0.4rem,0.8vw,0.75rem)] py-[clamp(0.25rem,0.5vh,0.5rem)] rounded-lg tv-translucent-card text-white shadow transition-all"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-purple-600/70 border border-purple-400/50 text-white text-[10px] font-bold font-mono shadow-sm shrink-0">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[clamp(11px,0.8vw,13px)] font-semibold truncate leading-tight text-white tv-text-outline">
                  {item.title}
                </p>
                <div className="flex items-center gap-1 text-[clamp(9px,0.65vw,11px)]">
                  <User className="w-2.5 h-2.5 text-pink-400 shrink-0" />
                  <span className="truncate text-pink-300 font-medium tv-text-outline-sm">
                    {item.requested_by.includes('Auto-DJ') ? 'Auto-DJ' : item.requested_by}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[clamp(9px,0.65vw,11px)] font-mono font-medium text-zinc-300 shrink-0 tv-text-outline-sm">
              <ArrowRight className="w-3 h-3 text-purple-400 shrink-0" />
              <span>{item.duration_text || '3:00'}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};
