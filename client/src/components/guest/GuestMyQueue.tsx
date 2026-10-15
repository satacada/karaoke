import { useMemo, type FC } from 'react';
import { Sparkles, Trash2, Clock, Music, RefreshCw, Zap, Trophy, Tv, Disc3 } from 'lucide-react';
import { parseSongMeta } from '../../utils/songMeta';
import type { QueueItem, GuestTurnStatus } from '../../types';

interface GuestMyQueueProps {
  mySongs: QueueItem[]; allQueuedSongs: QueueItem[]; currentSong: QueueItem | null; guestName: string;
  turnStatus: GuestTurnStatus; highestVipAmount: number; onCancelSong: (song: QueueItem) => void;
  onReplaceSong: (song: QueueItem) => void; onBoostSong: (song: QueueItem) => void; onGoToSearch: () => void;
}

export const GuestMyQueue: FC<GuestMyQueueProps> = ({
  mySongs, allQueuedSongs, currentSong, guestName, turnStatus, highestVipAmount,
  onCancelSong, onReplaceSong, onBoostSong, onGoToSearch,
}) => {
  const normName = guestName.trim().toLowerCase();
  const currentMeta = currentSong ? parseSongMeta(currentSong) : null;
  const nonAutoDj = useMemo(() => allQueuedSongs.filter((s) => !s.requested_by?.includes('Auto-DJ')), [allQueuedSongs]);
  const paidSongs = useMemo(() => nonAutoDj.filter((s) => parseSongMeta(s).isVip), [nonAutoDj]);
  const freeSongs = useMemo(() => nonAutoDj.filter((s) => !parseSongMeta(s).isVip), [nonAutoDj]);

  return (
    <div className="space-y-3.5">
      {currentSong && (
        <div className="bg-gradient-to-r from-purple-950/70 via-zinc-900 to-zinc-900 border-2 border-purple-500/60 rounded-2xl p-3 shadow-lg">
          <div className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-wider mb-1"><Tv className="w-3.5 h-3.5 animate-pulse" /><span>Sonando en vivo en la TV</span>{currentMeta?.isVip && <span className="ml-auto px-1.5 py-0.2 text-[9px] font-black bg-amber-400 text-zinc-950 rounded">VIP ⚡</span>}</div>
          <div className="flex items-center gap-2.5"><Disc3 className="w-8 h-8 text-pink-500 shrink-0 animate-spin" /><div className="min-w-0 flex-1"><h4 className="text-xs font-extrabold text-white truncate">{currentSong.title}</h4><p className="text-[11px] text-zinc-400">Pide: <span className="text-purple-300 font-bold">{currentSong.requested_by}</span></p></div></div>
        </div>
      )}
      {turnStatus.hasSongsInQueue && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between">
          <div className="space-y-0.5"><span className="text-[10px] uppercase font-bold text-zinc-400">Tu Turno ({mySongs.length} en fila)</span><div className="text-xs font-bold text-emerald-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /><span>{turnStatus.isSingingNow ? '¡Tu tema suena ahora!' : turnStatus.songsAhead === 0 ? '¡Siguiente en cantar!' : `Faltan ${turnStatus.songsAhead} temas`}</span></div></div>
          <div className="text-right"><span className="text-[10px] uppercase font-bold text-zinc-400">Espera aprox</span><div className="text-xs font-mono font-bold text-white flex items-center justify-end gap-1"><Clock className="w-3 h-3 text-emerald-400" /><span>~{turnStatus.estimatedWaitMinutes}m</span></div></div>
        </div>
      )}
      <div className="space-y-2">
        <div className="flex items-center justify-between"><div className="flex items-center gap-1.5 text-xs font-black text-amber-300 uppercase tracking-wider"><Trophy className="w-4 h-4 text-amber-400" /><span>⭐ Cola Prioritaria ({paidSongs.length})</span></div><span className="text-[10px] text-amber-400/90 font-mono font-bold">{highestVipAmount > 0 ? `Máx: $${highestVipAmount}` : 'Sin pagos'}</span></div>
        <div className="text-[11px] bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 text-amber-200/90 leading-tight">{highestVipAmount > 0 ? `Quien más aporta toca primero. Para ser #1 debes aportar más de $${highestVipAmount} ARS.` : 'Los temas con aporte tocan de primeros. Aporta desde $500 para tocar de #1.'}</div>
        {paidSongs.length > 0 ? (
          <div className="space-y-2">{paidSongs.map((song, idx) => {
            const isMine = (song.requested_by || '').trim().toLowerCase() === normName;
            const meta = parseSongMeta(song);
            return (
              <div key={song.id} className={`border rounded-2xl p-2.5 flex items-center gap-2 ${isMine ? 'bg-amber-950/20 border-amber-500/50 shadow-md' : 'bg-zinc-900/70 border-zinc-800'}`}>
                <div className="w-5 text-center font-black text-xs text-amber-400">#{idx + 1}</div>
                {meta.cleanThumbnail && <img src={meta.cleanThumbnail} alt={song.title} className="w-12 h-9 object-cover rounded-lg shrink-0" />}
                <div className="flex-1 min-w-0"><div className="flex items-center gap-1.5"><h5 className="text-xs font-bold text-white truncate">{song.title}</h5></div><div className="flex items-center gap-1 text-[10px] text-zinc-400"><span>{isMine ? 'Tú' : song.requested_by}</span><span>•</span><span className="text-amber-300 font-bold font-mono">${meta.vipAmount} ARS</span></div></div>
                <div className="flex items-center gap-1 shrink-0"><span className="px-2 py-0.5 rounded-lg bg-amber-400 text-zinc-950 font-black text-[10px] font-mono shadow-sm">${meta.vipAmount}</span>{isMine && (<><button type="button" onClick={() => onReplaceSong(song)} className="p-1 text-zinc-400 hover:text-emerald-400" title="Cambiar"><RefreshCw className="w-3.5 h-3.5" /></button><button type="button" onClick={() => onCancelSong(song)} className="p-1 text-zinc-400 hover:text-rose-400" title="Cancelar"><Trash2 className="w-3.5 h-3.5" /></button></>)}</div>
              </div>
            );
          })}</div>
        ) : (<div className="p-3 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl text-center text-xs text-zinc-500">No hay canciones prioritarias activas.</div>)}
      </div>
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between"><div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 uppercase tracking-wider"><Music className="w-4 h-4 text-emerald-400" /><span>🎵 Canciones Solicitadas ({freeSongs.length})</span></div><span className="text-[10px] text-zinc-500">Orden de llegada</span></div>
        <div className="text-[11px] text-zinc-400 leading-tight">Tocan en su turno después de las canciones prioritarias.</div>
        {freeSongs.length > 0 ? (
          <div className="space-y-2">{freeSongs.map((song, idx) => {
            const isMine = (song.requested_by || '').trim().toLowerCase() === normName;
            const meta = parseSongMeta(song);
            return (
              <div key={song.id} className={`border rounded-2xl p-2.5 flex items-center gap-2 ${isMine ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-zinc-900/60 border-zinc-800'}`}>
                <div className="w-5 text-center font-bold text-xs text-zinc-400">#{paidSongs.length + idx + 1}</div>
                {meta.cleanThumbnail && <img src={meta.cleanThumbnail} alt={song.title} className="w-12 h-9 object-cover rounded-lg shrink-0" />}
                <div className="flex-1 min-w-0"><h5 className="text-xs font-medium text-white truncate">{song.title}</h5><p className="text-[10px] text-zinc-400">{song.duration_text} • <span className={isMine ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>{isMine ? 'Tú' : song.requested_by}</span></p></div>
                <div className="flex items-center gap-1 shrink-0">{isMine ? (<><button type="button" onClick={() => onBoostSong(song)} className="px-2 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-black text-[10px] flex items-center gap-1 shadow-sm active:scale-95"><Zap className="w-3 h-3 fill-zinc-950" /><span>Prioridad</span></button><button type="button" onClick={() => onReplaceSong(song)} className="p-1 text-zinc-400 hover:text-emerald-400" title="Cambiar"><RefreshCw className="w-3.5 h-3.5" /></button><button type="button" onClick={() => onCancelSong(song)} className="p-1 text-zinc-400 hover:text-rose-400" title="Cancelar"><Trash2 className="w-3.5 h-3.5" /></button></>) : null}</div>
              </div>
            );
          })}</div>
        ) : (<div className="p-4 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl text-center space-y-2"><p className="text-xs text-zinc-500">No hay canciones solicitadas en cola regular.</p><button type="button" onClick={onGoToSearch} className="px-3 py-1.5 bg-emerald-500 text-zinc-950 text-xs font-bold rounded-xl shadow-md">Pedir una canción 🎤</button></div>)}
      </div>
    </div>
  );
};
