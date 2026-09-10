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
      className="w-full flex flex-col items-center bg-black/40 backdrop-blur-md border border-purple-500/30 shadow-xl shadow-purple-950/30 rounded-2xl p-[clamp(0.35rem,0.7vw,0.65rem)] transition-all duration-300 hover:bg-black/60"
    >
      <header className="flex items-center gap-1 text-[clamp(9px,0.75vw,11px)] font-bold text-purple-300 uppercase tracking-wider mb-1">
        <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-pink-400 animate-pulse shrink-0" />
        <span className="truncate">Pide tu tema</span>
      </header>

      <div className="bg-white p-1 rounded-xl shadow-md w-[clamp(76px,7.5vw,115px)] h-[clamp(76px,7.5vw,115px)] flex items-center justify-center shrink-0">
        <QRCodeSVG value={joinUrl} className="w-full h-full" level="M" includeMargin={false} />
      </div>

      <div className="mt-1 text-center">
        <span className="text-[clamp(9px,0.7vw,11px)] text-zinc-300 font-mono block leading-tight">
          Sala: <b className="text-white font-black tracking-wider text-[clamp(10px,0.85vw,13px)]">{roomCode}</b>
        </span>
      </div>

      <footer className="mt-1 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-900/60 border border-zinc-800/80 text-[clamp(8px,0.6vw,10px)] text-zinc-400 font-medium leading-none">
        <WifiOff className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-400 shrink-0" />
        <span>Usa tus datos</span>
      </footer>
    </div>
  );
};
