import { useState, useEffect, useRef, type FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { WifiOff, Radio, Users } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface TvFloatingQrProps {
  roomCode: string;
  joinUrl: string;
  currentSongId?: string;
}

export const TvFloatingQr: FC<TvFloatingQrProps> = ({ roomCode, joinUrl, currentSongId }) => {
  const [counts, setCounts] = useState<{ [emoji: string]: number }>({ '👏': 0, '🔥': 0, '❤️': 0, '🍻': 0 });
  const usersRef = useRef<Map<string, Set<string>>>(new Map([
    ['👏', new Set()], ['🔥', new Set()], ['❤️', new Set()], ['🍻', new Set()],
  ]));

  useEffect(() => {
    usersRef.current.forEach((set) => set.clear());
    setCounts({ '👏': 0, '🔥': 0, '❤️': 0, '🍻': 0 });
  }, [currentSongId]);

  useEffect(() => {
    const channel = supabase.channel(`room_reactions_${roomCode}`);
    channel
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        const emoji = payload?.emoji;
        const userKey = payload?.userId || payload?.guestName;
        if (!emoji || !userKey || !usersRef.current.has(emoji)) return;

        const set = usersRef.current.get(emoji)!;
        if (!set.has(userKey)) {
          set.add(userKey);
          setCounts({
            '👏': usersRef.current.get('👏')?.size || 0,
            '🔥': usersRef.current.get('🔥')?.size || 0,
            '❤️': usersRef.current.get('❤️')?.size || 0,
            '🍻': usersRef.current.get('🍻')?.size || 0,
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomCode]);

  const totalUsers = new Set(Array.from(usersRef.current.values()).flatMap((s) => Array.from(s))).size;

  return (
    <div
      aria-label="Código QR para pedir canciones en la Rockola"
      className="w-full flex flex-col items-center bg-zinc-950/85 backdrop-blur-md border border-purple-500/40 shadow-2xl shadow-purple-950/50 rounded-2xl p-4 transition-all duration-300"
    >
      <header className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 uppercase tracking-widest mb-2">
        <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
        <span>Pide tu tema en la Rockola</span>
      </header>

      <div className="bg-white p-2.5 rounded-xl shadow-inner border-2 border-purple-400/30">
        <QRCodeSVG value={joinUrl} size={140} level="H" includeMargin={false} />
      </div>

      <div className="mt-2.5 text-center">
        <span className="text-[10px] font-medium text-zinc-400 block">Código de sala:</span>
        <strong className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 font-mono">
          {roomCode}
        </strong>
      </div>

      <footer className="mt-1.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] text-zinc-400 font-medium">
        <WifiOff className="w-3 h-3 text-amber-400 shrink-0" />
        <span>Usa tus datos 4G/5G</span>
      </footer>

      {/* Cuadro de Reacciones por Usuario Único */}
      <div className="mt-2.5 w-full pt-2 border-t border-zinc-800/80 flex flex-col gap-1 text-center">
        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-0.5">
          <span className="flex items-center gap-1 text-pink-400"><Users className="w-3 h-3" /> Personas</span>
          <span className="font-mono text-zinc-300 font-bold">{totalUsers}</span>
        </div>
        <div className="grid grid-cols-4 gap-1 mt-0.5">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg py-1 px-0.5 flex flex-col items-center">
            <span className="text-xs">👏</span>
            <span className="text-[11px] font-mono font-bold text-white">{counts['👏']}</span>
          </div>
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg py-1 px-0.5 flex flex-col items-center">
            <span className="text-xs">🔥</span>
            <span className="text-[11px] font-mono font-bold text-amber-400">{counts['🔥']}</span>
          </div>
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg py-1 px-0.5 flex flex-col items-center">
            <span className="text-xs">❤️</span>
            <span className="text-[11px] font-mono font-bold text-rose-400">{counts['❤️']}</span>
          </div>
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg py-1 px-0.5 flex flex-col items-center">
            <span className="text-xs">🍻</span>
            <span className="text-[11px] font-mono font-bold text-yellow-400">{counts['🍻']}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
