import { useState, useEffect, type FC } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { LiveReaction } from '../../types';

interface FloatingItem extends LiveReaction {
  xOffset: number;
}

export const TvFloatingReactions: FC<{ roomCode: string }> = ({ roomCode }) => {
  const [items, setItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    const channel = supabase.channel(`room_reactions_${roomCode}`);

    channel
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        if (!payload?.emoji) return;
        const newItem: FloatingItem = {
          id: payload.id || crypto.randomUUID(),
          emoji: payload.emoji,
          guestName: payload.guestName || 'Invitado',
          createdAt: Date.now(),
          xOffset: Math.floor(Math.random() * 120) - 20, // variación horizontal sutil
        };

        setItems((prev) => [...prev.slice(-25), newItem]);

        // Auto remover después de 3.5 segundos
        setTimeout(() => {
          setItems((prev) => prev.filter((it) => it.id !== newItem.id));
        }, 3500);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  if (items.length === 0) return null;

  return (
    <div className="absolute inset-y-0 right-3 sm:right-6 z-40 w-44 pointer-events-none overflow-hidden select-none">
      {items.map((item) => (
        <div
          key={item.id}
          style={{ right: `${20 + item.xOffset}px` }}
          className="absolute bottom-20 flex flex-col items-center animate-float-reaction"
        >
          <span className="text-3xl sm:text-4xl drop-shadow-[0_4px_14px_rgba(0,0,0,0.9)] filter select-none">
            {item.emoji}
          </span>
          <span className="text-[10px] font-bold text-white/90 bg-black/75 px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-md -mt-1 shadow-lg truncate max-w-[120px]">
            {item.guestName}
          </span>
        </div>
      ))}
    </div>
  );
};
