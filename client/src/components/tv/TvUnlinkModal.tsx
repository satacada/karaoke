import { useState, useEffect, type FC } from 'react';
import { X, Tv, QrCode, LogOut, ArrowLeft, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getHostUrl } from '../../utils/appUrl';

interface TvUnlinkModalProps {
  isOpen: boolean; roomCode: string; roomName?: string;
  onClose: () => void; onConfirmUnlink: () => void; onSwitchToHost?: () => void;
}

export const TvUnlinkModal: FC<TvUnlinkModalProps> = ({ isOpen, roomCode, onClose, onSwitchToHost }) => {
  const [view, setView] = useState<'menu' | 'admin_qr'>('menu');
  useEffect(() => { if (isOpen) setView('menu'); }, [isOpen]);
  if (!isOpen) return null;

  const adminUrl = getHostUrl(roomCode);
  const handleExitApp = () => {
    try {
      const cap = (window as unknown as { Capacitor?: { Plugins?: { App?: { exitApp: () => void } } } })?.Capacitor;
      if (cap?.Plugins?.App?.exitApp) { cap.Plugins.App.exitApp(); return; }
    } catch {}
    window.close();
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 select-none animate-in fade-in duration-150 pointer-events-auto" onClick={onClose}>
      <div className="w-full max-w-sm bg-zinc-900 border-2 border-zinc-700/80 rounded-3xl p-6 shadow-2xl space-y-4 pointer-events-auto relative text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-pink-400" /><h2 className="font-black text-sm tracking-wide text-white uppercase">{view === 'menu' ? 'Ajustes de Pantalla' : 'QR Administrador (DJ)'}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        {view === 'menu' ? (
          <div className="flex flex-col gap-3 py-1">
            <button type="button" onClick={() => setView('admin_qr')} className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black text-sm flex items-center justify-between shadow-xl active:scale-98 cursor-pointer border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center"><QrCode className="w-5 h-5 text-white" /></div>
                <div className="text-left"><span className="block text-sm font-black">1. QR Admin</span><span className="block text-[10px] text-white/80 font-medium">Escanear para ser Administrador</span></div>
              </div>
              <span className="text-xs text-white/80">▶</span>
            </button>
            <button type="button" onClick={handleExitApp} className="w-full py-4 px-4 rounded-2xl bg-zinc-800/90 hover:bg-rose-950/80 border border-zinc-700 hover:border-rose-500 text-rose-200 font-black text-sm flex items-center justify-between shadow-xl active:scale-98 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center"><LogOut className="w-5 h-5 text-rose-400" /></div>
                <div className="text-left"><span className="block text-sm font-black text-rose-300">2. Salir App</span><span className="block text-[10px] text-zinc-400 font-medium">Cerrar y salir de la aplicación</span></div>
              </div>
              <span className="text-xs text-rose-400">🚪</span>
            </button>
            <p className="text-[10px] text-zinc-500 text-center font-mono mt-2">Sala TV: <b className="text-pink-400">{roomCode}</b></p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-1">
            <div className="bg-white p-3 rounded-2xl shadow-2xl border-4 border-purple-500/40">
              <QRCodeSVG value={adminUrl} size={180} level="M" includeMargin={false} />
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-white">Escanear con tu Celular para ser Administrador</p>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Sala: <b className="text-pink-400 uppercase">{roomCode}</b></p>
            </div>
            {onSwitchToHost && (
              <button type="button" onClick={() => { onClose(); onSwitchToHost(); }} className="w-full py-2 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer">
                <Smartphone className="w-4 h-4" /><span>Abrir Administrador en esta pantalla</span>
              </button>
            )}
            <button type="button" onClick={() => setView('menu')} className="w-full mt-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer">
              <ArrowLeft className="w-4 h-4" /><span>Volver a Opciones</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
