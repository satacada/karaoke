import type { FC } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import type { SearchResultItem, VersionCategory } from '../../types';

interface GuestSearchResultCardProps {
  item: SearchResultItem;
  onSelectSong: (item: SearchResultItem) => void;
  isAdding?: boolean;
}

const BADGE_CONFIG: Record<VersionCategory, { label: string; color: string }> = {
  karaoke: { label: 'Karaoke', color: 'bg-purple-900/60 text-purple-300 border-purple-700/50' },
  official: { label: 'Oficial', color: 'bg-blue-900/60 text-blue-300 border-blue-700/50' },
  live: { label: 'En Vivo', color: 'bg-amber-900/60 text-amber-300 border-amber-700/50' },
  general: { label: 'Música', color: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/50' },
};

export const GuestSearchResultCard: FC<GuestSearchResultCardProps> = ({
  item,
  onSelectSong,
  isAdding = false,
}) => {
  const version = item.versionType || 'general';
  const badge = BADGE_CONFIG[version] || BADGE_CONFIG.general;

  return (
    <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-3 flex gap-3 items-center hover:border-zinc-700 transition-colors">
      <div className="relative w-24 h-16 shrink-0 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/50">
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <span className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs text-[10px] font-mono font-bold text-zinc-200 px-1.5 py-0.5 rounded-md">
          {item.durationText}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${badge.color}`}>
            {badge.label}
          </span>
          <p className="text-xs text-zinc-400 truncate">{item.author}</p>
        </div>
        <h4 className="text-sm font-semibold text-white truncate leading-snug" title={item.title}>
          {item.title}
        </h4>
      </div>

      <button
        type="button"
        disabled={isAdding}
        onClick={() => onSelectSong(item)}
        className="shrink-0 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 p-2.5 rounded-xl font-bold transition-transform active:scale-95 shadow-md shadow-emerald-500/20"
        aria-label={`Pedir canción ${item.title}`}
      >
        {isAdding ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Plus className="w-5 h-5 stroke-[2.5]" />
        )}
      </button>
    </div>
  );
};
