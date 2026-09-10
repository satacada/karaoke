import type { FC } from 'react';
import { Pause } from 'lucide-react';

export const TvPauseOverlay: FC<{ isPaused: boolean }> = ({ isPaused }) => {
  if (!isPaused) return null;
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs pointer-events-none animate-in fade-in duration-200">
      <div className="px-6 py-4 rounded-3xl bg-zinc-900/90 border border-purple-500/40 shadow-2xl flex items-center gap-3 text-white">
        <Pause className="w-8 h-8 text-pink-400 fill-pink-400 animate-pulse" />
        <div className="text-left">
          <p className="text-lg font-black tracking-wide uppercase text-white">Música en Pausa</p>
          <p className="text-xs text-zinc-300">Toca la pantalla o presiona OK en el control remoto para continuar</p>
        </div>
      </div>
    </div>
  );
};
