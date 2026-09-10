import { useState, useEffect, type FC } from 'react';
import { Disc3, X, Sparkles, Check, Music2, Radio } from 'lucide-react';
import { AUTO_DJ_STATIONS, purgeAutoDjSongs } from '../../services/autoDjService';
import { updateRoomSettings } from '../../services/karaokeApi';
import { supabase } from '../../lib/supabaseClient';
import type { KaraokeRoom } from '../../types';

interface HostAutoDjModalProps {
  isOpen: boolean;
  room: KaraokeRoom | null;
  onClose: () => void;
  onUpdated: () => void;
}

export const HostAutoDjModal: FC<HostAutoDjModalProps> = ({ isOpen, room, onClose, onUpdated }) => {
  const [enabled, setEnabled] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('rock_nacional');
  const [seedText, setSeedText] = useState('');
  const [mode, setMode] = useState<'station' | 'seed'>('station');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (room) {
      setEnabled(Boolean(room.auto_dj_enabled));
      const g = room.auto_dj_genre || 'rock_nacional';
      setSelectedGenre(g);
      if (g.startsWith('seed:')) {
        setMode('seed');
        setSeedText(g.slice(5));
      } else {
        setMode('station');
        setSeedText('');
      }
    }
  }, [room, isOpen]);

  if (!isOpen || !room) return null;

  const handleSave = async () => {
    setSaving(true);
    const finalGenre = mode === 'seed' && seedText.trim() ? `seed:${seedText.trim()}` : selectedGenre;
    if (!enabled) await purgeAutoDjSongs(room.id);
    await updateRoomSettings(room.id, { auto_dj_enabled: enabled, auto_dj_genre: finalGenre });
    supabase.channel(`tv-room-${room.id}`).send({ type: 'broadcast', event: 'set_auto_dj', payload: { enabled, genre: finalGenre } }).catch(() => {});
    setSaving(false);
    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center"><Disc3 className="w-4 h-4 animate-spin" /></div>
            <div><h3 className="text-sm font-bold text-white flex items-center gap-1.5">Auto-DJ Ambiente <Sparkles className="w-3.5 h-3.5 text-amber-400" /></h3><p className="text-[10px] text-zinc-400">Música de fondo automática cuando no hay pedidos</p></div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex items-center justify-between p-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl mb-3">
          <div><p className="text-xs font-bold text-white">Activar Música Continua</p><p className="text-[10px] text-zinc-400">Nunca deja la TV en silencio</p></div>
          <button type="button" onClick={() => setEnabled(!enabled)} className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-pink-600' : 'bg-zinc-800'}`}>
            <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${enabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className="flex gap-2 p-1 bg-zinc-950 border border-zinc-800 rounded-xl mb-3">
          <button type="button" onClick={() => setMode('station')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${mode === 'station' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}><Radio className="w-3.5 h-3.5" /> Estaciones de Bar</button>
          <button type="button" onClick={() => setMode('seed')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${mode === 'seed' ? 'bg-pink-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}><Music2 className="w-3.5 h-3.5" /> Canción Semilla</button>
        </div>

        {mode === 'station' ? (
          <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-48 pr-1 mb-4">
            {AUTO_DJ_STATIONS.map((st) => (
              <button key={st.id} type="button" onClick={() => setSelectedGenre(st.id)} className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${selectedGenre === st.id ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-950/40' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white"><span>{st.icon}</span><span className="truncate">{st.name}</span></div>
                <p className="text-[10px] text-zinc-400 line-clamp-1">{st.description}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 mb-4 space-y-2">
            <label className="block text-[11px] font-bold text-zinc-300">Canción o Artista de Partida:</label>
            <input type="text" placeholder="Ej: Soda Stereo, Queen, Gilda, Rock 80s..." value={seedText} onChange={(e) => setSeedText(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500" />
            <p className="text-[10px] text-zinc-500">YouTube buscará temas oficiales similares sin repetir.</p>
          </div>
        )}

        <div className="pt-2 border-t border-zinc-800 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700">Cancelar</button>
          <button type="button" onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white flex items-center justify-center gap-1.5 disabled:opacity-50">
            {saving ? 'Guardando...' : <><Check className="w-4 h-4" /> Guardar Estación</>}
          </button>
        </div>
      </div>
    </div>
  );
};
