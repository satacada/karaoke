import type { FC } from 'react';
import { RotateCcw, Users, Settings, Crown, ShieldCheck, Megaphone, Lock, LockOpen, SlidersHorizontal } from 'lucide-react';

interface HostHeaderProps {
  roomCode: string;
  zoneName?: string;
  isOwner?: boolean;
  isSuperAdmin?: boolean;
  isQueueLocked?: boolean;
  onOpenGuests: () => void;
  onOpenReset: () => void;
  onOpenSettings: () => void;
  onOpenSuperAdmin?: () => void;
  onOpenBanners?: () => void;
  onToggleQueueLock?: () => void;
  onOpenMasterHub?: () => void;
}

export const HostHeader: FC<HostHeaderProps> = ({
  roomCode,
  zoneName,
  isOwner,
  isSuperAdmin,
  isQueueLocked,
  onOpenGuests,
  onOpenReset,
  onOpenSettings,
  onOpenSuperAdmin,
  onOpenBanners,
  onToggleQueueLock,
  onOpenMasterHub,
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
        <h1 className="text-lg font-black text-white font-mono flex items-center gap-1.5">
          <span>{roomCode}</span>
          {zoneName && <span className="text-xs font-medium text-purple-300 font-sans tracking-normal truncate max-w-[120px]">({zoneName})</span>}
        </h1>
      </div>
      <div className="flex gap-1.5">
        {onOpenMasterHub && (
          <button
            onClick={onOpenMasterHub}
            className="p-2 rounded-xl bg-purple-950/80 border border-purple-600/50 text-purple-300 active:scale-95 transition-transform hover:text-white"
            title="Master Hub (Ambientes)"
            aria-label="Panel Multi-Ambientes"
          >
            <SlidersHorizontal className="w-4 h-4 text-purple-300" />
          </button>
        )}
        {onToggleQueueLock && (
          <button
            onClick={onToggleQueueLock}
            className={`p-2 rounded-xl border transition-transform active:scale-95 ${
              isQueueLocked
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-lg shadow-amber-500/10'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title={isQueueLocked ? 'Fila bloqueada (Última Ronda)' : 'Bloquear pedidos (Última Ronda)'}
            aria-label="Bloqueo de Pedidos Última Ronda"
          >
            {isQueueLocked ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
          </button>
        )}
        {isSuperAdmin && onOpenSuperAdmin && (
          <button
            onClick={onOpenSuperAdmin}
            className="p-2 rounded-xl bg-purple-950/80 border border-purple-600/50 text-purple-300 active:scale-95 transition-transform hover:text-white"
            title="Aprobación de Locales (SuperAdmin)"
            aria-label="Panel SuperAdmin"
          >
            <ShieldCheck className="w-4 h-4 text-purple-300" />
          </button>
        )}
        {onOpenBanners && (
          <button
            onClick={onOpenBanners}
            className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 active:scale-95 transition-transform hover:text-white"
            title="Banners y Promos TV"
            aria-label="Promociones en Pantalla TV"
          >
            <Megaphone className="w-4 h-4 text-amber-400" />
          </button>
        )}
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
