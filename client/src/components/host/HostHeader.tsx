import type { FC } from 'react';
import { RotateCcw, Users } from 'lucide-react';

interface HostHeaderProps {
  roomCode: string;
  onOpenGuests: () => void;
  onOpenReset: () => void;
}

export const HostHeader: FC<HostHeaderProps> = ({ roomCode, onOpenGuests, onOpenReset }) => {
  return (
    <header className="flex items-center justify-between py-2 border-b border-zinc-800 mb-4">
      <div>
        <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider">Consola DJ</span>
        <h1 className="text-lg font-black text-white font-mono">{roomCode}</h1>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onOpenGuests}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 active:scale-95 transition-transform"
          aria-label="Gestionar invitados"
        >
          <Users className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenReset}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 border border-rose-500/30 text-xs font-semibold active:scale-95 transition-transform"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reiniciar</span>
        </button>
      </div>
    </header>
  );
};
