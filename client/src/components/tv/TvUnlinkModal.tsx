import type { FC } from 'react';
import { X, Tv, AlertTriangle } from 'lucide-react';

interface TvUnlinkModalProps {
  isOpen: boolean;
  roomCode: string;
  roomName?: string;
  onClose: () => void;
  onConfirmUnlink: () => void;
}

export const TvUnlinkModal: FC<TvUnlinkModalProps> = ({
  isOpen, roomCode, roomName, onClose, onConfirmUnlink,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Tv className="w-4 h-4 text-purple-400" />
            <span>Configuración de Pantalla TV</span>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-1">
          <span className="text-[11px] text-zinc-400 block font-medium">Ambiente actualmente vinculado:</span>
          <p className="text-base font-black text-white">{roomName || 'Rockola Party Live'}</p>
          <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider block">Código: {roomCode}</span>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <span>Al desvincular, la TV saldrá de esta sala y volverá a mostrar la pantalla con el código QR para emparejarse con otro sector.</span>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={onConfirmUnlink} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/30">
            Desvincular Pantalla
          </button>
        </div>
      </div>
    </div>
  );
};
