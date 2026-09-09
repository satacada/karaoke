import type { FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { WifiOff, Radio } from 'lucide-react';

interface TvFloatingQrProps {
  roomCode: string;
  joinUrl: string;
}

export const TvFloatingQr: FC<TvFloatingQrProps> = ({ roomCode, joinUrl }) => {
  return (
    <aside
      aria-label="Código QR para pedir canciones en la Rockola"
      className="absolute top-6 right-6 z-40 flex flex-col items-center bg-zinc-950/85 backdrop-blur-md border border-purple-500/40 shadow-2xl shadow-purple-950/50 rounded-2xl p-4 transition-all duration-300"
    >
      <header className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 uppercase tracking-widest mb-2">
        <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
        <span>Pide tu tema en la Rockola</span>
      </header>

      <div className="bg-white p-2.5 rounded-xl shadow-inner border-2 border-purple-400/30">
        <QRCodeSVG
          value={joinUrl}
          size={140}
          level="H"
          includeMargin={false}
        />
      </div>

      <div className="mt-3 text-center">
        <span className="text-[11px] font-medium text-zinc-400 block">Código de sala:</span>
        <strong className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 font-mono">
          {roomCode}
        </strong>
      </div>

      <footer className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-400 font-medium">
        <WifiOff className="w-3 h-3 text-amber-400 shrink-0" />
        <span>Usa tus datos 4G/5G</span>
      </footer>
    </aside>
  );
};
