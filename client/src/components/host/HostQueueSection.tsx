import type { FC } from 'react';
import { ListMusic } from 'lucide-react';
import { HostEmptyQueueCard } from './HostEmptyQueueCard';
import { HostQueueItem } from './HostQueueItem';
import type { KaraokeRoom, QueueItem } from '../../types';

interface HostQueueSectionProps {
  room: KaraokeRoom | null;
  currentSong: QueueItem | null;
  nextSongs: QueueItem[];
  isStartingAutoDj: boolean;
  onOpenAutoDj: () => void;
  onStartAutoDj?: () => void;
  onStartGenre: (genre: string) => void;
  onMoveToNext: (id: string) => void;
  onMoveUp: (id: string, pos: number) => void;
  onMoveDown: (id: string, pos: number) => void;
  onDelete: (item: QueueItem) => void;
  onDragStart: (e: React.DragEvent, idx: number) => void;
  onDrop: (idx: number) => void;
}

export const HostQueueSection: FC<HostQueueSectionProps> = ({
  room, currentSong, nextSongs, isStartingAutoDj, onOpenAutoDj, onStartAutoDj, onStartGenre,
  onMoveToNext, onMoveUp, onMoveDown, onDelete, onDragStart, onDrop,
}) => {
  return (
    <section className="flex-1 flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">
        <ListMusic className="w-4 h-4 text-purple-400" />
        <span>Cola ({nextSongs.length})</span>
      </div>
      {nextSongs.length === 0 ? (
        <HostEmptyQueueCard
          room={room}
          onOpenAutoDj={onOpenAutoDj}
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
