import type { FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { WifiOff, Radio } from 'lucide-react';

interface TvFloatingQrProps {
  roomCode: string;
  joinUrl: string;
  currentSongId?: string;
}

export const TvFloatingQr: FC<TvFloatingQrProps> = ({ roomCode, joinUrl }) => {
  return (
    <div
      aria-label="Código QR para pedir canciones en la Rockola"
      className="w-full flex flex-col items-center bg-black/35 backdrop-blur-sm border border-purple-500/25 shadow-lg shadow-purple-950/20 rounded-xl p-1.5 transition-all duration-300 hover:bg-black/60"
    >
      <header className="flex items-center gap-1 text-[clamp(8px,0.65vw,10px)] font-bold text-purple-300 uppercase tracking-wider mb-0.5">
        <Radio className="w-2.5 h-2.5 text-pink-400 animate-pulse shrink-0" />
        <span className="truncate">Pide tu tema</span>
      </header>

      <div className="bg-white p-1 rounded-lg shadow-sm w-[clamp(64px,6.5vw,96px)] h-[clamp(64px,6.5vw,96px)] flex items-center justify-center shrink-0">
        <QRCodeSVG value={joinUrl} className="w-full h-full" level="M" includeMargin={false} />
      </div>

      <div className="mt-0.5 text-center">
        <span className="text-[clamp(8px,0.6vw,10px)] text-zinc-300 font-mono block leading-tight">
          Sala: <b className="text-white font-black tracking-wider text-[clamp(9px,0.7vw,11px)]">{roomCode}</b>
        </span>
      </div>

      <footer className="mt-0.5 flex items-center gap-0.5 px-1 py-0.2 rounded-full bg-zinc-900/70 border border-zinc-800/80 text-[clamp(7px,0.55vw,9px)] text-zinc-400 font-medium leading-none">
        <WifiOff className="w-2 h-2 text-amber-400 shrink-0" />
        <span>Usa tus datos</span>
      </footer>
    </div>
  );
};
