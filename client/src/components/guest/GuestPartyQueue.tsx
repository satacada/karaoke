import type { FC } from 'react';
import { Tv, Disc3, ListOrdered } from 'lucide-react';
import { parseSongMeta } from '../../utils/songMeta';
import type { QueueItem } from '../../types';

interface GuestPartyQueueProps {
  currentSong: QueueItem | null;
  queuedSongs: QueueItem[];
  currentGuestName: string;
}

export const GuestPartyQueue: FC<GuestPartyQueueProps> = ({
  currentSong,
  queuedSongs,
  currentGuestName,
}) => {
  const normName = currentGuestName.trim().toLowerCase();
  const currentMeta = currentSong ? parseSongMeta(currentSong) : null;

  return (
    <div className="space-y-4">
      {/* Canción en reproducción */}
      {currentSong && currentMeta ? (
        <div className="bg-zinc-900 border border-purple-500/30 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center gap-2 text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">
            <Tv className="w-3.5 h-3.5" />
            <span>Sonando en la Pantalla TV</span>
            {currentMeta.isVip && <span className="ml-auto px-1.5 py-0.2 text-[9px] font-black bg-amber-400 text-zinc-950 rounded">VIP ⚡</span>}
          </div>
          <div className="flex items-center gap-3">
            <Disc3 className="w-10 h-10 text-purple-400 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate">{currentSong.title}</h4>
              {currentMeta.dedication && <p className="text-xs text-pink-300 italic truncate">💌 &quot;{currentMeta.dedication}&quot;</p>}
              <p className="text-xs text-zinc-400">
                Pide: <span className="text-purple-300 font-semibold">{currentSong.requested_by}</span>
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Lista a continuación */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            A continuación ({queuedSongs.length})
          </h4>
        </div>

        {queuedSongs.length > 0 ? (
          <div className="space-y-2">
            {queuedSongs.map((song, idx) => {
              const isMine = (song.requested_by || '').trim().toLowerCase() === normName;
              const { dedication, isVip, cleanThumbnail } = parseSongMeta(song);
              return (
                <div
                  key={song.id}
                  className={`border rounded-2xl p-3 flex items-center gap-3 transition-colors ${
                    isMine
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-zinc-900/60 border-zinc-800/80'
                  }`}
                >
                  <div className="w-6 text-center font-bold text-xs text-zinc-500">
                    #{idx + 1}
                  </div>
                  {(cleanThumbnail || song.thumbnail_url) && (
                    <img
                      src={(cleanThumbnail || song.thumbnail_url) || undefined}
                      alt={song.title}
                      className="w-12 h-9 object-cover rounded-lg shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs font-semibold text-white truncate">{song.title}</h5>
                      {isVip && <span className="shrink-0 px-1 py-0.2 text-[9px] font-black bg-amber-400 text-zinc-950 rounded">VIP ⚡</span>}
                    </div>
                    {dedication && <p className="text-[10px] text-pink-300/90 italic truncate">💌 &quot;{dedication}&quot;</p>}
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <span>{song.duration_text}</span>
                      <span>•</span>
                      <span className={isMine ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>
                        {isMine ? 'Tú' : song.requested_by}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-6 text-center space-y-2">
            <ListOrdered className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400">La cola está vacía. ¡Sé el primero en pedir música!</p>
          </div>
        )}
      </div>
    </div>
  );
};
