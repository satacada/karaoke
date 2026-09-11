import { useState, useEffect, type FC } from 'react';
import { Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface TvLiveReactionsZoneProps {
  roomCode: string;
}

const REACTION_LIST = ['👏', '🔥', '❤️', '🍻'];

export const TvLiveReactionsZone: FC<TvLiveReactionsZoneProps> = ({ roomCode }) => {
  const [latestReaction, setLatestReaction] = useState<{ emoji: string; guest: string } | null>(null);
  const [activePulse, setActivePulse] = useState<string | null>(null);

  useEffect(() => {
    const channel = supabase.channel(`room_reactions_zone_${roomCode}`);
    channel
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        if (!payload?.emoji) return;
        setLatestReaction({ emoji: payload.emoji, guest: payload.guestName || 'Invitado' });
        setActivePulse(payload.emoji);
        setTimeout(() => setActivePulse(null), 1200);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  return (
    <div
      aria-label="Reacciones en vivo de invitados"
      className="w-full flex flex-col items-center bg-black/40 backdrop-blur-sm border border-purple-500/20 shadow-md rounded-xl p-1 pointer-events-auto transition-all duration-300"
    >
      <div className="flex items-center gap-1 text-[clamp(7px,0.55vw,9px)] text-purple-300 font-bold uppercase tracking-wider mb-0.5">
        <Sparkles className="w-2 h-2 text-amber-400 animate-pulse" />
        <span>Reacciones</span>
      </div>

      <div className="flex items-center justify-center gap-1 px-1 py-0.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 w-full">
        {REACTION_LIST.map((emoji) => (
          <span
            key={emoji}
            className={`text-[clamp(11px,0.9vw,14px)] transition-transform duration-200 select-none ${
              activePulse === emoji ? 'scale-125 filter brightness-125' : 'opacity-85'
            }`}
          >
            {emoji}
          </span>
        ))}
      </div>

      {latestReaction && (
        <div className="mt-0.5 text-[clamp(7px,0.55vw,9px)] text-zinc-300 truncate max-w-full font-semibold animate-fade-in text-center">
          <span className="text-pink-400 font-bold">{latestReaction.guest}:</span> {latestReaction.emoji}
        </div>
      )}
    </div>
  );
};
