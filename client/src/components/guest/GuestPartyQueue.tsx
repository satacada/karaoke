import type { FC } from 'react';
import { Tv, Disc3, ListOrdered } from 'lucide-react';
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

  return (
    <div className="space-y-4">
      {/* Canción en reproducción */}
      {currentSong ? (
        <div className="bg-zinc-900 border border-purple-500/30 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center gap-2 text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">
            <Tv className="w-3.5 h-3.5" />
            <span>Sonando en la Pantalla TV</span>
          </div>
          <div className="flex items-center gap-3">
            <Disc3 className="w-10 h-10 text-purple-400 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate">{currentSong.title}</h4>
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
                  {song.thumbnail_url && (
                    <img
                      src={song.thumbnail_url}
                      alt={song.title}
                      className="w-12 h-9 object-cover rounded-lg shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-semibold text-white truncate">{song.title}</h5>
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
