import { useState, useMemo, type FC } from 'react';
import { Tv, Disc3, Heart, Sparkles, Music2, Trophy, Music } from 'lucide-react';
import { parseSongMeta } from '../../utils/songMeta'; import { toggleSongLike } from '../../services/karaokeApi';
import type { QueueItem, GuestTurnStatus } from '../../types';

interface GuestPartyQueueProps {
  currentSong: QueueItem | null; queuedSongs: QueueItem[]; nextAutoDjSongs?: QueueItem[];
  turnStatus?: GuestTurnStatus; currentGuestName: string;
}

export const GuestPartyQueue: FC<GuestPartyQueueProps> = ({ currentSong, queuedSongs, nextAutoDjSongs = [], turnStatus, currentGuestName }) => {
  const normName = currentGuestName.trim().toLowerCase();
  const currentMeta = currentSong ? parseSongMeta(currentSong) : null;
  const [localLikes, setLocalLikes] = useState<Record<string, { count: number; liked: boolean }>>({});
  const maxLikes = useMemo(() => Math.max(0, ...queuedSongs.map((s) => localLikes[s.id]?.count ?? (s.likes_count || 0))), [queuedSongs, localLikes]);

  const nonAutoDj = useMemo(() => queuedSongs.filter((s) => !s.requested_by?.includes('Auto-DJ')), [queuedSongs]);
  const paidSongs = useMemo(() => nonAutoDj.filter((s) => parseSongMeta(s).isVip), [nonAutoDj]);
  const freeSongs = useMemo(() => nonAutoDj.filter((s) => !parseSongMeta(s).isVip), [nonAutoDj]);

  const handleLike = async (song: QueueItem) => {
    const isLiked = localLikes[song.id]?.liked ?? (song.liked_by?.includes(currentGuestName) || false);
    const count = localLikes[song.id]?.count ?? (song.likes_count || 0);
    const nLiked = !isLiked, nCount = nLiked ? count + 1 : Math.max(0, count - 1);
    setLocalLikes((prev) => ({ ...prev, [song.id]: { count: nCount, liked: nLiked } }));
    await toggleSongLike(song.id, currentGuestName);
  };

  const renderItem = (song: QueueItem, idx: number, isVipList: boolean) => {
    const isMine = (song.requested_by || '').trim().toLowerCase() === normName;
    const { dedication, isVip, vipAmount, cleanThumbnail } = parseSongMeta(song);
    const isLiked = localLikes[song.id]?.liked ?? (song.liked_by?.includes(currentGuestName) || false);
    const count = localLikes[song.id]?.count ?? (song.likes_count || 0);
    const displayPos = isVipList ? idx + 1 : paidSongs.length + idx + 1;
    return (
      <div key={song.id} className={`border rounded-2xl p-2.5 flex items-center gap-2.5 transition-colors ${isVipList ? 'bg-amber-950/20 border-amber-500/40' : isMine ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-zinc-900/60 border-zinc-800/80'}`}>
        <div className={`w-5 text-center font-bold text-xs ${isVipList ? 'text-amber-400 font-black' : 'text-zinc-500'}`}>#{displayPos}</div>
        {(cleanThumbnail || song.thumbnail_url) && (<img src={(cleanThumbnail || song.thumbnail_url) || undefined} alt={song.title} className="w-12 h-9 object-cover rounded-lg shrink-0" />)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5"><h5 className="text-xs font-semibold text-white truncate">{song.title}</h5>{isVip && <span className="shrink-0 px-1.5 py-0.2 text-[9px] font-black bg-amber-400 text-zinc-950 rounded">${vipAmount}</span>}{maxLikes > 0 && count === maxLikes && <span className="shrink-0 px-1.5 py-0.2 text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">🔥 Top</span>}</div>
          {dedication && <p className="text-[10px] text-pink-300/90 italic truncate">💌 &quot;{dedication}&quot;</p>}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400"><span>{song.duration_text}</span><span>•</span><span className={isMine ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>{isMine ? 'Tú' : song.requested_by}</span></div>
        </div>
        <button onClick={() => handleLike(song)} className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl border transition-all active:scale-90 ${isLiked ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:text-rose-300'}`}>
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} /><span className="text-[10px] font-bold">{count}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-3.5">
      {currentSong && (
        <div className="bg-gradient-to-r from-purple-950/70 via-zinc-900 to-zinc-900 border-2 border-purple-500/60 rounded-2xl p-3 relative overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-wider mb-1"><Tv className="w-3.5 h-3.5 animate-pulse" /><span>En Vivo en la Pantalla TV</span>{currentMeta?.isVip && <span className="ml-auto px-1.5 py-0.2 text-[9px] font-black bg-amber-400 text-zinc-950 rounded">${currentMeta.vipAmount} VIP ⚡</span>}</div>
          <div className="flex items-center gap-3"><Disc3 className="w-9 h-9 text-pink-500 shrink-0 animate-spin" style={{ animationDuration: '3.5s' }} /><div className="min-w-0 flex-1"><h4 className="text-xs font-extrabold text-white truncate leading-snug">{currentSong.title}</h4>{currentMeta?.dedication && <p className="text-[10px] text-pink-300 italic truncate">💌 &quot;{currentMeta.dedication}&quot;</p>}<p className="text-[11px] text-zinc-400">Pide: <span className="text-purple-300 font-bold">{currentSong.requested_by}</span></p></div></div>
          {turnStatus?.hasSongsInQueue && (<div className="mt-2.5 py-1 px-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-between"><span className="flex items-center gap-1.5 text-[11px]"><Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />{turnStatus.isSingingNow ? '¡Tu pedido suena ahora!' : turnStatus.songsAhead === 0 ? '¡Tu pedido es el siguiente!' : `Faltan ${turnStatus.songsAhead} temas`}</span><span className="text-[10px] text-emerald-400 font-mono font-black bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700">#{turnStatus.queuePosition}</span></div>)}
        </div>
      )}
      {paidSongs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-amber-300 uppercase tracking-wider"><span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-amber-400" /><span>⭐ Cola Prioritaria ({paidSongs.length})</span></span><span className="text-[10px] text-amber-400 font-mono">Tocan Primero</span></div>
          <div className="space-y-2">{paidSongs.map((s, i) => renderItem(s, i, true))}</div>
        </div>
      )}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider"><span className="flex items-center gap-1"><Music className="w-3.5 h-3.5 text-emerald-400" /><span>Pedidos de la Fiesta ({freeSongs.length})</span></span><span className="text-[10px] text-zinc-500">Orden de llegada</span></div>
        {freeSongs.length > 0 ? (
          <div className="space-y-2">{freeSongs.map((s, i) => renderItem(s, i, false))}</div>
        ) : paidSongs.length === 0 ? (
          nextAutoDjSongs.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-purple-400 uppercase tracking-wider"><span className="flex items-center gap-1"><Music2 className="w-3.5 h-3.5" /><span>DJ Automático (Próximas 3)</span></span><span className="text-[10px] text-purple-300 font-mono">Ambiente</span></div>
              {nextAutoDjSongs.slice(0, 3).map((song, idx) => (
                <div key={song.id || idx} className="border border-purple-900/40 bg-zinc-900/50 rounded-2xl p-2 flex items-center gap-2"><div className="w-5 text-center font-bold text-xs text-purple-400">#{idx + 1}</div>{song.thumbnail_url && (<img src={song.thumbnail_url} alt={song.title} className="w-12 h-9 object-cover rounded-lg shrink-0 opacity-80" />)}<div className="flex-1 min-w-0"><h5 className="text-xs font-semibold text-white/90 truncate">{song.title}</h5><p className="text-[10px] text-zinc-400">{song.author} • {song.duration_text || '3:00'}</p></div><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-950/60 border border-purple-800 text-purple-300 shrink-0">Auto-DJ</span></div>
              ))}
            </div>
          ) : (<div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-5 text-center text-xs text-zinc-400">La cola está vacía. ¡Sé el primero en pedir música!</div>)
        ) : null}
      </div>
    </div>
  );
};
