import type { FC } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface HostResetQueueModalProps {
  isOpen: boolean;
  isResetting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const HostResetQueueModal: FC<HostResetQueueModalProps> = ({
  isOpen,
  isResetting,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl animate-scale-in text-zinc-100">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h2 className="text-lg font-bold text-center text-white mb-2">
          ¿Empezar de cero la fiesta?
        </h2>
        <p className="text-xs text-zinc-400 text-center mb-6 leading-relaxed">
          Esto eliminará todas las canciones en cola de ayer o de la noche, detendrá la música y regresará la TV a la pantalla de espera.
        </p>

        <div className="flex gap-2.5">
          <button
            type="button"
            disabled={isResetting}
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-zinc-800 text-zinc-300 font-semibold text-xs active:scale-95 transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isResetting}
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs shadow-lg shadow-rose-600/40 flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Vaciando...' : 'Sí, Vaciar Todo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
