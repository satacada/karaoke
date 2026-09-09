import { useState, type FC } from 'react';
import { Settings, X, Shield, KeyRound, Store, Check } from 'lucide-react';
import { updateRoomSettings } from '../../services/karaokeApi';
import type { KaraokeRoom } from '../../types';

interface HostSettingsModalProps {
  isOpen: boolean;
  room: KaraokeRoom | null;
  ownerEmail?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export const HostSettingsModal: FC<HostSettingsModalProps> = ({
  isOpen,
  room,
  ownerEmail,
  onClose,
  onSaved,
}) => {
  const [businessName, setBusinessName] = useState(room?.business_name || room?.name || 'Mi Rockola');
  const [newPin, setNewPin] = useState(room?.host_pin || '1234');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !room) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) return;
    setSaving(true);
    const ok = await updateRoomSettings(room.id, {
      name: businessName.trim(),
      business_name: businessName.trim(),
      host_pin: newPin,
    });
    setSaving(false);
    if (ok) {
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onSaved();
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Configuración del Local</h3>
              <p className="text-[10px] text-zinc-400 font-mono">Sala: {room.room_code}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-purple-400" />
              Nombre del Local / Bar
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-pink-400" />
              PIN de Operación DJ (4 dígitos)
            </label>
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-center font-mono tracking-widest text-white focus:outline-none focus:border-pink-500"
              required
            />
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-2.5 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-semibold">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Administrador / Dueño:</span>
            </div>
            <p className="text-[11px] text-white font-mono truncate">{ownerEmail || 'Autenticado vía Google'}</p>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || newPin.length !== 4}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
