import type { FC } from 'react';
import { Sparkles, Trash2, Clock, Music, RefreshCw } from 'lucide-react';
import type { QueueItem, GuestTurnStatus } from '../../types';

interface GuestMyQueueProps {
  mySongs: QueueItem[];
  currentSong: QueueItem | null;
  guestName: string;
  turnStatus: GuestTurnStatus;
  onCancelSong: (song: QueueItem) => void;
  onReplaceSong: (song: QueueItem) => void;
  onSwapSongs?: (songId1: string, songId2: string) => void;
  onGoToSearch: () => void;
}

export const GuestMyQueue: FC<GuestMyQueueProps> = ({
  mySongs, currentSong, guestName, turnStatus, onCancelSong, onReplaceSong, onSwapSongs, onGoToSearch,
}) => {
  const isSinging = turnStatus.isSingingNow;

  return (
    <div className="space-y-4">
      {isSinging && currentSong && (
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-4 text-white shadow-xl shadow-pink-500/20 animate-pulse">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>¡Tu turno en vivo en la TV!</span>
          </div>
          <h3 className="text-base font-bold truncate">{currentSong.title}</h3>
          <p className="text-xs text-pink-200">¡Canta con todo, {guestName}! 🎤</p>
        </div>
      )}

      {mySongs.length > 0 ? (
        <>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Tu Posición</span>
              <div className="text-2xl font-black text-emerald-400">#{turnStatus.queuePosition > 0 ? turnStatus.queuePosition : 1}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Espera Estimada</span>
              <div className="flex items-center gap-1 text-sm font-bold text-white justify-end">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /><span>~{turnStatus.estimatedWaitMinutes} min</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tus Temas Solicitados ({mySongs.length})</h4>
              {mySongs.length >= 2 && onSwapSongs && (
                <button
                  type="button"
                  onClick={() => onSwapSongs(mySongs[0].id, mySongs[1].id)}
                  className="text-[11px] text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Invertir orden
                </button>
              )}
            </div>
            {mySongs.map((song, idx) => (
              <div
                key={song.id}
                className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3 flex items-center gap-2.5"
              >
                <div className="w-5 text-center font-bold text-xs text-zinc-500">#{idx + 1}</div>
                {song.thumbnail_url && (
                  <img src={song.thumbnail_url} alt={song.title} className="w-12 h-9 object-cover rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-semibold text-white truncate">{song.title}</h5>
                  <p className="text-[10px] text-zinc-400 truncate">{song.duration_text}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onReplaceSong(song)}
                    title="Cambiar canción por otra sin perder tu turno"
                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Cambiar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onCancelSong(song)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                    aria-label="Cancelar canción"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : !isSinging ? (
        <div className="text-center py-12 px-4 space-y-3">
          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-600">
            <Music className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white">No tienes canciones en la fila</h4>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Busca cualquier canción o karaoke en YouTube y agrégala a la lista de la fiesta.
          </p>
          <button
            type="button"
            onClick={onGoToSearch}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-xl shadow-lg transition-transform active:scale-95"
          >
            Buscar una canción
          </button>
        </div>
      ) : null}
    </div>
  );
};
