import { useState, type FC, type FormEvent } from 'react';
import { X, Tv, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type { KaraokeRoom } from '../../types';

interface HostPairTvModalProps {
  isOpen: boolean;
  initialCode?: string;
  rooms: KaraokeRoom[];
  onClose: () => void;
  onSuccess: (roomCode: string) => void;
}

export const HostPairTvModal: FC<HostPairTvModalProps> = ({
  isOpen, initialCode = '', rooms, onClose, onSuccess,
}) => {
  const [tvCode, setTvCode] = useState(initialCode);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(() => rooms[0]?.id || '');
  const [isSendingFlash, setIsSendingFlash] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  if (!isOpen) return null;

  const targetCode = tvCode.trim().toUpperCase();
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  const handleFlash = async () => {
    if (!targetCode) return;
    setIsSendingFlash(true);
    const ch = supabase.channel(`tv-activation-${targetCode}`);
    await ch.send({ type: 'broadcast', event: 'flash', payload: {} });
    setTimeout(() => { setIsSendingFlash(false); supabase.removeChannel(ch); }, 3000);
  };

  const handlePair = async (e: FormEvent) => {
    e.preventDefault();
    if (!targetCode || !selectedRoom) return;
    setIsLinking(true);
    const ch = supabase.channel(`tv-activation-${targetCode}`);
    await ch.send({
      type: 'broadcast',
      event: 'paired',
      payload: { roomCode: selectedRoom.room_code, roomName: selectedRoom.zone_name || selectedRoom.name },
    });
    setTimeout(() => {
      setIsLinking(false);
      supabase.removeChannel(ch);
      onSuccess(selectedRoom.room_code);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Vincular Nueva Pantalla TV</h3>
              <p className="text-[10px] text-zinc-400">Asigna un televisor a cualquiera de tus ambientes</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handlePair} className="space-y-4 text-xs">
          <div>
            <label className="text-[11px] font-bold text-zinc-300 block mb-1">Código de la TV (mostrado en pantalla):</label>
            <div className="flex gap-2">
              <input type="text" value={tvCode} onChange={(e) => setTvCode(e.target.value.toUpperCase())} placeholder="Ej: TV-4821" className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono font-bold tracking-wider text-center uppercase focus:outline-none focus:border-purple-500" required />
              <button type="button" onClick={handleFlash} disabled={!targetCode || isSendingFlash} className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-amber-300 font-bold flex items-center gap-1.5 transition-colors" title="Hace destellar la pantalla elegida">
                <Sparkles className="w-3.5 h-3.5" /><span>{isSendingFlash ? 'Destellando...' : 'Hacer Parpadear'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-300 block mb-1.5">Asignar este televisor al sector:</label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {rooms.map((r) => (
                <label key={r.id} className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedRoomId === r.id ? 'bg-purple-950/40 border-purple-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="pair_room" value={r.id} checked={selectedRoomId === r.id} onChange={() => setSelectedRoomId(r.id)} className="accent-purple-600" />
                    <span className="font-bold text-xs">{r.zone_name || r.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-purple-400 font-black uppercase">{r.room_code}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-zinc-800">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition-colors">Cancelar</button>
            <button type="submit" disabled={!targetCode || !selectedRoom || isLinking} className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-purple-600/30">
              <CheckCircle2 className="w-4 h-4" /><span>{isLinking ? 'Vinculando...' : 'Confirmar Enlace'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
