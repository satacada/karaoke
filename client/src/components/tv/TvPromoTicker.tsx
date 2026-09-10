import { useState, useEffect, type FC } from 'react';
import { Tag, Sparkles } from 'lucide-react';
import type { PromoBanner } from '../../types';

interface TvPromoTickerProps {
  banners?: PromoBanner[];
  roomCode?: string;
}

const COLOR_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  gold: { bg: 'from-amber-950/90 to-yellow-950/90', border: 'border-amber-400/60', text: 'text-amber-200', badge: 'bg-amber-500 text-zinc-950' },
  emerald: { bg: 'from-emerald-950/90 to-teal-950/90', border: 'border-emerald-400/60', text: 'text-emerald-200', badge: 'bg-emerald-500 text-zinc-950' },
  purple: { bg: 'from-purple-950/90 to-indigo-950/90', border: 'border-purple-400/60', text: 'text-purple-200', badge: 'bg-purple-500 text-white' },
  ruby: { bg: 'from-rose-950/90 to-red-950/90', border: 'border-rose-400/60', text: 'text-rose-200', badge: 'bg-rose-500 text-white' },
};

export const TvPromoTicker: FC<TvPromoTickerProps> = ({ banners = [], roomCode = 'FIESTA' }) => {
  const [localBanners, setLocalBanners] = useState<PromoBanner[]>(banners);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (banners.length > 0) {
      setLocalBanners(banners);
    } else {
      const saved = localStorage.getItem(`tv_banners_${roomCode}`);
      if (saved) {
        try { setLocalBanners(JSON.parse(saved)); } catch {}
      }
    }
  }, [banners, roomCode]);

  const activeBanners = localBanners.filter((b) => b.is_active);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % activeBanners.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const current = activeBanners[currentIdx % activeBanners.length];
  const style = COLOR_STYLES[current.color] || COLOR_STYLES.gold;

  return (
    <div className="w-full animate-in fade-in slide-in-from-top-3 duration-500 pointer-events-auto">
      <div className={`bg-gradient-to-r ${style.bg} border-2 ${style.border} rounded-2xl p-3 shadow-2xl backdrop-blur-md flex flex-col gap-1 text-left`}>
        <div className="flex items-center justify-between gap-1">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${style.badge}`}>
            <Tag className="w-3 h-3" /><span>PROMO</span>
          </span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
        </div>
        <h4 className="font-bold text-white text-xs leading-tight line-clamp-2 mt-0.5">{current.title}</h4>
        {current.subtitle && (
          <p className={`text-[11px] ${style.text} leading-tight line-clamp-2`}>{current.subtitle}</p>
        )}
      </div>
    </div>
  );
};
