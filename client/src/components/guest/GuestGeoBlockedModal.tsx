import type { FC } from 'react';
import { MapPinOff } from 'lucide-react';

interface GuestGeoBlockedModalProps {
  isOpen: boolean;
  distanceMeters?: number;
  onClose: () => void;
}

export const GuestGeoBlockedModal: FC<GuestGeoBlockedModalProps> = ({
  isOpen,
  distanceMeters,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-center">
        <div className="mx-auto w-14 h-14 bg-amber-950/60 border border-amber-800/40 rounded-2xl flex items-center justify-center mb-4">
          <MapPinOff className="w-7 h-7 text-amber-400" />
        </div>

        <h3 className="text-lg font-bold text-white mb-2">¡Estás lejos del local!</h3>
        <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
          Tu tiempo de gracia inicial de 60 minutos ha finalizado. Para pedir canciones en la fiesta debes encontrarte dentro del local.
        </p>

        {distanceMeters !== undefined && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 mb-5 text-xs text-amber-300/90 font-mono">
            Distancia detectada: ~{distanceMeters} metros (&gt; 200m)
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors shadow-lg shadow-amber-500/20"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
