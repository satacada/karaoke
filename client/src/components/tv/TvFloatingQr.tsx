import { useState, type FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { WifiOff, Radio, Sliders, Monitor } from 'lucide-react';
import { getHostUrl } from '../../utils/appUrl';

interface TvFloatingQrProps {
  roomCode: string;
  joinUrl: string;
  hostUrl?: string;
  currentSongId?: string;
  onSwitchToHost?: () => void;
}

export const TvFloatingQr: FC<TvFloatingQrProps> = ({ roomCode, joinUrl, hostUrl, onSwitchToHost }) => {
  const [qrMode, setQrMode] = useState<'guest' | 'host'>('guest');
  const activeHostUrl = hostUrl || getHostUrl(roomCode);
  const activeUrl = qrMode === 'guest' ? joinUrl : activeHostUrl;

  return (
    <div
      aria-label="Código QR interactivo de Rockola"
      className="w-full flex flex-col items-center bg-zinc-950/90 backdrop-blur-xl border-2 border-purple-500/40 shadow-2xl shadow-purple-950/60 rounded-2xl p-2.5 transition-all duration-300 pointer-events-auto"
    >
      <nav className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-xl border border-zinc-800 w-full mb-1.5">
        <button
          type="button"
          onClick={() => setQrMode('guest')}
          className={`flex-1 py-1 rounded-lg text-[clamp(8px,0.7vw,11px)] font-black transition-all ${
            qrMode === 'guest'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          📱 Pedidos
        </button>
        <button
          type="button"
          onClick={() => setQrMode('host')}
          className={`flex-1 py-1 rounded-lg text-[clamp(8px,0.7vw,11px)] font-black transition-all ${
            qrMode === 'host'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          🎧 Admin
        </button>
      </nav>

      <header className="flex items-center gap-1.5 text-[clamp(9px,0.75vw,12px)] font-black text-pink-300 uppercase tracking-wider mb-1">
        {qrMode === 'guest' ? (
          <>
            <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse shrink-0" />
            <span className="truncate">Escanea y pide tema</span>
          </>
        ) : (
          <>
            <Sliders className="w-3.5 h-3.5 text-purple-400 animate-pulse shrink-0" />
            <span className="truncate">Consola DJ Admin</span>
          </>
        )}
      </header>

      <div className="bg-white p-2 rounded-2xl shadow-2xl w-[clamp(145px,13.5vw,190px)] h-[clamp(145px,13.5vw,190px)] flex items-center justify-center shrink-0 border-2 border-white">
        <QRCodeSVG value={activeUrl} className="w-full h-full" level="M" includeMargin={false} />
      </div>

      <div className="mt-1 text-center">
        <span className="text-[clamp(9px,0.7vw,11px)] text-zinc-300 font-mono block leading-tight">
          Sala: <b className="text-white font-black tracking-widest text-[clamp(11px,0.85vw,13px)] bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-700">{roomCode}</b>
        </span>
      </div>

      {qrMode === 'guest' ? (
        <footer className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[clamp(8px,0.65vw,10px)] text-zinc-300 font-bold leading-none">
          <WifiOff className="w-3 h-3 text-amber-400 shrink-0" />
          <span>Usa tus datos (4G/5G)</span>
        </footer>
      ) : (
        onSwitchToHost && (
          <button
            type="button"
            onClick={onSwitchToHost}
            className="mt-1 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[clamp(8px,0.65vw,10px)] transition-all shadow-md cursor-pointer"
          >
            <Monitor className="w-3 h-3" />
            <span>Abrir en TV</span>
          </button>
        )
      )}
    </div>
  );
};
