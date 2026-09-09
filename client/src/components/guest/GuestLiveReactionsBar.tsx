import { useState, useRef, type FC } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface GuestLiveReactionsBarProps {
  roomCode: string;
  guestName: string;
}

const REACTIONS = [
  { emoji: '👏', label: 'Aplausos' },
  { emoji: '🔥', label: 'Fuego' },
  { emoji: '❤️', label: 'Amor' },
  { emoji: '🍻', label: 'Salud' },
] as const;

export const GuestLiveReactionsBar: FC<GuestLiveReactionsBarProps> = ({ roomCode, guestName }) => {
  const [activeEmoji, setActiveEmoji] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  if (!channelRef.current) {
    channelRef.current = supabase.channel(`room_reactions_${roomCode}`);
    channelRef.current.subscribe();
  }

  const handleSendReaction = (emoji: '👏' | '🔥' | '❤️' | '🍻') => {
    setActiveEmoji(emoji);
    setTimeout(() => setActiveEmoji(null), 300);

    channelRef.current?.send({
      type: 'broadcast',
      event: 'reaction',
      payload: {
        id: crypto.randomUUID(),
        emoji,
        guestName: guestName.slice(0, 15),
      },
    });
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 border border-zinc-800/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2 select-none">
      <span className="text-[10px] uppercase font-bold text-zinc-400 pl-1 hidden xs:inline">Reaccionar:</span>
      {REACTIONS.map(({ emoji, label }) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleSendReaction(emoji)}
          title={label}
          className={`text-xl p-1.5 rounded-full hover:bg-zinc-800 active:scale-125 transition-transform ${
            activeEmoji === emoji ? 'scale-125 bg-purple-500/30' : ''
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
