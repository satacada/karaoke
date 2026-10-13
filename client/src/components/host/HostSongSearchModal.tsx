import { useState, useCallback, type FC } from 'react';
import { Search, Music, Play, Zap, X, Loader2 } from 'lucide-react';
import { searchVideos } from '../../services/karaokeApi';
import type { SearchResultItem } from '../../types';

interface HostSongSearchModalProps {
  isOpen: boolean; onClose: () => void;
  onPlayNow: (song: SearchResultItem) => Promise<void>;
  onAddToQueueNext: (song: SearchResultItem) => Promise<void>;
}

export const HostSongSearchModal: FC<HostSongSearchModalProps> = ({
  isOpen, onClose, onPlayNow, onAddToQueueNext,
}) => {
  const [query, setQuery] = useState(''), [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false), [busyId, setBusyId] = useState<string | null>(null);

  const handleSearch = useCallback(async (text?: string) => {
    const q = (text ?? query).trim(); if (!q) return;
    setIsSearching(true);
    try { const res = await searchVideos(q, 'all'); setResults(res); }
    finally { setIsSearching(false); }
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-2xl flex flex-col max-h-[88vh]">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-pink-600/20 text-pink-400 flex items-center justify-center"><Search className="w-4 h-4" /></div>
            <h3 className="text-sm font-bold text-white">Buscador DJ para la TV</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2 mb-3">
          <input type="text" value={query} autoFocus onChange={(e) => setQuery(e.target.value)} placeholder="Buscar tema o artista en YouTube..." className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500" />
          <button type="submit" disabled={isSearching || !query.trim()} className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1 shadow-md">
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Buscar</span>
          </button>
        </form>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
          {results.length === 0 && !isSearching && (
            <div className="text-center py-8 text-zinc-500 text-xs flex flex-col items-center gap-1.5"><Music className="w-6 h-6 text-zinc-700" /><span>Escribe cualquier canción y decídela para la TV</span></div>
          )}
          {results.map((song) => {
            const isBusy = busyId === song.videoId;
            return (
              <div key={song.videoId} className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate leading-tight">{song.title}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{song.author} • {song.durationText}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" disabled={Boolean(busyId)} onClick={async () => { setBusyId(song.videoId); await onPlayNow(song); setBusyId(null); onClose(); }} className="px-2 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-md active:scale-95" title="Reproducir ahora en la TV">
                    {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-white" />}
                    <span>Sonar YA</span>
                  </button>
                  <button type="button" disabled={Boolean(busyId)} onClick={async () => { setBusyId(song.videoId); await onAddToQueueNext(song); setBusyId(null); onClose(); }} className="px-2 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-md active:scale-95" title="Poner como siguiente tema">
                    <Zap className="w-3 h-3 fill-white" />
                    <span>Siguiente</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
