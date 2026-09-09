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
  const thumbUrl = item.thumbnailUrl || (item as unknown as { thumbnail?: string }).thumbnail || '';

  return (
    <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-2.5 flex gap-2.5 items-center hover:border-zinc-700 transition-colors w-full min-w-0">
      <div className="relative w-20 h-14 shrink-0 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/50">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-xs text-zinc-600 font-mono">
            ♪
          </div>
        )}
        <span className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs text-[10px] font-mono font-bold text-zinc-200 px-1 py-0.2 rounded">
          {item.durationText}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${badge.color}`}>
            {badge.label}
          </span>
          <p className="text-xs text-zinc-400 truncate">{item.author}</p>
        </div>
        <h4 className="text-xs sm:text-sm font-semibold text-white truncate leading-snug" title={item.title}>
          {item.title}
        </h4>
      </div>

      <button
        type="button"
        disabled={isAdding}
        onClick={() => onSelectSong(item)}
        className="shrink-0 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 px-2.5 py-2 rounded-xl font-black text-xs flex items-center gap-1 transition-transform active:scale-95 shadow-md shadow-emerald-500/20"
        aria-label={`Pedir canción ${item.title}`}
      >
        {isAdding ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Pedir</span>
          </>
        )}
      </button>
    </div>
  );
};
