import type { FC } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { GuestFilterChips } from './GuestFilterChips';
import type { SearchFilterType } from '../../types';

interface GuestSearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  selectedFilter: SearchFilterType;
  onFilterChange: (f: SearchFilterType) => void;
  isLoading?: boolean;
}

export const GuestSearchBar: FC<GuestSearchBarProps> = ({
  query,
  onQueryChange,
  selectedFilter,
  onFilterChange,
  isLoading = false,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar artista, tema, video o karaoke..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
        />
        <div className="absolute right-3 flex items-center">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              className="p-1 text-zinc-400 hover:text-white transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      <GuestFilterChips
        selectedFilter={selectedFilter}
        onSelectFilter={onFilterChange}
      />
    </div>
  );
};
