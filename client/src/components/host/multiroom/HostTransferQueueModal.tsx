import { useState, type FC } from 'react';
import { X, ArrowRightLeft, AlertTriangle, Check } from 'lucide-react';
import { transferQueueBetweenRooms } from '../../../services/karaokeApi';
import type { KaraokeRoom } from '../../../types';

interface HostTransferQueueModalProps {
  isOpen: boolean;
  sourceRoom: KaraokeRoom;
  allRooms: KaraokeRoom[];
  pendingQueueCount: number;
  onClose: () => void;
  onTransferred: () => void;
}

export const HostTransferQueueModal: FC<HostTransferQueueModalProps> = ({
  isOpen, sourceRoom, allRooms, pendingQueueCount, onClose, onTransferred,
}) => {
  const targetRooms = allRooms.filter((r) => r.id !== sourceRoom.id);
  const [selectedTargetId, setSelectedTargetId] = useState(targetRooms[0]?.id || '');
  const [transferring, setTransferring] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleTransfer = async () => {
    if (!selectedTargetId) return;
    setTransferring(true);
    const res = await transferQueueBetweenRooms(sourceRoom.id, selectedTargetId);
    setTransferring(false);
    if (res.success) {
      setSuccessCount(res.transferredCount || 0);
      setTimeout(() => { setSuccessCount(null); onTransferred(); onClose(); }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center"><ArrowRightLeft className="w-4 h-4" /></div>
            <div><h3 className="text-sm font-bold text-white">Traspasar Fila de Canciones</h3><p className="text-[10px] text-zinc-400">De {sourceRoom.zone_name || sourceRoom.name}</p></div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-zinc-500">Canciones en espera:</span>
            <div className="text-xl font-black text-purple-300">{pendingQueueCount} canciones</div>
            <p className="text-[11px] text-zinc-400">Se trasladarán al final de la cola del ambiente receptor conservando su orden.</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Ambiente Destino:</label>
            <select value={selectedTargetId} onChange={(e) => setSelectedTargetId(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500">
              {targetRooms.map((r) => (
                <option key={r.id} value={r.id}>{r.zone_name || r.name} ({r.room_code})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Útil cuando este sector cierra y los clientes pasan al salón principal.</span>
          </div>

          <div className="pt-2 flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700">Cancelar</button>
            <button type="button" onClick={handleTransfer} disabled={transferring || !selectedTargetId || pendingQueueCount === 0} className="flex-1 py-2.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-1.5 disabled:opacity-50">
              {successCount !== null ? <Check className="w-4 h-4 text-emerald-300" /> : transferring ? 'Traspasando...' : 'Traspasar Cola'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
