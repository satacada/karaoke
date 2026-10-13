import { useRef, type FC, type TouchEvent, type DragEvent } from 'react';
import { GripVertical, Zap, Trash2, ArrowUp, ArrowDown, User } from 'lucide-react';
import { parseSongMeta } from '../../utils/songMeta';
import type { QueueItem } from '../../types';

interface HostQueueItemProps {
  item: QueueItem;
  index: number;
  totalItems: number;
  onMoveToNext: (id: string) => void;
  onMoveUp: (id: string, currentPos: number) => void;
  onMoveDown: (id: string, currentPos: number) => void;
  onDelete: (item: QueueItem) => void;
  onDragStart: (e: DragEvent, index: number) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent, targetIndex: number) => void;
}

export const HostQueueItem: FC<HostQueueItemProps> = ({
  item, index, totalItems, onMoveToNext, onMoveUp, onMoveDown,
  onDelete, onDragStart, onDragOver, onDrop,
}) => {
  const { dedication, isVip } = parseSongMeta(item);
  const startYRef = useRef(0);
  const handleTouchStart = (e: TouchEvent) => { startYRef.current = e.touches[0].clientY; };
  const handleTouchMove = (e: TouchEvent) => {
    if (!startYRef.current) return;
    const dy = e.touches[0].clientY - startYRef.current;
    if (dy > 35 && index < totalItems - 1) {
      onMoveDown(item.id, item.priority_order);
      startYRef.current = e.touches[0].clientY;
    } else if (dy < -35 && index > 0) {
      onMoveUp(item.id, item.priority_order);
      startYRef.current = e.touches[0].clientY;
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className="flex items-center justify-between gap-2.5 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-700/80 shadow-md active:bg-zinc-900 transition-all select-none"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => { startYRef.current = 0; }}
          className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-white p-1 touch-none"
          title="Arrastra con el dedo"
        >
          <GripVertical className="w-5 h-5 text-pink-400" />
        </div>
        <span className="w-6 h-6 rounded-lg bg-pink-950/80 border border-pink-500/50 text-white text-xs font-mono font-black flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-semibold text-white truncate leading-tight">{item.title}</h3>
            {isVip && <span className="shrink-0 px-1 py-0.2 text-[9px] font-black bg-amber-400 text-zinc-950 rounded">VIP ⚡</span>}
          </div>
          {dedication && <p className="text-[10px] text-pink-300/90 italic truncate">💌 &quot;{dedication}&quot;</p>}
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
            {item.requested_by.includes('Auto-DJ') ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-purple-950/80 border border-purple-500/30 text-[10px] font-bold text-purple-300">
                <span>📻</span>
                <span>Auto-DJ Ambiente</span>
              </span>
            ) : (
              <>
                <User className="w-3 h-3 text-pink-400 shrink-0" />
                <span className="truncate text-pink-300 font-medium">{item.requested_by}</span>
              </>
            )}
            <span className="text-zinc-600">•</span>
            <span className="font-mono text-zinc-500">{item.duration_text || '3:00'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {index > 0 && (
          <button
            onClick={() => onMoveToNext(item.id)}
            title="Elegir esta canción para que sea la siguiente"
            className="px-2 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 text-white font-black text-[10px] border border-white/40 shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Siguiente</span>
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
