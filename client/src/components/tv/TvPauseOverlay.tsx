import { useState, useEffect, type FC } from 'react';
import { Pause, Play, Clock, Timer, AlertCircle } from 'lucide-react';
import { formatRentalRemaining } from '../../services/rentalService';
import type { RoomRentalSession } from '../../types';

interface TvPauseOverlayProps {
  isPaused: boolean;
  rentalSession?: RoomRentalSession | null;
  onPlay?: () => void;
}

function formatStopwatch(seconds: number): string {
  const mins = Math.floor(seconds / 60); const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60); const remMins = mins % 60;
    return `${hours}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const TvPauseOverlay: FC<TvPauseOverlayProps> = ({ isPaused, rentalSession, onPlay }) => {
  const [pauseDuration, setPauseDuration] = useState(0); const [, setTick] = useState(0);

  useEffect(() => {
    if (!isPaused) { setPauseDuration(0); return; }
    const start = Date.now(); setPauseDuration(0);
    const interval = setInterval(() => setPauseDuration(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (!rentalSession?.enabled) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [rentalSession?.enabled]);

  if (!isPaused) return null;
  const rentalInfo = rentalSession?.enabled ? formatRentalRemaining(rentalSession.expiresAt, rentalSession.totalMinutes) : null;

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm pointer-events-none animate-in fade-in duration-200 p-6 select-none">
      <div className="max-w-md w-full bg-zinc-900/95 border border-purple-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-3.5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center shadow-lg shadow-pink-500/20">
          <Pause className="w-7 h-7 text-pink-400 fill-pink-400 animate-pulse" />
        </div>

        <div>
          <h2 className="text-2xl font-black uppercase text-white tracking-wide">Música en Pausa</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Control de puntero en pantalla o botón OK / Pausa del mando</p>
        </div>

        {onPlay && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 border border-emerald-400/50 cursor-pointer pointer-events-auto transition-all active:scale-95"
            title="Continuar música (Click con puntero o toque)"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>▶ Continuar Música</span>
          </button>
        )}

        <div className="w-full py-2 px-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Timer className="w-4 h-4 text-pink-400" /> Tiempo en Pausa:
          </span>
          <span className="text-base font-mono font-black text-pink-400 tracking-wider">{formatStopwatch(pauseDuration)}</span>
        </div>

        {rentalInfo && (
          <div className={`w-full p-3 rounded-2xl border flex flex-col gap-1.5 text-left ${rentalInfo.isExpired ? 'bg-rose-950/40 border-rose-500/50' : 'bg-purple-950/30 border-purple-500/40'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Clock className={`w-3.5 h-3.5 ${rentalInfo.isExpired ? 'text-rose-400' : 'text-purple-400'}`} />
                {rentalInfo.isExpired ? 'Tiempo de Sala Vencido' : 'Tiempo de Sala Restante'}
              </span>
              <span className={`text-sm font-mono font-black ${rentalInfo.isExpired ? 'text-rose-400' : 'text-purple-300'}`}>{rentalInfo.text}</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-1000 ${rentalInfo.isExpired ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`} style={{ width: `${rentalInfo.percentRemaining}%` }} />
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-400">
              <span>Alquiler total: {rentalSession?.totalMinutes} min ({Math.round((rentalSession?.totalMinutes || 0) / 60)}h)</span>
              {rentalInfo.isExpired && (<span className="text-rose-400 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Avisa al mozo</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
