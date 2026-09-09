import type { FC } from 'react';
import { GripVertical, Zap, Trash2, ArrowUp, ArrowDown, User } from 'lucide-react';
import type { QueueItem } from '../../types';

interface HostQueueItemProps {
  item: QueueItem;
  index: number;
  totalItems: number;
  onMoveToNext: (id: string) => void;
  onMoveUp: (id: string, currentPos: number) => void;
  onMoveDown: (id: string, currentPos: number) => void;
  onDelete: (item: QueueItem) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetIndex: number) => void;
}

export const HostQueueItem: FC<HostQueueItemProps> = ({
  item,
  index,
  totalItems,
  onMoveToNext,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className="flex items-center justify-between gap-2.5 p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-sm active:bg-zinc-800 transition-all select-none"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-zinc-300 p-1">
          <GripVertical className="w-5 h-5" />
        </div>
        <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-semibold text-white truncate leading-tight">{item.title}</h3>
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
            <User className="w-3 h-3 text-pink-400 shrink-0" />
            <span className="truncate text-pink-300 font-medium">{item.requested_by}</span>
            <span className="text-zinc-600">•</span>
            <span className="font-mono text-zinc-500">{item.duration_text || '3:00'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {index > 0 && (
          <button
            onClick={() => onMoveToNext(item.id)}
            title="Poner siguiente"
            className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/40 active:scale-90 transition-all"
          >
            <Zap className="w-4 h-4" />
          </button>
        )}
        <div className="flex flex-col gap-0.5">
          <button
            disabled={index === 0}
            onClick={() => onMoveUp(item.id, item.priority_order)}
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 active:scale-90"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={index === totalItems - 1}
            onClick={() => onMoveDown(item.id, item.priority_order)}
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 active:scale-90"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
        <button
          onClick={() => onDelete(item)}
          className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-90"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
