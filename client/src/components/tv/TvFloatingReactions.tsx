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
    <div className="fixed bottom-12 right-6 z-40 w-40 h-[70vh] pointer-events-none overflow-hidden select-none">
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            transform: `translateX(${item.xOffset}px)`,
          }}
          className="absolute bottom-0 right-8 flex flex-col items-center animate-float-reaction"
        >
          <span className="text-3xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] filter transition-transform">
            {item.emoji}
          </span>
          <span className="text-[9px] font-bold text-white/80 bg-black/60 px-1.5 py-0.2 rounded-full border border-white/10 backdrop-blur-sm -mt-1">
            {item.guestName}
          </span>
        </div>
      ))}
    </div>
  );
};
