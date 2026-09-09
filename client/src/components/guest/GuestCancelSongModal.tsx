import type { FC } from 'react';
import { AlertTriangle } from 'lucide-react';

interface GuestCancelSongModalProps {
  isOpen: boolean;
  songTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const GuestCancelSongModal: FC<GuestCancelSongModalProps> = ({
  isOpen,
  songTitle,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl text-center">
        <div className="mx-auto w-12 h-12 bg-rose-950/60 border border-rose-800/40 rounded-2xl flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">¿Cancelar esta canción?</h3>
        <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
          Vas a quitar <span className="text-white font-semibold">"{songTitle}"</span> de la fila.
          Perderás tu turno y deberás pedirla nuevamente si cambias de opinión.
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="py-3 px-4 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="py-3 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-lg shadow-rose-600/20"
          >
            Sí, cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
