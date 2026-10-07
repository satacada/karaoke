import { useState, useEffect, type FC } from 'react';
import { Disc3, X, Sparkles, Radio, Music2, Plus } from 'lucide-react';
import { getAllStations, addCustomStation, purgeAutoDjSongs, enqueueAutoDjSong } from '../../services/autoDjService';
import { advanceNextSong, sendRemoteCommand } from '../../services/karaokeApi';
import { saveRemoteAutoDjSettings, isLocalAutoDjActive, getLocalAutoDjGenre } from '../../services/autoDjStateService';
import type { KaraokeRoom } from '../../types';

interface HostAutoDjModalProps { isOpen: boolean; room: KaraokeRoom | null; onClose: () => void; onUpdated: () => void; }

export const HostAutoDjModal: FC<HostAutoDjModalProps> = ({ isOpen, room, onClose, onUpdated }) => {
  const [enabled, setEnabled] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('cumbia_fiesta');
  const [filterCat, setFilterCat] = useState('Todos');
  const [newGenreName, setNewGenreName] = useState('');
  const [saving, setSaving] = useState(false);
  const stations = getAllStations();

  useEffect(() => {
    if (room) {
      setEnabled(Boolean(room.auto_dj_enabled) || isLocalAutoDjActive(room.room_code));
      setSelectedGenre(room.auto_dj_genre || getLocalAutoDjGenre(room.room_code) || 'cumbia_fiesta');
    }
  }, [room, isOpen]);

  if (!isOpen || !room) return null;

  const applyStation = async (genreId: string, isAct: boolean) => {
    setSaving(true);
    await saveRemoteAutoDjSettings(room.id, room.room_code, isAct, genreId);
    if (!isAct) await purgeAutoDjSongs(room.id);
    else {
      const ok = await enqueueAutoDjSong(room.id, genreId);
      if (ok) { await advanceNextSong(room.id); await sendRemoteCommand(room.id, 'play'); }
    }
    setSaving(false); onUpdated(); onClose();
  };

  const handleAddCustom = () => {
    if (!newGenreName.trim()) return;
    const added = addCustomStation(newGenreName.trim(), newGenreName.trim());
    setSelectedGenre(added.id); setNewGenreName('');
    applyStation(added.id, true);
  };

  const filtered = filterCat === 'Todos' ? stations : stations.filter((s) => s.category.includes(filterCat));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center"><Disc3 className="w-4 h-4 animate-spin" /></div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">Estaciones y Géneros Musicales <Sparkles className="w-3.5 h-3.5 text-amber-400" /></h3>
              <p className="text-[10px] text-zinc-400">1-Tap: Toca cualquier género para que suene de inmediato en la TV</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className={`flex items-center justify-between p-3 rounded-2xl mb-3 border ${enabled ? 'bg-purple-950/40 border-pink-500/50' : 'bg-zinc-950/80 border-zinc-800'}`}>
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-1.5">Música Continua <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${enabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'}`}>{enabled ? '● ACTIVA' : '○ PAUSADA'}</span></p>
            <p className="text-[10px] text-zinc-400">Mantiene la TV sonando sin pausas entre pedidos</p>
          </div>
          <button type="button" onClick={() => { const next = !enabled; setEnabled(next); applyStation(selectedGenre, next); }} disabled={saving} className={`w-12 h-6 rounded-full relative cursor-pointer ${enabled ? 'bg-pink-600' : 'bg-zinc-800'}`}><div className={`w-4 h-4 rounded-full bg-white absolute top-1 ${enabled ? 'left-7' : 'left-1'}`} /></button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2">
          {['Todos', 'Bailables', 'Rock', 'Clásicos', 'Chill'].map((cat) => (
            <button key={cat} type="button" onClick={() => setFilterCat(cat)} className={`px-2.5 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap transition-colors ${filterCat === cat ? 'bg-pink-600 text-white' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'}`}>{cat}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-52 pr-1 mb-2">
          {filtered.map((st) => (
            <button key={st.id} type="button" disabled={saving} onClick={() => { setSelectedGenre(st.id); setEnabled(true); applyStation(st.id, true); }} className={`p-2.5 rounded-2xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer active:scale-95 ${selectedGenre === st.id && enabled ? 'bg-purple-600/30 border-purple-400 text-white ring-1 ring-purple-400 shadow-lg' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white"><span className="text-sm">{st.icon}</span><span className="truncate">{st.name}</span></div>
              <p className="text-[9px] text-zinc-400 line-clamp-1">{st.description}</p>
              {selectedGenre === st.id && enabled && <span className="text-[9px] font-bold text-pink-400 mt-0.5">● Sonando Ahora</span>}
            </button>
          ))}
        </div>

        <div className="pt-2 border-t border-zinc-800 flex items-center gap-1.5">
          <input type="text" placeholder="¿Nuevo género? Ej: Guaracha, Synthwave..." value={newGenreName} onChange={(e) => setNewGenreName(e.target.value)} className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500" />
          <button type="button" onClick={handleAddCustom} disabled={!newGenreName.trim() || saving} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Agregar</button>
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700">Cerrar</button>
        </div>
      </div>
    </div>
  );
};
