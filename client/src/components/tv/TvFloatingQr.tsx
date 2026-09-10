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
      className="flex flex-col items-center bg-black/40 backdrop-blur-md border border-purple-500/30 shadow-xl shadow-purple-950/30 rounded-2xl p-2.5 transition-all duration-300 hover:bg-black/60"
    >
      <header className="flex items-center gap-1 text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1.5">
        <Radio className="w-3 h-3 text-pink-400 animate-pulse" />
        <span>Pide tu tema</span>
      </header>

      <div className="bg-white p-1.5 rounded-xl shadow-md">
        <QRCodeSVG value={joinUrl} size={96} level="M" includeMargin={false} />
      </div>

      <div className="mt-1.5 text-center">
        <span className="text-[10px] text-zinc-300 font-mono block">
          Sala: <b className="text-white font-black tracking-wider text-xs">{roomCode}</b>
        </span>
      </div>

      <footer className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900/60 border border-zinc-800/80 text-[9px] text-zinc-400 font-medium">
        <WifiOff className="w-2.5 h-2.5 text-amber-400 shrink-0" />
        <span>Usa tus datos</span>
      </footer>
    </div>
  );
};
