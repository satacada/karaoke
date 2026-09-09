import type { FC } from 'react';
import { Trash2 } from 'lucide-react';
import type { QueueItem } from '../../types';

interface HostDeleteSongModalProps {
  item: QueueItem | null;
  onConfirm: () => void;
  onClose: () => void;
}

export const HostDeleteSongModal: FC<HostDeleteSongModalProps> = ({
  item,
  onConfirm,
  onClose,
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl text-zinc-100">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3 mx-auto">
          <Trash2 className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-center text-white mb-1">¿Quitar canción?</h3>
        <p className="text-xs text-zinc-400 text-center mb-4 truncate font-medium">
          "{item.title}"
        </p>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-xs active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs active:scale-95"
          >
            Quitar
          </button>
        </div>
      </div>
    </div>
  );
};
