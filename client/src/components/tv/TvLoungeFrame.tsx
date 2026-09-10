import type { FC, ReactNode } from 'react';
import { Wine, Crown } from 'lucide-react';

interface TvLoungeFrameProps {
  children: ReactNode;
}

export const TvLoungeFrame: FC<TvLoungeFrameProps> = ({ children }) => {
  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-amber-950/70 via-stone-950 to-black p-2 sm:p-4 flex flex-col justify-between overflow-hidden select-none">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-24 bg-amber-500/10 blur-3xl pointer-events-none" />

      <header className="relative z-20 flex items-center justify-between px-5 py-1.5 bg-gradient-to-r from-zinc-950 via-amber-950/60 to-zinc-950 border-2 border-amber-500/60 rounded-t-2xl shadow-[0_0_20px_rgba(245,158,11,0.25)]">
        <div className="flex items-center gap-2">
          <Wine className="w-4 h-4 text-amber-400" />
          <span className="font-serif text-xs tracking-widest uppercase text-amber-200 font-bold">VELVET GOLD LOUNGE</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-[10px] font-medium text-amber-300">
          <Crown className="w-3 h-3 text-amber-400" />
          <span>BAR & ACOUSTIC CLUB</span>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex items-stretch gap-2 my-1 min-h-0">
        <div className="w-2.5 sm:w-3.5 rounded-full bg-gradient-to-b from-amber-600 via-yellow-400 to-amber-700 shadow-[0_0_15px_rgba(245,158,11,0.6)] shrink-0 border border-amber-300/50" />
        <main className="relative flex-1 rounded-xl border-2 border-amber-500/30 shadow-[inset_0_0_30px_rgba(0,0,0,0.95)] overflow-hidden bg-black flex items-center justify-center">
          {children}
        </main>
        <div className="w-2.5 sm:w-3.5 rounded-full bg-gradient-to-b from-amber-700 via-yellow-400 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.6)] shrink-0 border border-amber-300/50" />
      </div>

      <footer className="relative z-20 h-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-amber-600/40 rounded-b-2xl shadow-inner flex items-center justify-center px-4">
        <div className="w-3/4 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full shadow-[0_0_6px_#f59e0b]" />
      </footer>
    </div>
  );
};
