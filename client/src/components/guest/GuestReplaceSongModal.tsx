import { useState, useEffect, type FC } from 'react';
import { X, Search, RefreshCw, Music2 } from 'lucide-react';
import { searchVideos } from '../../services/karaokeApi';
import type { QueueItem, SearchResultItem, SearchFilterType } from '../../types';

interface GuestReplaceSongModalProps {
  isOpen: boolean;
  targetSong: QueueItem | null;
  onClose: () => void;
  onReplace: (targetSongId: string, item: SearchResultItem) => Promise<void>;
}

export const GuestReplaceSongModal: FC<GuestReplaceSongModalProps> = ({
  isOpen,
  targetSong,
  onClose,
  onReplace,
}) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SearchFilterType>('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setReplacingId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(() => {
      searchVideos(query, filter).then((res) => {
        setResults(res);
        setLoading(false);
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [query, filter]);

  if (!isOpen || !targetSong) return null;

  const handleSelect = async (item: SearchResultItem) => {
    setReplacingId(item.videoId);
    await onReplace(targetSong.id, item);
    setReplacingId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950/95 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            Cambiar Canción (Conserva tu turno)
          </h3>
          <p className="text-[11px] text-zinc-400 truncate max-w-xs">
            Actual: <span className="text-zinc-200 font-semibold">{targetSong.title}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-2">
        <Search className="w-4 h-4 text-zinc-500 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar nuevo tema o karaoke en YouTube..."
          className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none w-full"
          autoFocus
        />
      </div>

      <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
        {(['all', 'karaoke', 'official', 'live'] as SearchFilterType[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shrink-0 transition-colors ${
              filter === f ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'karaoke' ? '🎤 Karaoke' : f === 'official' ? '🎬 Oficial' : '🎸 En Vivo'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
        {loading ? (
          <div className="text-center py-10 text-xs text-zinc-500">Buscando opciones...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-10 text-xs text-zinc-600">
            {query.trim() ? 'No se encontraron resultados' : 'Escribe el nombre de la canción que quieres poner en tu turno'}
          </div>
        ) : (
          results.map((item) => (
            <div
              key={item.videoId}
              onClick={() => handleSelect(item)}
              className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-2.5 flex items-center gap-3 active:scale-[0.98] cursor-pointer hover:border-emerald-500/50 transition-all"
            >
              {item.thumbnailUrl ? (
                <img src={item.thumbnailUrl} alt={item.title} className="w-14 h-10 object-cover rounded-lg shrink-0" />
              ) : (
                <div className="w-14 h-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                  <Music2 className="w-4 h-4 text-zinc-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-semibold text-white truncate">{item.title}</h5>
                <p className="text-[10px] text-zinc-400 truncate">{item.author} • {item.durationText}</p>
              </div>
              <button
                type="button"
                disabled={replacingId === item.videoId}
                className="px-3 py-1.5 bg-emerald-500 text-zinc-950 rounded-xl text-[11px] font-black shrink-0 shadow"
              >
                {replacingId === item.videoId ? '...' : 'Elegir'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
