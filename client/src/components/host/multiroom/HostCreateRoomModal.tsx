import { useState, type FC, type FormEvent } from 'react';
import { X, Store, KeyRound, DollarSign, Sparkles } from 'lucide-react';
import { createOwnerRoom } from '../../../services/karaokeApi';
import type { KaraokeRoom } from '../../../types';

interface HostCreateRoomModalProps {
  isOpen: boolean;
  ownerEmail: string;
  businessName: string;
  onClose: () => void;
  onCreated: (newRoom: KaraokeRoom) => void;
}

export const HostCreateRoomModal: FC<HostCreateRoomModalProps> = ({
  isOpen, ownerEmail, businessName, onClose, onCreated,
}) => {
  const [zoneName, setZoneName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [hostPin, setHostPin] = useState('1234');
  const [vipPrice, setVipPrice] = useState('500');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim() || !roomCode.trim() || hostPin.length !== 4) return;
    setLoading(true); setErrorMsg(null);
    const res = await createOwnerRoom({
      ownerEmail, businessName, zoneName: zoneName.trim(), roomCode: roomCode.trim().toUpperCase(),
      hostPin, vipPriceArs: Number(vipPrice) || 500,
    });
    setLoading(false);
    if (res) { onCreated(res); onClose(); }
    else { setErrorMsg('El código de sala ya existe o hubo un error al crearla.'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center"><Store className="w-4 h-4" /></div>
            <div><h3 className="text-sm font-bold text-white">Nuevo Ambiente / Sector</h3><p className="text-[10px] text-zinc-400">{businessName}</p></div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {errorMsg && <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">{errorMsg}</div>}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Nombre del Sector</label>
            <input type="text" value={zoneName} onChange={(e) => setZoneName(e.target.value)} placeholder="Ej: Terraza, Patio Cervecero, VIP..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500" required />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Código de Sala</label>
              <input type="text" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))} placeholder="Ej: TERRAZA" minLength={3} maxLength={8} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white uppercase focus:outline-none focus:border-purple-500" required />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1"><KeyRound className="w-3 h-3 text-pink-400" /> PIN Staff</label>
              <input type="password" maxLength={4} value={hostPin} onChange={(e) => setHostPin(e.target.value.replace(/\D/g, ''))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-center text-white focus:outline-none focus:border-pink-500" required />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3 text-emerald-400" /> Precio Pase VIP ($ ARS)</label>
            <input type="number" step="100" min="0" value={vipPrice} onChange={(e) => setVipPrice(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" required />
          </div>

          <div className="pt-2 flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700">Cancelar</button>
            <button type="submit" disabled={loading || !zoneName.trim() || !roomCode.trim()} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-1.5 disabled:opacity-50">
              <Sparkles className="w-3.5 h-3.5" /><span>{loading ? 'Creando...' : 'Crear Ambiente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
