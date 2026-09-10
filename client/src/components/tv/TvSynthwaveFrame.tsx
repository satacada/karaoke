import type { FC, ReactNode } from 'react';
import { Gamepad2, Radio } from 'lucide-react';

interface TvSynthwaveFrameProps {
  children: ReactNode;
}

export const TvSynthwaveFrame: FC<TvSynthwaveFrameProps> = ({ children }) => {
  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-neutral-950 p-2 sm:p-4 flex flex-col justify-between overflow-hidden select-none">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-28 bg-orange-500/15 blur-3xl pointer-events-none" />

      <header className="relative z-20 flex items-center justify-between px-5 py-1.5 bg-zinc-950/80 border-2 border-orange-500/60 rounded-t-2xl shadow-[0_0_20px_rgba(249,115,22,0.35)]">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-orange-400 animate-pulse" />
          <span className="font-mono text-xs tracking-widest uppercase text-orange-300 font-black">SYNTHWAVE 80S ARCADE</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-400/40 text-[10px] font-mono font-bold text-orange-200">
          <Radio className="w-3 h-3 text-pink-400" />
          <span>OUTRUN FM</span>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex items-stretch gap-2 my-1 min-h-0">
        <div className="w-2.5 sm:w-3.5 rounded-full bg-gradient-to-b from-orange-500 via-pink-500 to-purple-600 shadow-[0_0_20px_rgba(249,115,22,0.8)] animate-pulse shrink-0 border border-orange-300/40" />
        <main className="relative flex-1 rounded-xl border-2 border-orange-500/40 shadow-[inset_0_0_25px_rgba(0,0,0,0.9)] overflow-hidden bg-black flex items-center justify-center">
          {children}
        </main>
        <div className="w-2.5 sm:w-3.5 rounded-full bg-gradient-to-b from-purple-600 via-pink-500 to-orange-500 shadow-[0_0_20px_rgba(236,72,153,0.8)] animate-pulse shrink-0 border border-pink-300/40" />
      </div>

      <footer className="relative z-20 h-4 bg-zinc-950/80 border-2 border-pink-500/50 rounded-b-2xl shadow-inner flex items-center justify-center px-4">
        <div className="w-3/4 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent rounded-full shadow-[0_0_8px_#f97316]" />
      </footer>
    </div>
  );
};
