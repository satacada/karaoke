import type { FC, ReactNode } from 'react';
import { Sparkles, Disc3 } from 'lucide-react';

interface TvVintageFrameProps {
  active: boolean;
  children: ReactNode;
}

export const TvVintageFrame: FC<TvVintageFrameProps> = ({ active, children }) => {
  if (!active) {
    return <div className="relative w-full h-full">{children}</div>;
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-amber-950/90 via-zinc-950 to-neutral-950 p-3 sm:p-5 flex flex-col justify-between overflow-hidden select-none">
      {/* Luz ambiental de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Corona Superior Arqueada Wurlitzer */}
      <header className="relative z-20 flex items-center justify-between px-6 py-2 bg-gradient-to-r from-amber-900/60 via-yellow-700/40 to-amber-900/60 border-2 border-amber-500/50 rounded-t-3xl shadow-[0_0_30px_rgba(245,158,11,0.3)]">
        <div className="flex items-center gap-2">
          <Disc3 className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '5s' }} />
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-amber-300 font-bold">Rockola Clásica Hi-Fi</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] font-black tracking-widest text-amber-200">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>WURLITZER RETRO</span>
        </div>
      </header>

      {/* Cuerpo Central: Tubo Neón Izq + Pantalla de Video + Tubo Neón Der */}
      <div className="relative z-10 flex-1 flex items-stretch gap-2.5 my-1.5 min-h-0">
        {/* Tubo de Burbujas Neón Izquierdo */}
        <div className="w-3.5 sm:w-5 rounded-full bg-gradient-to-b from-rose-500 via-amber-400 to-purple-600 shadow-[0_0_20px_rgba(236,72,153,0.7)] animate-pulse shrink-0 border border-white/20" />

        {/* Marco de Cromo y Contenedor del Video */}
        <main className="relative flex-1 rounded-2xl border-4 border-zinc-500/80 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] overflow-hidden bg-black flex items-center justify-center">
          {children}
        </main>

        {/* Tubo de Burbujas Neón Derecho */}
        <div className="w-3.5 sm:w-5 rounded-full bg-gradient-to-b from-purple-600 via-amber-400 to-rose-500 shadow-[0_0_20px_rgba(168,85,247,0.7)] animate-pulse shrink-0 border border-white/20" />
      </div>

      {/* Parrilla Inferior Cromada */}
      <footer className="relative z-20 h-6 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-2 border-zinc-700 rounded-b-3xl shadow-inner flex items-center justify-center px-4">
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent rounded-full" />
      </footer>
    </div>
  );
};
