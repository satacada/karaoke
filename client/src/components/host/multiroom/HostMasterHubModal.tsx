import { useState, type FC } from 'react';
import { X, SlidersHorizontal, Radio, ArrowRightLeft, Tv, Sparkles } from 'lucide-react';
import { setRoomStatus, updateRoomZoneConfig, sendRemoteCommand } from '../../../services/karaokeApi';
import type { KaraokeRoom, RoomStatus } from '../../../types';

interface HostMasterHubModalProps {
  isOpen: boolean; rooms: KaraokeRoom[]; ownerEmail?: string | null; onClose: () => void; onRefresh: () => void;
  onOpenTransfer: (room: KaraokeRoom) => void; onOpenCreateRoom: () => void; onOpenPairTv?: () => void;
}

export const HostMasterHubModal: FC<HostMasterHubModalProps> = ({
  isOpen, rooms, ownerEmail, onClose, onRefresh, onOpenTransfer, onOpenCreateRoom, onOpenPairTv = () => {},
}) => {
  const [tab, setTab] = useState<'status' | 'sound' | 'pricing'>('status');
  const [globalSync, setGlobalSync] = useState(false);

  if (!isOpen) return null;

  const handleStatusChange = async (roomId: string, nextStatus: RoomStatus) => {
    await setRoomStatus(roomId, nextStatus); onRefresh();
  };

  const handleToggleGlobalSync = async () => {
    const nextSync = !globalSync; setGlobalSync(nextSync);
    for (const r of rooms) { await sendRemoteCommand(r.id, 'sync_master_track', { enabled: nextSync }); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center"><SlidersHorizontal className="w-4 h-4" /></div>
            <div><h3 className="text-sm font-black text-white">Master Venue Hub</h3><p className="text-[10px] text-zinc-400">Dueño: {ownerEmail || 'Google Auth'}</p></div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <nav className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 mb-3">
          <button onClick={() => setTab('status')} className={`py-1.5 rounded-xl text-xs font-bold transition-all ${tab === 'status' ? 'bg-purple-600 text-white' : 'text-zinc-400'}`}>1. Ambientes</button>
          <button onClick={() => setTab('sound')} className={`py-1.5 rounded-xl text-xs font-bold transition-all ${tab === 'sound' ? 'bg-purple-600 text-white' : 'text-zinc-400'}`}>2. Sonido</button>
          <button onClick={() => setTab('pricing')} className={`py-1.5 rounded-xl text-xs font-bold transition-all ${tab === 'pricing' ? 'bg-purple-600 text-white' : 'text-zinc-400'}`}>3. Tarifas / PINs</button>
        </nav>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
          {tab === 'status' && (
            <div className="space-y-2">
              {rooms.map((r) => (
                <div key={r.id} className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">{r.zone_name || r.name}</h4>
                    <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">{r.room_code}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(['active', 'paused', 'closed'] as RoomStatus[]).map((st) => (
                      <button key={st} onClick={() => handleStatusChange(r.id, st)} className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${r.status === st ? (st === 'active' ? 'bg-emerald-500 text-zinc-950' : st === 'paused' ? 'bg-amber-500 text-zinc-950' : 'bg-rose-600 text-white') : 'bg-zinc-900 border border-zinc-800 text-zinc-500'}`}>
                        {st === 'active' ? '🟢' : st === 'paused' ? '🟡' : '🔴'}
                      </button>
                    ))}
                    <button onClick={() => sendRemoteCommand(r.id, 'volume', { action: 'flash_identify' })} title="Identificar pantalla TV" className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-white"><Sparkles className="w-3.5 h-3.5" /></button>
                    <button onClick={() => sendRemoteCommand(r.id, 'volume', { action: 'unlink_tv' })} title="Desvincular pantalla TV" className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-rose-400 hover:text-white"><Tv className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onOpenTransfer(r)} title="Traspasar cola" className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-purple-400 hover:text-white"><ArrowRightLeft className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button onClick={onOpenCreateRoom} className="py-2.5 rounded-xl border border-dashed border-purple-500/40 text-purple-300 hover:bg-purple-950/20 font-bold text-xs flex items-center justify-center gap-1">+ Sector</button>
                <button onClick={onOpenPairTv} className="py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/50 text-purple-200 hover:bg-purple-600/30 font-bold text-xs flex items-center justify-center gap-1"><Tv className="w-3.5 h-3.5" /> Vincular TV</button>
              </div>
            </div>
          )}

          {tab === 'sound' && (
            <div className="space-y-3">
              <div className="p-3 bg-purple-950/30 border border-purple-600/40 rounded-2xl flex items-center justify-between">
                <div><h4 className="font-bold text-white text-xs flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" /> Modo Fiesta Unificada</h4><p className="text-[10px] text-zinc-400">Sincroniza la misma música en todas las TVs del local a la vez</p></div>
                <button onClick={handleToggleGlobalSync} className={`w-11 h-6 rounded-full transition-colors relative ${globalSync ? 'bg-pink-600' : 'bg-zinc-800'}`}><div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${globalSync ? 'left-6' : 'left-1'}`} /></button>
              </div>
              {rooms.map((r) => (
                <div key={r.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1.5">
                  <div className="flex justify-between font-bold text-white text-xs"><span>{r.zone_name || r.name}</span><span className="text-zinc-500 font-mono text-[10px]">{r.room_code}</span></div>
                  <p className="text-[10px] text-zinc-400">Géneros permitidos en el buscador:</p>
                  <div className="flex gap-1.5">
                    {['Todos Libres', 'Solo Rock / Pop', 'Acústico / Chill'].map((g, idx) => (
                      <button key={g} onClick={() => updateRoomZoneConfig(r.id, { allowedGenres: [g] }).then(onRefresh)} className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${idx === 0 ? 'bg-purple-600/30 border-purple-500 text-purple-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>{g}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'pricing' && (
            <div className="space-y-2.5">
              {rooms.map((r) => (
                <div key={r.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between">
                  <div><h4 className="font-bold text-white text-xs">{r.zone_name || r.name}</h4><p className="text-[10px] text-zinc-500 font-mono">PIN Staff: <b className="text-pink-400">{r.host_pin}</b></p></div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400">Pase VIP:</span>
                    <input type="number" step="100" defaultValue={r.vip_price_ars || 500} onBlur={(e) => updateRoomZoneConfig(r.id, { vipPriceArs: Number(e.target.value) }).then(onRefresh)} className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-emerald-400 font-mono font-bold text-center focus:outline-none focus:border-emerald-500" />
                    <span className="text-[10px] text-emerald-400 font-bold">$ ARS</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
