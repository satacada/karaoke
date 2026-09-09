import type { FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Mic, Sparkles, Smartphone, Signal } from 'lucide-react';

interface TvIdleScreenProps {
  roomCode: string;
  joinUrl: string;
  roomName?: string;
}

export const TvIdleScreen: FC<TvIdleScreenProps> = ({
  roomCode,
  joinUrl,
  roomName = 'Fiesta Karaoke',
}) => {
  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-zinc-950 via-purple-950/40 to-zinc-950 flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

      <main className="relative z-10 flex flex-col items-center max-w-4xl text-center">
        {/* Animated Icon & Headline */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-bounce">
            <Mic className="w-12 h-12 text-white" />
          </div>
          <Sparkles className="w-8 h-8 text-amber-300 absolute -top-2 -right-2 animate-spin" />
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 tracking-tight mb-3">
          {roomName}
        </h1>
        <p className="text-xl md:text-2xl text-zinc-300 font-medium max-w-xl mb-8">
          Escanea el código con tu celular para elegir canciones y cantar
        </p>

        {/* Central Card with QR & Instructions */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-zinc-900/80 backdrop-blur-xl border border-purple-500/30 p-8 rounded-3xl shadow-2xl shadow-purple-950/60">
          <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-purple-500/20">
            <QRCodeSVG
              value={joinUrl}
              size={220}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-purple-400 font-bold block mb-1">
                Código de Sala
              </span>
              <span className="text-5xl font-mono font-black text-white tracking-widest bg-zinc-800/80 px-6 py-2 rounded-2xl border border-zinc-700 inline-block shadow-inner">
                {roomCode}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 text-left text-sm text-zinc-300">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-pink-400 shrink-0" />
                <span>1. Abre la cámara de tu celular</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Signal className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>2. Usa tus datos móviles (no necesitas Wi-Fi)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mic className="w-4 h-4 text-purple-400 shrink-0" />
                <span>3. Busca tu canción favorita y pide turno</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
