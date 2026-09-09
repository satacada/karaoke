import type { FC } from 'react';
import { Clock, ShieldAlert, LogOut, Radio } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface HostPendingApprovalViewProps {
  roomCode: string;
  businessName: string;
  ownerEmail: string;
  onLoggedOut: () => void;
}

export const HostPendingApprovalView: FC<HostPendingApprovalViewProps> = ({
  roomCode,
  businessName,
  ownerEmail,
  onLoggedOut,
}) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem(`host_auth_${roomCode}`);
    onLoggedOut();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 select-none">
      <div className="w-full max-w-sm bg-zinc-900/90 border border-amber-500/30 rounded-3xl p-6 shadow-2xl shadow-amber-950/40 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400 animate-pulse">
          <Clock className="w-8 h-8" />
        </div>

        <h2 className="text-lg font-black text-white mb-1">Acceso Pendiente de Aprobación</h2>
        <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
          Tu local ha sido registrado pero debe recibir la <span className="text-amber-300 font-semibold">aprobación del Administrador General</span> antes de poder usarse.
        </p>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-left space-y-2 mb-5">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Establecimiento</span>
            <span className="text-xs font-bold text-white truncate block">{businessName || 'Mi Rockola'}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Código de Sala</span>
            <span className="text-sm font-mono font-bold text-purple-400 tracking-wider block">{roomCode}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Dueño (Google)</span>
            <span className="text-xs font-mono text-zinc-300 truncate block">{ownerEmail}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-amber-400/90 bg-amber-950/40 border border-amber-800/40 py-2 px-3 rounded-xl mb-5">
          <Radio className="w-3.5 h-3.5 animate-ping text-amber-400 shrink-0" />
          <span>Esperando activación... Se desbloqueará en vivo</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 justify-center mb-6">
          <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
          <span>Comunícate con el administrador para autorizar tu sala</span>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};
