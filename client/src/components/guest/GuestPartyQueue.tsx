import { useState, useMemo, type FC } from 'react';
import { Tv, Disc3, ListOrdered, Heart } from 'lucide-react';
import { parseSongMeta } from '../../utils/songMeta';
import { toggleSongLike } from '../../services/karaokeApi';
import type { QueueItem } from '../../types';

interface GuestPartyQueueProps {
  currentSong: QueueItem | null;
  queuedSongs: QueueItem[];
  currentGuestName: string;
}

export const GuestPartyQueue: FC<GuestPartyQueueProps> = ({ currentSong, queuedSongs, currentGuestName }) => {
  const normName = currentGuestName.trim().toLowerCase();
  const currentMeta = currentSong ? parseSongMeta(currentSong) : null;
  const [localLikes, setLocalLikes] = useState<Record<string, { count: number; liked: boolean }>>({});

  const maxLikes = useMemo(
    () => Math.max(0, ...queuedSongs.map((s) => localLikes[s.id]?.count ?? (s.likes_count || 0))),
    [queuedSongs, localLikes]
  );

  const handleLike = async (song: QueueItem) => {
    const isCurrentlyLiked = localLikes[song.id]?.liked ?? (song.liked_by?.includes(currentGuestName) || false);
    const currentCount = localLikes[song.id]?.count ?? (song.likes_count || 0);
    const newLiked = !isCurrentlyLiked;
    const newCount = newLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
    setLocalLikes((prev) => ({ ...prev, [song.id]: { count: newCount, liked: newLiked } }));
    await toggleSongLike(song.id, currentGuestName);
  };

  return (
    <div className="space-y-4">
      {currentSong && currentMeta && (
        <div className="bg-zinc-900 border border-purple-500/30 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center gap-2 text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">
            <Tv className="w-3.5 h-3.5" /><span>Sonando en la Pantalla TV</span>
            {currentMeta.isVip && <span className="ml-auto px-1.5 py-0.2 text-[9px] font-black bg-amber-400 text-zinc-950 rounded">VIP ⚡</span>}
          </div>
          <div className="flex items-center gap-3">
            <Disc3 className="w-10 h-10 text-purple-400 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate">{currentSong.title}</h4>
              {currentMeta.dedication && <p className="text-xs text-pink-300 italic truncate">💌 &quot;{currentMeta.dedication}&quot;</p>}
              <p className="text-xs text-zinc-400">Pide: <span className="text-purple-300 font-semibold">{currentSong.requested_by}</span></p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">A continuación ({queuedSongs.length})</h4>
        {queuedSongs.length > 0 ? (
          <div className="space-y-2">
            {queuedSongs.map((song, idx) => {
              const isMine = (song.requested_by || '').trim().toLowerCase() === normName;
              const { dedication, isVip, cleanThumbnail } = parseSongMeta(song);
              const isLiked = localLikes[song.id]?.liked ?? (song.liked_by?.includes(currentGuestName) || false);
              const count = localLikes[song.id]?.count ?? (song.likes_count || 0);
              const isTopVoted = maxLikes > 0 && count === maxLikes;

              return (
                <div key={song.id} className={`border rounded-2xl p-3 flex items-center gap-2.5 transition-colors ${isMine ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-zinc-900/60 border-zinc-800/80'}`}>
                  <div className="w-5 text-center font-bold text-xs text-zinc-500">#{idx + 1}</div>
                  {(cleanThumbnail || song.thumbnail_url) && (
                    <img src={(cleanThumbnail || song.thumbnail_url) || undefined} alt={song.title} className="w-12 h-9 object-cover rounded-lg shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs font-semibold text-white truncate">{song.title}</h5>
                      {isVip && <span className="shrink-0 px-1 py-0.2 text-[9px] font-black bg-amber-400 text-zinc-950 rounded">VIP ⚡</span>}
                      {isTopVoted && <span className="shrink-0 px-1.5 py-0.2 text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">🔥 Más Esperado</span>}
                    </div>
                    {dedication && <p className="text-[10px] text-pink-300/90 italic truncate">💌 &quot;{dedication}&quot;</p>}
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <span>{song.duration_text}</span><span>•</span>
                      <span className={isMine ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>{isMine ? 'Tú' : song.requested_by}</span>
                    </div>
                  </div>
                  <button onClick={() => handleLike(song)} className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl border transition-all active:scale-90 ${isLiked ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:text-rose-300'}`}>
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                    <span className="text-[10px] font-bold">{count}</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-6 text-center space-y-2">
            <ListOrdered className="w-8 h-8 text-zinc-600 mx-auto" /><p className="text-xs text-zinc-400">La cola está vacía. ¡Sé el primero en pedir música!</p>
          </div>
        )}
      </div>
    </div>
  );
};
