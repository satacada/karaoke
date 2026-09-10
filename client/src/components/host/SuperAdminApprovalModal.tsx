import { useState, useEffect, type FC } from 'react';
import { ShieldCheck, X, CheckCircle, Ban, RefreshCw } from 'lucide-react';
import { getAllRoomsForSuperAdmin, approveRoom } from '../../services/karaokeApi';
import type { KaraokeRoom } from '../../types';

interface SuperAdminApprovalModalProps {
  isOpen: boolean;
  superAdminEmail: string;
  onClose: () => void;
  onUpdated: () => void;
}

export const SuperAdminApprovalModal: FC<SuperAdminApprovalModalProps> = ({
  isOpen,
  superAdminEmail,
  onClose,
  onUpdated,
}) => {
  const [rooms, setRooms] = useState<KaraokeRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchRooms = async () => {
    setLoading(true);
    const data = await getAllRoomsForSuperAdmin();
    setRooms(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchRooms();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = async (room: KaraokeRoom) => {
    setActingId(room.id);
    const newStatus = !room.is_approved;
    const ok = await approveRoom(room.id, superAdminEmail, newStatus);
    if (ok) {
      setRooms((prev) => prev.map((r) => (r.id === room.id ? { ...r, is_approved: newStatus } : r)));
      onUpdated();
    }
    setActingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-zinc-900 border border-purple-500/40 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Panel de Aprobación de Locales</h3>
              <p className="text-[10px] text-zinc-400 font-mono">SuperAdmin: {superAdminEmail}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto my-3 space-y-2.5 pr-1">
          {loading ? (
            <div className="text-center py-12 text-xs text-zinc-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-400" /> Cargando locales...
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12 text-xs text-zinc-500">No hay locales registrados aún.</div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-purple-300">{room.room_code}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                        room.is_approved ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                      }`}
                    >
                      {room.is_approved ? 'Aprobado' : 'Pendiente'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate mt-0.5">{room.business_name || room.name}</h4>
                  <p className="text-[10px] text-zinc-400 truncate">{room.owner_email || 'Sin cuenta Google asignada'}</p>
                </div>

                <button
                  type="button"
                  disabled={actingId === room.id}
                  onClick={() => handleToggle(room)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 flex items-center gap-1 transition-all active:scale-95 ${room.is_approved ? 'bg-rose-950/60 border border-rose-800/40 text-rose-300 hover:bg-rose-900/60' : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'}`}
                >
                  {room.is_approved ? <><Ban className="w-3.5 h-3.5" /> Suspender</> : <><CheckCircle className="w-3.5 h-3.5" /> Aprobar</>}
                </button>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-colors shrink-0"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
