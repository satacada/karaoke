import type { FC } from 'react';
import { Search, X, Loader2, Mic, MicOff } from 'lucide-react';
import { GuestFilterChips } from './GuestFilterChips';
import { useSpeechToText } from '../../hooks/useSpeechToText';
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
  const { isListening, speechError, toggleListening } = useSpeechToText(onQueryChange);

  return (
    <div className="space-y-2">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={isListening ? '🎤 Escuchando... Di el tema' : 'Buscar artista, tema, video o karaoke...'}
          className={`w-full bg-zinc-900 border rounded-2xl pl-10 pr-20 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors ${
            isListening
              ? 'border-rose-500 ring-2 ring-rose-500/30'
              : 'border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
          }`}
        />
        <div className="absolute right-2.5 flex items-center gap-1">
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
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40 ring-2 ring-rose-400'
                : 'bg-zinc-800/80 text-emerald-400 hover:bg-zinc-700 hover:text-white'
            }`}
            title={isListening ? 'Detener micrófono' : 'Buscar con la voz (Micrófono)'}
            aria-label="Buscar con voz"
          >
            {isListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isListening && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
          <span>Escuchando... Di el nombre del artista o tema</span>
        </div>
      )}

      {speechError && (
        <div className="text-[11px] text-amber-400 font-medium px-2">
          ⚠️ {speechError}
        </div>
      )}

      <GuestFilterChips
        selectedFilter={selectedFilter}
        onSelectFilter={onFilterChange}
      />
    </div>
  );
};
