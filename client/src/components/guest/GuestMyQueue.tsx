import { useState, useRef, type FC, type TouchEvent } from 'react';
import { Sparkles, Trash2, Clock, Music, RefreshCw, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import type { QueueItem, GuestTurnStatus } from '../../types';

interface GuestMyQueueProps {
  mySongs: QueueItem[]; currentSong: QueueItem | null; guestName: string;
  turnStatus: GuestTurnStatus; onCancelSong: (song: QueueItem) => void;
  onReplaceSong: (song: QueueItem) => void; onSwapSongs?: (id1: string, id2: string) => void;
  onGoToSearch: () => void;
}

export const GuestMyQueue: FC<GuestMyQueueProps> = ({
  mySongs, currentSong, guestName, turnStatus, onCancelSong, onReplaceSong, onSwapSongs, onGoToSearch,
}) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const startYRef = useRef(0);
  const touchDoneRef = useRef(false);

  const handleTouchStart = (idx: number, e: TouchEvent) => {
    startYRef.current = e.touches[0].clientY; touchDoneRef.current = false; setActiveIdx(idx);
  };
  const handleTouchMove = (idx: number, e: TouchEvent) => {
    if (!startYRef.current || !onSwapSongs || touchDoneRef.current || isBusy) return;
    const dy = e.touches[0].clientY - startYRef.current;
    if (Math.abs(dy) > 35) {
      touchDoneRef.current = true; setIsBusy(true);
      if (dy > 35 && idx < mySongs.length - 1) {
        onSwapSongs(mySongs[idx].id, mySongs[idx + 1].id);
      } else if (dy < -35 && idx > 0) {
        onSwapSongs(mySongs[idx].id, mySongs[idx - 1].id);
      }
      setTimeout(() => setIsBusy(false), 600);
    }
  };
  const handleTouchEnd = () => { setActiveIdx(null); startYRef.current = 0; touchDoneRef.current = false; };

  return (
    <div className="space-y-4">
      {turnStatus.isSingingNow && currentSong && (
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-4 text-white shadow-xl animate-pulse">
          <div className="flex items-center gap-2 text-xs font-black uppercase mb-1">
            <Sparkles className="w-4 h-4 text-amber-300" /><span>¡Tu turno en vivo en la TV!</span>
          </div>
          <h3 className="text-base font-bold truncate">{currentSong.title}</h3>
          <p className="text-xs text-pink-200">¡Canta con todo, {guestName}! 🎤</p>
        </div>
      )}

      {mySongs.length > 0 ? (
        <>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400">Tu Posición</span>
              <div className="text-2xl font-black text-emerald-400">#{turnStatus.queuePosition > 0 ? turnStatus.queuePosition : 1}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Espera Estimada</span>
              <div className="flex items-center gap-1 text-sm font-bold text-white justify-end">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /><span>~{turnStatus.estimatedWaitMinutes} min</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tus Temas ({mySongs.length})</h4>
              {mySongs.length >= 2 && (
                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <GripVertical className="w-3 h-3 text-emerald-400" /> Arrastra con el dedo para ordenar
                </span>
              )}
            </div>

            {mySongs.map((song, idx) => (
              <div key={song.id} className={`bg-zinc-900/90 border rounded-2xl p-3 flex items-center gap-2 select-none transition-all ${activeIdx === idx ? 'border-emerald-400 bg-zinc-800 shadow-lg scale-[1.02]' : 'border-zinc-800'}`}>
                {mySongs.length >= 2 && (
                  <div onTouchStart={(e) => handleTouchStart(idx, e)} onTouchMove={(e) => handleTouchMove(idx, e)} onTouchEnd={handleTouchEnd} className="p-1 text-zinc-500 hover:text-zinc-300 touch-none cursor-grab active:cursor-grabbing" title="Arrastra con el dedo">
                    <GripVertical className="w-5 h-5 text-emerald-400" />
                  </div>
                )}
                <div className="w-5 text-center font-bold text-xs text-zinc-500">#{idx + 1}</div>
                {song.thumbnail_url && (
                  <img src={song.thumbnail_url} alt={song.title} onClick={() => onReplaceSong(song)} className="w-12 h-9 object-cover rounded-lg shrink-0 cursor-pointer" />
                )}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onReplaceSong(song)}>
                  <h5 className="text-xs font-semibold text-white truncate">{song.title}</h5>
                  <p className="text-[10px] text-zinc-400 truncate">{song.duration_text} • Toca para cambiar</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {mySongs.length >= 2 && onSwapSongs && (
                    <div className="flex flex-col gap-0.5">
                      <button disabled={idx === 0 || isBusy} onClick={() => onSwapSongs(song.id, mySongs[idx - 1].id)} className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 active:scale-90" aria-label="Mover arriba"><ArrowUp className="w-3.5 h-3.5" /></button>
                      <button disabled={idx === mySongs.length - 1 || isBusy} onClick={() => onSwapSongs(song.id, mySongs[idx + 1].id)} className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 active:scale-90" aria-label="Mover abajo"><ArrowDown className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                  <button type="button" onClick={() => onReplaceSong(song)} className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-[11px] font-bold rounded-lg flex items-center gap-1"><RefreshCw className="w-3 h-3" /><span>Cambiar</span></button>
                  <button type="button" onClick={() => onCancelSong(song)} className="p-1.5 text-zinc-500 hover:text-rose-400" aria-label="Cancelar canción"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : !turnStatus.isSingingNow ? (
        <div className="text-center py-12 px-4 space-y-3">
          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-600"><Music className="w-6 h-6" /></div>
          <h4 className="text-sm font-bold text-white">No tienes canciones en la fila</h4>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">Busca cualquier canción o karaoke en YouTube y agrégala a la lista.</p>
          <button type="button" onClick={onGoToSearch} className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-xl shadow-lg active:scale-95">Buscar una canción</button>
        </div>
      ) : null}
    </div>
  );
};
