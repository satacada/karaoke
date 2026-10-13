import { useState, useEffect, type FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { WifiOff, Monitor, Heart, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { getHostUrl } from '../../utils/appUrl';

interface TvFloatingQrProps {
  roomCode: string; joinUrl: string; hostUrl?: string; currentSongId?: string;
  dedication?: { text: string; sender: string } | null;
  onSwitchToHost?: () => void;
  onOpenSettings?: () => void;
}

export const TvFloatingQr: FC<TvFloatingQrProps> = ({ roomCode, joinUrl, hostUrl, dedication, onSwitchToHost, onOpenSettings }) => {
  const [qrMode, setQrMode] = useState<'guest' | 'host'>('guest');
  const [reactions, setReactions] = useState<{ id: string; emoji: string; guestName: string; x: number }[]>([]);
  const activeUrl = qrMode === 'guest' ? joinUrl : (hostUrl || getHostUrl(roomCode));

  useEffect(() => {
    const ch = supabase.channel(`room_reactions_${roomCode}`)
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        if (!payload?.emoji) return;
        const item = { id: payload.id || crypto.randomUUID(), emoji: payload.emoji, guestName: payload.guestName || 'Invitado', x: Math.floor(Math.random() * 80) - 40 };
        setReactions((prev) => [...prev.slice(-15), item]);
        setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== item.id)), 3500);
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [roomCode]);

  return (
    <div className="relative flex flex-col items-center gap-1.5 pointer-events-auto max-w-[160px] shrink-0">
      {reactions.length > 0 && (
        <div className="absolute -top-36 left-0 right-0 h-36 pointer-events-none overflow-visible z-50">
          {reactions.map((r) => (
            <div key={r.id} style={{ transform: `translateX(${r.x}px)` }} className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center animate-float-reaction">
              <span className="text-4xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] select-none">{r.emoji}</span>
              <span className="text-[9px] font-bold text-white bg-black/80 px-1.5 py-0.5 rounded-full border border-white/20 backdrop-blur-md -mt-1 shadow-md truncate max-w-[100px]">{r.guestName}</span>
            </div>
          ))}
        </div>
      )}
      {dedication && (
        <div className="w-full bg-gradient-to-br from-pink-950/95 via-purple-950/95 to-zinc-950/95 border-2 border-pink-500/80 rounded-2xl p-2.5 shadow-[0_0_20px_rgba(236,72,153,0.4)] backdrop-blur-xl flex flex-col gap-1 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between gap-1">
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1 bg-pink-500 text-white shadow-xs">
              <Heart className="w-2.5 h-2.5 fill-white" /><span>DEDICATORIA</span>
            </span>
            <span className="flex items-center gap-0.5 text-[9px] font-bold text-pink-300 truncate max-w-[75px]">
              <Sparkles className="w-2 h-2 text-amber-300 shrink-0" /><span className="truncate">{dedication.sender}</span>
            </span>
          </div>
          <p className="text-[11px] font-bold text-white leading-tight line-clamp-3 italic tv-text-outline-sm">&quot;{dedication.text}&quot;</p>
        </div>
      )}
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
