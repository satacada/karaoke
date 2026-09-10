import type { FC } from 'react';
import { Tag } from 'lucide-react';
import type { PromoBanner } from '../../types';

interface TvIdlePromoCardProps {
  promo: PromoBanner | null;
  now: number;
}

export const TvIdlePromoCard: FC<TvIdlePromoCardProps> = ({ promo, now }) => {
  if (!promo) return null;
  return (
    <div className="w-full mt-2 bg-gradient-to-br from-amber-950/90 via-zinc-950/90 to-zinc-950/90 border-2 border-amber-400 rounded-xl p-2.5 text-left animate-in fade-in shadow-[0_0_20px_rgba(250,204,21,0.3)]">
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
          <Tag className="w-3 h-3" /> Promo del Local
        </span>
        {promo.expires_at && (
          <span className="text-[9px] font-mono font-bold text-amber-300 bg-black/70 px-1.5 py-0.5 rounded border border-amber-400/40 animate-pulse">
            ⏳ {Math.max(1, Math.ceil((promo.expires_at - now) / 60000))} min
          </span>
        )}
      </div>
      <p className="text-xs font-black uppercase tracking-wide truncate animate-neon-tube neon-text-gold">{promo.title}</p>
      <p className="text-[11px] text-amber-200/90 truncate">{promo.subtitle}</p>
    </div>
  );
};
