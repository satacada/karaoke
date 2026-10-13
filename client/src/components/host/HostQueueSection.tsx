import type { FC } from 'react';
import { ListMusic, Search } from 'lucide-react';
import { HostEmptyQueueCard } from './HostEmptyQueueCard';
import { HostQueueItem } from './HostQueueItem';
import type { KaraokeRoom, QueueItem } from '../../types';

interface HostQueueSectionProps {
  room: KaraokeRoom | null;
  currentSong: QueueItem | null;
  nextSongs: QueueItem[];
  isStartingAutoDj: boolean;
  onOpenAutoDj: () => void;
  onOpenSearch?: () => void;
  onStartAutoDj?: () => void;
  onStartGenre: (genre: string) => void;
  onMoveToNext: (id: string) => void;
  onPlayNow?: (item: QueueItem) => void;
  onMoveUp: (id: string, pos: number) => void;
  onMoveDown: (id: string, pos: number) => void;
  onDelete: (item: QueueItem) => void;
  onDragStart: (e: React.DragEvent, idx: number) => void;
  onDrop: (idx: number) => void;
}

export const HostQueueSection: FC<HostQueueSectionProps> = ({
  room, currentSong, nextSongs, isStartingAutoDj, onOpenAutoDj, onOpenSearch, onStartAutoDj, onStartGenre,
  onMoveToNext, onPlayNow, onMoveUp, onMoveDown, onDelete, onDragStart, onDrop,
}) => {
  return (
    <section className="flex-1 flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">
        <div className="flex items-center gap-1.5">
          <ListMusic className="w-4 h-4 text-purple-400" />
          <span>Cola ({nextSongs.length})</span>
        </div>
        {onOpenSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 text-[11px] font-bold active:scale-95 transition-all cursor-pointer"
          >
            <Search className="w-3 h-3" />
            <span>+ Buscar Tema</span>
          </button>
        )}
      </div>

      {nextSongs.length === 0 ? (
        <HostEmptyQueueCard
          room={room}
          onOpenAutoDj={onOpenAutoDj}
          onOpenSearch={onOpenSearch}
          onStartAutoDj={!currentSong ? onStartAutoDj : undefined}
          onStartGenre={onStartGenre}
          isStartingAutoDj={isStartingAutoDj}
        />
      ) : (
        nextSongs.map((item, idx) => (
          <HostQueueItem
            key={item.id}
            item={item}
            index={idx}
            totalItems={nextSongs.length}
            onMoveToNext={onMoveToNext}
            onPlayNow={onPlayNow}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onDelete={onDelete}
            onDragStart={onDragStart}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(_, tIdx) => onDrop(tIdx)}
          />
        ))
      )}
    </section>
  );
};
