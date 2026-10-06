import { useState, useEffect, type FC } from 'react';
import { Disc3, X, Sparkles, Radio, Music2, Mic, MicOff } from 'lucide-react';
import { AUTO_DJ_STATIONS, purgeAutoDjSongs, enqueueAutoDjSong } from '../../services/autoDjService';
import { updateRoomSettings, advanceNextSong, sendRemoteCommand } from '../../services/karaokeApi';
import { supabase } from '../../lib/supabaseClient';
import { getRoomChannelName } from '../../utils/channelUtils';
import { setLocalAutoDjActive, isLocalAutoDjActive, getLocalAutoDjGenre } from '../../services/autoDjStateService';
import { logInfo } from '../../services/loggerService';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import type { KaraokeRoom } from '../../types';

interface HostAutoDjModalProps {
  isOpen: boolean; room: KaraokeRoom | null; onClose: () => void; onUpdated: () => void;
}

export const HostAutoDjModal: FC<HostAutoDjModalProps> = ({ isOpen, room, onClose, onUpdated }) => {
  const [enabled, setEnabled] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('cumbia_fiesta');
  const [seedText, setSeedText] = useState('');
  const [mode, setMode] = useState<'station' | 'seed'>('station');
  const [saving, setSaving] = useState(false);
  const { isListening, speechError, toggleListening } = useSpeechToText((text) => setSeedText(text));

  useEffect(() => {
    if (room) {
      const isAct = Boolean(room.auto_dj_enabled) || isLocalAutoDjActive(room.room_code);
      setEnabled(isAct);
      const g = getLocalAutoDjGenre(room.room_code) || room.auto_dj_genre || 'cumbia_fiesta';
      setSelectedGenre(g);
      if (g.startsWith('seed:')) { setMode('seed'); setSeedText(g.slice(5)); }
      else { setMode('station'); setSeedText(''); }
    }
  }, [room, isOpen]);

  if (!isOpen || !room) return null;

  const applyStation = async (genreToApply: string, isNowEnabled: boolean) => {
    setSaving(true);
    setLocalAutoDjActive(room.room_code, isNowEnabled, genreToApply);
    logInfo(room.room_code, 'host', 'autodj_settings_save', `Auto-DJ: ${genreToApply}`, { enabled: isNowEnabled });
    if (!isNowEnabled) await purgeAutoDjSongs(room.id);
    await updateRoomSettings(room.id, { auto_dj_enabled: isNowEnabled, auto_dj_genre: genreToApply });
    supabase.channel(getRoomChannelName(room.id)).send({ type: 'broadcast', event: 'set_auto_dj', payload: { enabled: isNowEnabled, genre: genreToApply } }).catch(() => {});
    if (isNowEnabled) {
      const ok = await enqueueAutoDjSong(room.id, genreToApply);
      if (ok) {
        await advanceNextSong(room.id);
        await sendRemoteCommand(room.id, 'play');
        await enqueueAutoDjSong(room.id, genreToApply);
        await enqueueAutoDjSong(room.id, genreToApply);
      }
    }
    setSaving(false);
    onUpdated();
    onClose();
  };

  const handleToggleContinuous = () => {
    const nextVal = !enabled;
    setEnabled(nextVal);
    applyStation(selectedGenre, nextVal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center"><Disc3 className="w-4 h-4 animate-spin" /></div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">Auto-DJ Ambiente <Sparkles className="w-3.5 h-3.5 text-amber-400" /></h3>
              <p className="text-[10px] text-zinc-400">1-Tap: Toca una estación y suena de inmediato</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className={`flex items-center justify-between p-3 rounded-2xl mb-3 border transition-colors ${enabled ? 'bg-purple-950/40 border-pink-500/50' : 'bg-zinc-950/80 border-zinc-800'}`}>
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              Música Continua
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${enabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'}`}>
                {enabled ? '● ACTIVA' : '○ PAUSADA'}
              </span>
            </p>
            <p className="text-[10px] text-zinc-400">La TV nunca queda en silencio mientras no haya pedidos</p>
          </div>
          <button type="button" onClick={handleToggleContinuous} disabled={saving} className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${enabled ? 'bg-pink-600' : 'bg-zinc-800'}`}>
            <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${enabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className="flex gap-2 p-1 bg-zinc-950 border border-zinc-800 rounded-xl mb-3">
          <button type="button" onClick={() => setMode('station')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${mode === 'station' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}><Radio className="w-3.5 h-3.5" /> Estaciones de Bar</button>
          <button type="button" onClick={() => setMode('seed')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${mode === 'seed' ? 'bg-pink-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}><Music2 className="w-3.5 h-3.5" /> Canción Semilla</button>
        </div>

        {mode === 'station' ? (
          <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-56 pr-1 mb-2">
            {AUTO_DJ_STATIONS.map((st) => (
              <button
                key={st.id}
                type="button"
                disabled={saving}
                onClick={() => { setSelectedGenre(st.id); setEnabled(true); applyStation(st.id, true); }}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer active:scale-95 ${selectedGenre === st.id && enabled ? 'bg-purple-600/30 border-purple-400 text-white shadow-lg ring-1 ring-purple-400' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'}`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white"><span>{st.icon}</span><span className="truncate">{st.name}</span></div>
                <p className="text-[10px] text-zinc-400 line-clamp-1">{st.description}</p>
                {selectedGenre === st.id && enabled && <span className="text-[9px] font-bold text-pink-400 mt-0.5">● Tocando ahora</span>}
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 mb-2 space-y-2">
            <label className="block text-[11px] font-bold text-zinc-300">Canción o Artista de Partida:</label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder={isListening ? '🎤 Escuchando... Di el artista o tema' : 'Ej: Soda Stereo, Queen, Gilda, Rock 80s...'}
                value={seedText}
                onChange={(e) => setSeedText(e.target.value)}
                className={`w-full bg-zinc-900 border rounded-xl pl-3 pr-10 py-2 text-xs text-white focus:outline-none transition-colors ${isListening ? 'border-pink-500 ring-2 ring-pink-500/30' : 'border-zinc-700 focus:border-pink-500'}`}
              />
              <button type="button" onClick={toggleListening} className={`absolute right-1.5 p-1.5 rounded-lg transition-all ${isListening ? 'bg-rose-600 text-white animate-pulse shadow-md' : 'bg-zinc-800 text-pink-400 hover:text-white'}`}>
                {isListening ? <MicOff className="w-3.5 h-3.5 animate-bounce" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            </div>
            {speechError && <p className="text-[10px] text-amber-400">⚠️ {speechError}</p>}
            <button type="button" onClick={() => applyStation(seedText.trim() ? `seed:${seedText.trim()}` : selectedGenre, true)} disabled={saving || !seedText.trim()} className="w-full mt-2 py-2 rounded-xl text-xs font-bold bg-pink-600 text-white hover:bg-pink-500 disabled:opacity-50">Iniciar desde Semilla</button>
          </div>
        )}

        <div className="pt-2 border-t border-zinc-800 flex justify-end">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700">Cerrar</button>
        </div>
      </div>
    </div>
  );
};
