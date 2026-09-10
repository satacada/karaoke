import { useState, useEffect, type FC } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatRentalRemaining } from '../../services/rentalService';
import type { RoomRentalSession } from '../../types';

interface TvRentalBadgeProps {
  rentalSession?: RoomRentalSession | null;
  className?: string;
}

export const TvRentalBadge: FC<TvRentalBadgeProps> = ({ rentalSession, className = '' }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!rentalSession?.enabled) return;
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [rentalSession?.enabled]);

  if (!rentalSession?.enabled) return null;

  const { text, isExpired, percentRemaining } = formatRentalRemaining(
    rentalSession.expiresAt,
    rentalSession.totalMinutes
  );

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border backdrop-blur-md shadow-lg select-none transition-all ${
        isExpired
          ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 animate-pulse'
          : 'bg-zinc-900/80 border-purple-500/40 text-purple-200'
      } ${className}`}
      title={`Alquiler de sala: ${rentalSession.totalMinutes} minutos`}
    >
      {isExpired ? (
        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0 animate-pulse" />
      )}
      <div className="flex flex-col text-left leading-none">
        <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">
          {isExpired ? 'Tiempo Finalizado' : 'Tiempo de Sala'}
        </span>
        <span className="text-xs font-mono font-black tracking-wide">
          {text}
        </span>
      </div>
      <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden shrink-0 ml-1">
        <div
          className={`h-full ${
            isExpired ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
          }`}
          style={{ width: `${percentRemaining}%` }}
        />
      </div>
    </div>
  );
};
