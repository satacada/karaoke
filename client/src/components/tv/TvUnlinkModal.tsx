import { useState, type FC } from 'react';
import { X, Tv, Sliders, Terminal } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getHostUrl } from '../../utils/appUrl';
import { SystemDiagnosticsModal } from '../common/SystemDiagnosticsModal';

interface TvUnlinkModalProps {
  isOpen: boolean; roomCode: string; roomName?: string;
  onClose: () => void; onConfirmUnlink: () => void; onSwitchToHost?: () => void;
}

export const TvUnlinkModal: FC<TvUnlinkModalProps> = ({
  isOpen, roomCode, roomName, onClose, onConfirmUnlink, onSwitchToHost,
}) => {
  const [showDiag, setShowDiag] = useState(false);
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-150">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Tv className="w-4 h-4 text-purple-400" /><span>Configuración de Pantalla</span>
            </div>
            <button type="button" onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
          </div>

          <div className="p-3 bg-zinc-950/80 border border-purple-500/30 rounded-2xl flex flex-col items-center gap-1.5 text-center">
            <div className="bg-white p-2 rounded-xl shadow-sm"><QRCodeSVG value={getHostUrl(roomCode)} size={110} level="M" includeMargin={false} /></div>
            <span className="text-xs font-bold text-purple-300">QR para Consola DJ</span>
            {onSwitchToHost && (
              <button type="button" onClick={() => { onClose(); onSwitchToHost(); }} className="mt-1 w-full py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer">
                <Sliders className="w-3.5 h-3.5" /><span>Abrir Consola en esta pantalla</span>
              </button>
            )}
          </div>

          <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium truncate max-w-[200px]">Sala: <b className="text-white">{roomName || 'Rockola'}</b></span>
            <span className="font-mono text-purple-400 font-bold uppercase">{roomCode}</span>
          </div>

          <button type="button" onClick={() => setShowDiag(true)} className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-pink-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer">
            <Terminal className="w-3.5 h-3.5 text-pink-400" /><span>📋 Ver / Copiar Diagnóstico de Errores</span>
          </button>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs cursor-pointer">Cerrar</button>
            <button type="button" onClick={onConfirmUnlink} className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg cursor-pointer">Desvincular</button>
          </div>

          <div className="pt-1.5 border-t border-zinc-800">
            <button type="button" onClick={() => { const cap = (window as unknown as { Capacitor?: { Plugins?: { App?: { exitApp: () => void } } } })?.Capacitor; if (cap?.Plugins?.App?.exitApp) cap.Plugins.App.exitApp(); else window.close(); }} className="w-full py-1.5 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/20 text-rose-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer">
              <span>🚪 Salir de la app</span>
            </button>
          </div>
        </div>
      </div>
      <SystemDiagnosticsModal isOpen={showDiag} roomCode={roomCode} onClose={() => setShowDiag(false)} />
    </>
  );
};
