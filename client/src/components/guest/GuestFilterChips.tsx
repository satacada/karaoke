import type { FC } from 'react';
import type { SearchFilterType } from '../../types';

interface GuestFilterChipsProps {
  selectedFilter: SearchFilterType;
  onSelectFilter: (filter: SearchFilterType) => void;
}

const FILTERS: { id: SearchFilterType; label: string; icon: string }[] = [
  { id: 'all', label: 'Todo (Rockola)', icon: '🎵' },
  { id: 'karaoke', label: 'Solo Karaoke', icon: '🎤' },
  { id: 'official', label: 'Video Oficial', icon: '🎬' },
  { id: 'live', label: 'En Vivo', icon: '🎸' },
];

export const GuestFilterChips: FC<GuestFilterChipsProps> = ({
  selectedFilter,
  onSelectFilter,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      {FILTERS.map((f) => {
        const isSelected = selectedFilter === f.id;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelectFilter(f.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
              isSelected
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-bold'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        );
      })}
    </div>
  );
};
