import type { FC } from 'react';
import { RotateCcw, Users, Settings, Crown } from 'lucide-react';

interface HostHeaderProps {
  roomCode: string;
  isOwner?: boolean;
  onOpenGuests: () => void;
  onOpenReset: () => void;
  onOpenSettings: () => void;
}

export const HostHeader: FC<HostHeaderProps> = ({
  roomCode,
  isOwner,
  onOpenGuests,
  onOpenReset,
  onOpenSettings,
}) => {
  return (
    <header className="flex items-center justify-between py-2 border-b border-zinc-800 mb-4">
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider">Consola DJ</span>
          {isOwner && (
            <span className="inline-flex items-center gap-0.5 text-[9px] bg-purple-900/60 text-purple-300 border border-purple-700/50 px-1.5 py-0.2 rounded-full font-bold">
              <Crown className="w-2.5 h-2.5 text-amber-400" /> Dueño
            </span>
          )}
        </div>
        <h1 className="text-lg font-black text-white font-mono">{roomCode}</h1>
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 active:scale-95 transition-transform hover:text-white"
          aria-label="Configuración de la Rockola"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenGuests}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 active:scale-95 transition-transform hover:text-white"
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
