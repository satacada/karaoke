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
        className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-zinc-400 text-sm font-medium shadow-xl"
      >
        <ListMusic className="w-4 h-4 text-purple-400" />
        <span>Cola libre: ¡sé el próximo en poner música!</span>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Próximas canciones en cola"
      className="absolute top-6 left-6 z-30 flex flex-col gap-2 max-w-md w-full"
    >
      <header className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/85 backdrop-blur-md border border-zinc-800 text-xs font-bold text-zinc-300 uppercase tracking-wider w-fit shadow-md">
        <ListMusic className="w-3.5 h-3.5 text-pink-400" />
        <span>A continuación ({queue.length})</span>
      </header>

      <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
        {upcoming.map((item, index) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-zinc-950/85 backdrop-blur-md border border-purple-500/20 text-white shadow-lg transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 text-xs font-bold font-mono">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate leading-tight">
                  {item.title}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <User className="w-3 h-3 text-pink-400" />
                  <span className="truncate font-medium text-pink-300">
                    {item.requested_by}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-mono text-zinc-500 shrink-0">
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              <span>{item.duration_text || '3:00'}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};
