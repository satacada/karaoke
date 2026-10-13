import { useState, type FC } from 'react';
import { X, Tv, Sliders, Terminal, Smartphone, LogOut } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getHostUrl, getJoinUrl } from '../../utils/appUrl';
import { SystemDiagnosticsModal } from '../common/SystemDiagnosticsModal';

interface TvUnlinkModalProps {
  isOpen: boolean; roomCode: string; roomName?: string;
  onClose: () => void; onConfirmUnlink: () => void; onSwitchToHost?: () => void;
}

export const TvUnlinkModal: FC<TvUnlinkModalProps> = ({
  isOpen, roomCode, onClose, onConfirmUnlink, onSwitchToHost,
}) => {
  const [qrType, setQrType] = useState<'host' | 'guest'>('host');
  const [showDiag, setShowDiag] = useState(false);
  if (!isOpen) return null;

  const currentUrl = qrType === 'host' ? getHostUrl(roomCode) : getJoinUrl(roomCode);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none animate-in fade-in duration-150 pointer-events-auto">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-3xl p-5 shadow-2xl space-y-3 pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Tv className="w-4 h-4 text-purple-400" /><span>Ajustes y Códigos QR de Pantalla</span>
            </div>
            <button type="button" onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
          </div>

          {/* Selector de tipo de QR: Administrador vs Clientes */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setQrType('host')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                qrType === 'host'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>QR Administrador (DJ)</span>
            </button>
            <button
              type="button"
              onClick={() => setQrType('guest')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                qrType === 'guest'
                  ? 'bg-gradient-to-r from-pink-600 to-amber-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>QR Clientes (Pedir)</span>
            </button>
          </div>

          {/* Código QR grande */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col items-center gap-2 text-center">
            <div className="bg-white p-2.5 rounded-2xl shadow-xl">
              <QRCodeSVG value={currentUrl} size={150} level="M" includeMargin={false} />
            </div>
            <div>
              <p className="text-xs font-black text-white">
                {qrType === 'host' ? '🎧 Escanear para Controlar como DJ Anfitrión' : '🎤 Escanear para Pedir Canciones (Clientes)'}
              </p>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Sala: <b className="text-pink-400 uppercase">{roomCode}</b></p>
            </div>
            {qrType === 'host' && onSwitchToHost && (
              <button type="button" onClick={() => { onClose(); onSwitchToHost(); }} className="mt-1 w-full py-1.5 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                <Sliders className="w-3.5 h-3.5" /><span>Abrir Consola DJ en esta misma pantalla</span>
              </button>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowDiag(true)} className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-pink-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer">
              <Terminal className="w-3.5 h-3.5 text-pink-400" /><span>Diagnóstico</span>
            </button>
            <button type="button" onClick={onConfirmUnlink} className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md cursor-pointer">
              Desvincular
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs cursor-pointer">
              Cerrar
            </button>
          </div>

          {/* Botón Salir de la Aplicación */}
          <div className="pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => {
                const cap = (window as unknown as { Capacitor?: { Plugins?: { App?: { exitApp: () => void } } } })?.Capacitor;
                if (cap?.Plugins?.App?.exitApp) cap.Plugins.App.exitApp();
                else window.close();
              }}
              className="w-full py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>🚪 Salir / Cerrar la Aplicación</span>
            </button>
          </div>
        </div>
      </div>
      <SystemDiagnosticsModal isOpen={showDiag} roomCode={roomCode} onClose={() => setShowDiag(false)} />
    </>
  );
};
