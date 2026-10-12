import { useState, type FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { WifiOff, Monitor } from 'lucide-react';
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
      className="flex flex-col items-center bg-zinc-950/80 backdrop-blur-md border border-purple-500/40 shadow-xl rounded-2xl p-2 transition-all duration-300 pointer-events-auto max-w-[150px] shrink-0"
    >
      <nav className="flex items-center gap-0.5 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 w-full mb-1">
        <button
          type="button"
          onClick={() => setQrMode('guest')}
          className={`flex-1 py-0.5 rounded text-[9px] font-black transition-all ${
            qrMode === 'guest'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-xs'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          📱 Pedir
        </button>
        <button
          type="button"
          onClick={() => setQrMode('host')}
          className={`flex-1 py-0.5 rounded text-[9px] font-black transition-all ${
            qrMode === 'host'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          🎧 DJ
        </button>
      </nav>

      <div className="bg-white p-1 rounded-xl shadow-lg w-[115px] h-[115px] flex items-center justify-center shrink-0 border border-white">
        <QRCodeSVG value={activeUrl} className="w-full h-full" level="M" includeMargin={false} />
      </div>

      <div className="mt-1 text-center w-full">
        <span className="text-[10px] text-zinc-300 font-mono block leading-tight">
          Sala: <b className="text-white font-black tracking-widest text-[11px] bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-700">{roomCode}</b>
        </span>
      </div>

      {qrMode === 'guest' ? (
        <footer className="mt-1 flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-[8px] text-zinc-300 font-bold leading-none w-full">
          <WifiOff className="w-2.5 h-2.5 text-amber-400 shrink-0" />
          <span>Datos 4G/5G</span>
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
