import { useState, useEffect, type FC } from 'react';
import { X, Clock, Plus, StopCircle, Play } from 'lucide-react';
import { getLocalRentalSession, saveRoomRental, formatRentalRemaining } from '../../services/rentalService';
import type { RoomRentalSession } from '../../types';

interface HostRentalModalProps {
  isOpen: boolean;
  roomId: string;
  roomCode: string;
  roomName: string;
  onClose: () => void;
  onSessionUpdated?: (session: RoomRentalSession | null) => void;
}

export const HostRentalModal: FC<HostRentalModalProps> = ({
  isOpen, roomId, roomCode, roomName, onClose, onSessionUpdated,
}) => {
  const [session, setSession] = useState<RoomRentalSession | null>(() => getLocalRentalSession(roomCode));
  const [, setTick] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setSession(getLocalRentalSession(roomCode));
  }, [isOpen, roomCode]);

  useEffect(() => {
    if (!session?.enabled) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [session?.enabled]);

  if (!isOpen) return null;

  const handleStartRental = async (minutes: number) => {
    setIsSaving(true);
    const now = Date.now();
    const newSession: RoomRentalSession = {
      enabled: true,
      totalMinutes: minutes,
      startedAt: now,
      expiresAt: now + minutes * 60 * 1000,
    };
    await saveRoomRental(roomId, roomCode, newSession);
    setSession(newSession);
    onSessionUpdated?.(newSession);
    setIsSaving(false);
  };

  const handleExtendTime = async (extraMinutes: number) => {
    if (!session) return;
    setIsSaving(true);
    const newExpires = Math.max(Date.now(), session.expiresAt) + extraMinutes * 60 * 1000;
    const newTotal = session.totalMinutes + extraMinutes;
    const updated: RoomRentalSession = { ...session, totalMinutes: newTotal, expiresAt: newExpires };
    await saveRoomRental(roomId, roomCode, updated);
    setSession(updated);
    onSessionUpdated?.(updated);
    setIsSaving(false);
  };

  const handleEndRental = async () => {
    setIsSaving(true);
    await saveRoomRental(roomId, roomCode, null);
    setSession(null);
    onSessionUpdated?.(null);
    setIsSaving(false);
    onClose();
  };

  const rentalInfo = session?.enabled ? formatRentalRemaining(session.expiresAt, session.totalMinutes) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center"><Clock className="w-4 h-4" /></div>
            <div><h3 className="text-sm font-bold text-white">Tiempo de Sala</h3><p className="text-[10px] text-zinc-400">{roomName} ({roomCode})</p></div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        {session?.enabled && rentalInfo ? (
          <div className="space-y-3">
            <div className="p-3 bg-zinc-950 rounded-2xl border border-purple-500/30 text-center">
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block mb-1">Tiempo Restante de Alquiler</span>
              <span className={`text-3xl font-mono font-black ${rentalInfo.isExpired ? 'text-rose-400 animate-pulse' : 'text-purple-300'}`}>{rentalInfo.text}</span>
              <p className="text-[10px] text-zinc-400 mt-1">Total contratado: {session.totalMinutes} min ({Math.round(session.totalMinutes / 60)}h)</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Extender Tiempo:</label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 60].map((m) => (
                  <button key={m} type="button" disabled={isSaving} onClick={() => handleExtendTime(m)} className="py-2 px-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1"><Plus className="w-3 h-3 text-pink-400" />+{m}m</button>
                ))}
              </div>
            </div>
            <button type="button" disabled={isSaving} onClick={handleEndRental} className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center justify-center gap-1.5"><StopCircle className="w-4 h-4" />Finalizar / Liberar Sala</button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-zinc-300">Selecciona el tiempo contratado por los clientes para esta sala:</p>
            <div className="grid grid-cols-2 gap-2">
              {[{ m: 30, l: '30 min' }, { m: 60, l: '1 hora' }, { m: 120, l: '2 horas (KTV)' }, { m: 180, l: '3 horas' }].map((p) => (
                <button key={p.m} type="button" disabled={isSaving} onClick={() => handleStartRental(p.m)} className={`py-3 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${p.m === 120 ? 'bg-purple-600/30 border-purple-500 text-white shadow-md' : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'}`}>
                  <Play className="w-3.5 h-3.5 text-pink-400" /><span>{p.l}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
