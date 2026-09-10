import { useState, type FC } from 'react';
import { Settings, X, Shield, KeyRound, Store, Check, Disc3 } from 'lucide-react';
import { updateRoomSettings, sendRemoteCommand } from '../../services/karaokeApi';
import { supabase } from '../../lib/supabaseClient';
import type { KaraokeRoom, TvTheme, TvScale } from '../../types';
import { HostTvMaskSelector } from './HostTvMaskSelector';
import { HostTvScaleSelector } from './HostTvScaleSelector';

interface HostSettingsModalProps {
  isOpen: boolean; room: KaraokeRoom | null; ownerEmail?: string | null;
  onClose: () => void; onSaved: () => void;
}

export const HostSettingsModal: FC<HostSettingsModalProps> = ({
  isOpen, room, ownerEmail, onClose, onSaved,
}) => {
  const [businessName, setBusinessName] = useState(room?.business_name || room?.name || 'Mi Rockola');
  const [newPin, setNewPin] = useState(room?.host_pin || '1234');
  const [autoDj, setAutoDj] = useState(room?.auto_dj_enabled || false);
  const [tvTheme, setTvTheme] = useState<TvTheme>(() => (localStorage.getItem(`tv_theme_${room?.room_code}`) as TvTheme) || 'modern');
  const [tvScale, setTvScale] = useState<TvScale>(() => (localStorage.getItem(`tv_scale_${room?.room_code}`) as TvScale) || 'normal');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !room) return null;

  const handleThemeChange = (theme: TvTheme) => {
    setTvTheme(theme);
    sendRemoteCommand(room.id, 'volume', { action: 'set_tv_theme', theme }).catch(() => {});
    supabase.channel(`tv-room-${room.id}`).send({ type: 'broadcast', event: 'set_tv_theme', payload: { theme } }).catch(() => {});
    try { localStorage.setItem(`tv_theme_${room.room_code}`, theme); } catch {}
  };

  const handleScaleChange = (scale: TvScale) => {
    setTvScale(scale);
    sendRemoteCommand(room.id, 'volume', { action: 'set_tv_scale', scale }).catch(() => {});
    supabase.channel(`tv-room-${room.id}`).send({ type: 'broadcast', event: 'set_tv_scale', payload: { scale } }).catch(() => {});
    try { localStorage.setItem(`tv_scale_${room.room_code}`, scale); } catch {}
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) return;
    setSaving(true);
    handleThemeChange(tvTheme);
    handleScaleChange(tvScale);
    supabase.channel(`tv-room-${room.id}`).send({ type: 'broadcast', event: 'set_auto_dj', payload: { enabled: autoDj, genre: room.auto_dj_genre } }).catch(() => {});
    const ok = await updateRoomSettings(room.id, {
      name: businessName.trim(), business_name: businessName.trim(),
      host_pin: newPin, auto_dj_enabled: autoDj,
    });
    setSaving(false);
    if (ok) {
      setSavedSuccess(true);
      setTimeout(() => { setSavedSuccess(false); onSaved(); onClose(); }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center"><Settings className="w-4 h-4" /></div>
            <div><h3 className="text-sm font-bold text-white">Configuración del Local</h3><p className="text-[10px] text-zinc-400 font-mono">Sala: {room.room_code}</p></div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Store className="w-3.5 h-3.5 text-purple-400" /> Nombre del Local</label>
            <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500" required />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5 text-pink-400" /> PIN de Operación (4 dígitos)</label>
            <input type="password" maxLength={4} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-center font-mono tracking-widest text-white focus:outline-none focus:border-pink-500" required />
          </div>

          <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Disc3 className={`w-4 h-4 ${autoDj ? 'text-pink-400 animate-spin' : 'text-zinc-500'}`} />
              <div><p className="text-xs font-bold text-zinc-200">Auto-DJ Ambiente</p><p className="text-[10px] text-zinc-400">Música de fondo cuando la fila esté vacía</p></div>
            </div>
            <button type="button" onClick={() => setAutoDj(!autoDj)} className={`w-11 h-6 rounded-full transition-colors relative ${autoDj ? 'bg-purple-600' : 'bg-zinc-800'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${autoDj ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <HostTvMaskSelector selectedTheme={tvTheme} onSelectTheme={handleThemeChange} />
          <HostTvScaleSelector selectedScale={tvScale} onSelectScale={handleScaleChange} />

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-2 flex items-center gap-1.5 text-[10px] text-zinc-400 font-semibold">
            <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">Dueño: {ownerEmail || 'Google Auth'}</span>
          </div>

          <div className="pt-1 flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700">Cancelar</button>
            <button type="submit" disabled={saving || newPin.length !== 4} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-1.5 disabled:opacity-50">
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
