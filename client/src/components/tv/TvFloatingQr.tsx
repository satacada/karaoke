import { useState, useEffect, type FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { WifiOff, Monitor } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { getHostUrl } from '../../utils/appUrl';

interface TvFloatingQrProps {
  roomCode: string;
  joinUrl: string;
  hostUrl?: string;
  onSwitchToHost?: () => void;
  onOpenSettings?: () => void;
}

const REACTION_ICONS = ['👏', '🔥', '❤️', '🍻'] as const;

export const TvFloatingQr: FC<TvFloatingQrProps> = ({ roomCode, joinUrl, hostUrl, onSwitchToHost, onOpenSettings }) => {
  const [qrMode, setQrMode] = useState<'guest' | 'host'>('guest');
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({
    '👏': 0,
    '🔥': 0,
    '❤️': 0,
    '🍻': 0,
  });
  const activeUrl = qrMode === 'guest' ? joinUrl : (hostUrl || getHostUrl(roomCode));

  useEffect(() => {
    const ch = supabase.channel(`room_reactions_${roomCode}`)
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        if (!payload?.emoji) return;
        setReactionCounts((prev) => ({
          ...prev,
          [payload.emoji]: (prev[payload.emoji] || 0) + 1,
        }));
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [roomCode]);

  return (
    <div className="relative flex flex-col items-center gap-1.5 pointer-events-auto max-w-[160px] shrink-0">
      <div className="w-full flex items-center justify-around px-2 py-1 rounded-xl bg-zinc-950/90 border border-purple-500/40 shadow-lg backdrop-blur-md">
        {REACTION_ICONS.map((emoji) => (
          <div key={emoji} className="flex items-center gap-1">
            <span className="text-sm select-none">{emoji}</span>
            <span className="text-[11px] font-mono font-black text-white">{reactionCounts[emoji] || 0}</span>
          </div>
        ))}
      </div>
      <div aria-label="Código QR interactivo de Rockola" className="flex flex-col items-center bg-zinc-950/85 backdrop-blur-md border border-purple-500/40 shadow-xl rounded-2xl p-2 transition-all duration-300 w-full">
        <div className="flex items-center gap-1 w-full mb-1">
          <nav className="flex items-center gap-0.5 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 flex-1">
            <button type="button" onClick={(e) => { e.stopPropagation(); setQrMode('guest'); }} className={`flex-1 py-0.5 rounded text-[9px] font-black transition-all ${qrMode === 'guest' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'}`}>📱 Pedir</button>
            <button type="button" onClick={(e) => { e.stopPropagation(); setQrMode('host'); }} className={`flex-1 py-0.5 rounded text-[9px] font-black transition-all ${qrMode === 'host' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'}`}>🎧 DJ</button>
          </nav>
        </div>
        <div className="bg-white p-1 rounded-xl shadow-lg w-[115px] h-[115px] flex items-center justify-center shrink-0 border border-white">
          <QRCodeSVG value={activeUrl} className="w-full h-full" level="M" includeMargin={false} />
        </div>
        <div className="mt-1 text-center w-full">
          {onOpenSettings ? (
            <button type="button" onClick={onOpenSettings} title="Configuración y Diagnóstico" className="text-[10px] text-zinc-300 font-mono block leading-tight mx-auto hover:text-white transition-colors cursor-pointer">
              Sala: <b className="text-white font-black tracking-widest text-[11px] bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-700 hover:border-purple-500">{roomCode}</b>
            </button>
          ) : (
            <span className="text-[10px] text-zinc-300 font-mono block leading-tight">Sala: <b className="text-white font-black tracking-widest text-[11px] bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-700">{roomCode}</b></span>
          )}
        </div>
        {qrMode === 'guest' ? (
          <footer className="mt-1 flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-[8px] text-zinc-300 font-bold leading-none w-full">
            <WifiOff className="w-2.5 h-2.5 text-amber-400 shrink-0" /><span>Datos 4G/5G</span>
          </footer>
        ) : (
          onSwitchToHost && (
            <button type="button" onClick={onSwitchToHost} className="mt-1 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[clamp(8px,0.65vw,10px)] transition-all shadow-md cursor-pointer">
              <Monitor className="w-3 h-3" /><span>Abrir en TV</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};
