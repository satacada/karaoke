import type { FC } from 'react';
import { Plus, SlidersHorizontal, Store } from 'lucide-react';
import type { KaraokeRoom } from '../../../types';

interface HostMultiRoomBarProps {
  rooms: KaraokeRoom[];
  currentRoomId: string;
  onSelectRoom: (room: KaraokeRoom) => void;
  onOpenMasterHub: () => void;
  onOpenCreateRoom: () => void;
}

export const HostMultiRoomBar: FC<HostMultiRoomBarProps> = ({
  rooms, currentRoomId, onSelectRoom, onOpenMasterHub, onOpenCreateRoom,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-none">
      <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-xl bg-purple-950/60 border border-purple-800/60 text-purple-300 text-[10px] font-black uppercase tracking-wider">
        <Store className="w-3 h-3" />
        <span>Ambientes</span>
      </div>

      {rooms.map((r) => {
        const isSelected = r.id === currentRoomId;
        const statusDot = r.status === 'active' ? 'bg-emerald-400' : r.status === 'paused' ? 'bg-amber-400' : 'bg-zinc-500';
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelectRoom(r)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all border ${
              isSelected
                ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot}`} />
            <span className="truncate max-w-[110px]">{r.zone_name || r.name}</span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={onOpenCreateRoom}
        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold shrink-0 active:scale-95"
        title="Crear nuevo sector"
      >
        <Plus className="w-3.5 h-3.5 text-purple-400" />
        <span>Nuevo</span>
      </button>

      <button
        type="button"
        onClick={onOpenMasterHub}
        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black shrink-0 shadow-md shadow-pink-500/20 active:scale-95 ml-auto"
      >
        <SlidersHorizontal className="w-3 h-3" />
        <span>Master Hub</span>
      </button>
    </div>
  );
};
