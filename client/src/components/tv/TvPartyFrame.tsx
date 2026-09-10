import type { FC, ReactNode } from 'react';
import { Mic2, Sparkles } from 'lucide-react';

interface TvPartyFrameProps {
  children: ReactNode;
}

export const TvPartyFrame: FC<TvPartyFrameProps> = ({ children }) => {
  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-purple-950 via-zinc-950 to-pink-950 p-2 sm:p-4 flex flex-col justify-between overflow-hidden select-none">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-28 bg-pink-500/15 blur-3xl pointer-events-none" />

      <header className="relative z-20 flex items-center justify-between px-5 py-1.5 bg-gradient-to-r from-purple-900/80 via-pink-900/70 to-purple-900/80 border-2 border-pink-500/60 rounded-t-2xl shadow-[0_0_25px_rgba(236,72,153,0.4)]">
        <div className="flex items-center gap-2">
          <Mic2 className="w-4 h-4 text-pink-400 animate-pulse" />
          <span className="font-mono text-xs tracking-widest uppercase text-pink-200 font-black">KARAOKE PARTY LIVE</span>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-500/20 border border-pink-400/40 text-[10px] font-bold text-pink-200">
          <Sparkles className="w-3 h-3 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span>FIESTA GLOW</span>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex items-stretch gap-2 my-1 min-h-0">
        <div className="w-2.5 sm:w-3.5 rounded-full bg-gradient-to-b from-pink-500 via-purple-500 to-amber-400 shadow-[0_0_20px_rgba(236,72,153,0.7)] animate-pulse shrink-0 border border-pink-300/40" />
        <main className="relative flex-1 rounded-xl border-2 border-pink-500/40 shadow-[inset_0_0_25px_rgba(0,0,0,0.9)] overflow-hidden bg-black flex items-center justify-center">
          {children}
        </main>
        <div className="w-2.5 sm:w-3.5 rounded-full bg-gradient-to-b from-amber-400 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.7)] animate-pulse shrink-0 border border-purple-300/40" />
      </div>

      <footer className="relative z-20 h-4 bg-gradient-to-r from-purple-950 via-zinc-900 to-purple-950 border-2 border-purple-600/50 rounded-b-2xl shadow-inner flex items-center justify-center px-4">
        <div className="w-3/4 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-full shadow-[0_0_8px_#ec4899]" />
      </footer>
    </div>
  );
};
