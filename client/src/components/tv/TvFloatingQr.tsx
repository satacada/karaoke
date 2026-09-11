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
      className="w-full flex flex-col items-center bg-black/45 backdrop-blur-md border border-purple-500/30 shadow-xl shadow-purple-950/25 rounded-xl p-1.5 transition-all duration-300 pointer-events-auto"
    >
      <nav className="flex items-center gap-0.5 bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800 w-full mb-1">
        <button
          type="button"
          onClick={() => setQrMode('guest')}
          className={`flex-1 py-0.5 rounded text-[clamp(7px,0.55vw,9px)] font-bold transition-all ${
            qrMode === 'guest'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-xs'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          📱 Pedidos
        </button>
        <button
          type="button"
          onClick={() => setQrMode('host')}
          className={`flex-1 py-0.5 rounded text-[clamp(7px,0.55vw,9px)] font-bold transition-all ${
            qrMode === 'host'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          🎧 Admin
        </button>
      </nav>

      <header className="flex items-center gap-1 text-[clamp(8px,0.65vw,10px)] font-bold text-purple-300 uppercase tracking-wider mb-0.5">
        {qrMode === 'guest' ? (
          <>
            <Radio className="w-2.5 h-2.5 text-pink-400 animate-pulse shrink-0" />
            <span className="truncate">Pide tu tema</span>
          </>
        ) : (
          <>
            <Sliders className="w-2.5 h-2.5 text-purple-400 animate-pulse shrink-0" />
            <span className="truncate">Control DJ</span>
          </>
        )}
      </header>

      <div className="bg-white p-1 rounded-lg shadow-sm w-[clamp(64px,6.5vw,96px)] h-[clamp(64px,6.5vw,96px)] flex items-center justify-center shrink-0">
        <QRCodeSVG value={activeUrl} className="w-full h-full" level="M" includeMargin={false} />
      </div>

      <div className="mt-0.5 text-center">
        <span className="text-[clamp(8px,0.6vw,10px)] text-zinc-300 font-mono block leading-tight">
          Sala: <b className="text-white font-black tracking-wider text-[clamp(9px,0.7vw,11px)]">{roomCode}</b>
        </span>
      </div>

      {qrMode === 'guest' ? (
        <footer className="mt-0.5 flex items-center gap-0.5 px-1 py-0.2 rounded-full bg-zinc-900/70 border border-zinc-800/80 text-[clamp(7px,0.55vw,9px)] text-zinc-400 font-medium leading-none">
          <WifiOff className="w-2 h-2 text-amber-400 shrink-0" />
          <span>Usa tus datos</span>
        </footer>
      ) : (
        onSwitchToHost && (
          <button
            type="button"
            onClick={onSwitchToHost}
            className="mt-0.5 flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-[clamp(7px,0.55vw,9px)] transition-all shadow-xs"
          >
            <Monitor className="w-2 h-2" />
            <span>Abrir en TV</span>
          </button>
        )
      )}
    </div>
  );
};
