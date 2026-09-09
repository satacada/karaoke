import type { FC } from 'react';
import { Search, Clock, ListMusic, UserCheck } from 'lucide-react';

interface GuestHeaderProps {
  roomCode: string;
  guestName: string;
  activeTab: 'search' | 'my-turn' | 'party-queue';
  onSelectTab: (tab: 'search' | 'my-turn' | 'party-queue') => void;
  mySongsCount: number;
  isSingingNow: boolean;
  isWithinGracePeriod: boolean;
  remainingGraceMinutes: number;
}

export const GuestHeader: FC<GuestHeaderProps> = ({
  roomCode,
  guestName,
  activeTab,
  onSelectTab,
  mySongsCount,
  isSingingNow,
  isWithinGracePeriod,
  remainingGraceMinutes,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 pt-3 pb-2 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
            {guestName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white leading-tight">{guestName}</span>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 font-mono px-1.5 py-0.5 rounded">
                {roomCode}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400">
              <UserCheck className="w-3 h-3" />
              <span>
                {isWithinGracePeriod
                  ? `En el local (${remainingGraceMinutes}m gracia)`
                  : 'Presencia por GPS activa'}
              </span>
            </div>
          </div>
        </div>

        {isSingingNow && (
          <span className="animate-pulse bg-pink-500 text-zinc-950 text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-pink-500/30">
            ¡TU TURNO! 🎶
          </span>
        )}
      </div>

      <nav className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
        <button
          type="button"
          onClick={() => onSelectTab('search')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'search'
              ? 'bg-emerald-500 text-zinc-950 shadow font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Buscar</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('my-turn')}
          className={`relative flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'my-turn'
              ? 'bg-emerald-500 text-zinc-950 shadow font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Mi Turno</span>
          {mySongsCount > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'my-turn' ? 'bg-zinc-950 text-emerald-400' : 'bg-emerald-500 text-zinc-950'
            }`}>
              {mySongsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('party-queue')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'party-queue'
              ? 'bg-emerald-500 text-zinc-950 shadow font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <ListMusic className="w-3.5 h-3.5" />
          <span>Cola Rockola</span>
        </button>
      </nav>
    </header>
  );
};
