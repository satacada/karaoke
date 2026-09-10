import type { FC, ReactNode } from 'react';
import { Zap } from 'lucide-react';

interface TvNeonClubFrameProps {
  children: ReactNode;
}

export const TvNeonClubFrame: FC<TvNeonClubFrameProps> = ({ children }) => {
  return (
    <div className="relative w-full h-screen bg-neutral-950 p-2 sm:p-4 flex flex-col justify-between overflow-hidden select-none">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-28 bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-28 bg-fuchsia-500/10 blur-3xl pointer-events-none" />

      <header className="relative z-20 flex items-center justify-between px-5 py-1.5 bg-black/70 backdrop-blur-md border-2 border-cyan-400/60 rounded-t-2xl shadow-[0_0_25px_rgba(6,182,212,0.35)]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-mono text-xs tracking-widest uppercase text-cyan-300 font-black">CYBER CLUB NEON</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-end gap-0.5 h-3.5 px-2">
            <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-full" style={{ animationDuration: '0.6s' }} />
            <span className="w-1 bg-fuchsia-500 rounded-full animate-bounce h-2/3" style={{ animationDuration: '0.8s' }} />
            <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-4/5" style={{ animationDuration: '0.5s' }} />
            <span className="w-1 bg-fuchsia-400 rounded-full animate-bounce h-1/2" style={{ animationDuration: '0.7s' }} />
          </div>
          <span className="text-[10px] font-mono font-bold text-fuchsia-300 tracking-wider">LIVE BEATS</span>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex items-stretch gap-2 my-1 min-h-0">
        <div className="w-2.5 sm:w-3.5 rounded-full bg-gradient-to-b from-cyan-400 via-fuchsia-500 to-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-pulse shrink-0 border border-cyan-300/40" />
        <main className="relative flex-1 rounded-xl border-2 border-cyan-500/40 shadow-[inset_0_0_25px_rgba(0,0,0,0.9)] overflow-hidden bg-black flex items-center justify-center">
          {children}
        </main>
        <div className="w-2.5 sm:w-3.5 rounded-full bg-gradient-to-b from-fuchsia-500 via-cyan-400 to-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.8)] animate-pulse shrink-0 border border-fuchsia-300/40" />
      </div>

      <footer className="relative z-20 h-4 bg-black/70 border-2 border-fuchsia-500/50 rounded-b-2xl shadow-[0_0_20px_rgba(217,70,239,0.3)] flex items-center justify-center px-4">
        <div className="w-3/4 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-[0_0_8px_#22d3ee]" />
      </footer>
    </div>
  );
};
