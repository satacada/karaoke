import type { FC } from 'react';
import { X, Tv, AlertTriangle, Sliders } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getHostUrl } from '../../utils/appUrl';

interface TvUnlinkModalProps {
  isOpen: boolean;
  roomCode: string;
  roomName?: string;
  onClose: () => void;
  onConfirmUnlink: () => void;
  onSwitchToHost?: () => void;
}

export const TvUnlinkModal: FC<TvUnlinkModalProps> = ({
  isOpen, roomCode, roomName, onClose, onConfirmUnlink, onSwitchToHost,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Tv className="w-4 h-4 text-purple-400" />
            <span>Configuración y Control de Pantalla</span>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-zinc-950/80 border border-purple-500/30 rounded-2xl flex flex-col items-center gap-1.5 text-center">
          <div className="bg-white p-2 rounded-xl shadow-sm">
            <QRCodeSVG value={getHostUrl(roomCode)} size={130} level="M" includeMargin={false} />
          </div>
          <span className="text-xs font-bold text-purple-300">QR para Consola de Administrador / DJ</span>
          <span className="text-[10px] text-zinc-400">Escanea con tu celular para controlar la TV sin moverte</span>
          {onSwitchToHost && (
            <button
              type="button"
              onClick={() => { onClose(); onSwitchToHost(); }}
              className="mt-1 w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Abrir Consola Administrador en esta pantalla</span>
            </button>
          )}
        </div>

        <div className="p-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium">Ambiente vinculado: <b className="text-white">{roomName || 'Rockola Live'}</b></span>
          <span className="font-mono text-purple-400 font-bold uppercase">{roomCode}</span>
        </div>

        <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-amber-300 text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
          <span>Al desvincular, la TV saldrá de esta sala y volverá a mostrar el QR inicial.</span>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors cursor-pointer">
            Cerrar
          </button>
          <button type="button" onClick={onConfirmUnlink} className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg cursor-pointer">
            Desvincular Pantalla
          </button>
        </div>
      </div>
    </div>
  );
};
