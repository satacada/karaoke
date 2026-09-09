import { useState, useEffect, type FC } from 'react';
import { Tag, Sparkles } from 'lucide-react';
import type { PromoBanner } from '../../types';

interface TvPromoTickerProps {
  banners?: PromoBanner[];
}

const COLOR_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  gold: { bg: 'from-amber-950/90 to-yellow-950/90', border: 'border-amber-400/60', text: 'text-amber-200', badge: 'bg-amber-500 text-zinc-950' },
  emerald: { bg: 'from-emerald-950/90 to-teal-950/90', border: 'border-emerald-400/60', text: 'text-emerald-200', badge: 'bg-emerald-500 text-zinc-950' },
  purple: { bg: 'from-purple-950/90 to-indigo-950/90', border: 'border-purple-400/60', text: 'text-purple-200', badge: 'bg-purple-500 text-white' },
  ruby: { bg: 'from-rose-950/90 to-red-950/90', border: 'border-rose-400/60', text: 'text-rose-200', badge: 'bg-rose-500 text-white' },
};

export const TvPromoTicker: FC<TvPromoTickerProps> = ({ banners = [] }) => {
  const activeBanners = banners.filter((b) => b.is_active);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (activeBanners.length === 0) {
      setIsVisible(false);
      return;
    }

    // Mostrar durante 10 segundos, pausar 65 segundos
    const cycle = () => {
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
        setCurrentIdx((prev) => (prev + 1) % activeBanners.length);
      }, 10000);
    };

    const interval = setInterval(cycle, 75000);
    // Mostrar por primera vez a los 5 segundos
    const initialTimer = setTimeout(cycle, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, [activeBanners.length]);

  if (!isVisible || activeBanners.length === 0) return null;

  const current = activeBanners[currentIdx % activeBanners.length];
  const style = COLOR_STYLES[current.color] || COLOR_STYLES.gold;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[90%] animate-in fade-in slide-in-from-top-6 duration-700 pointer-events-none">
      <div className={`bg-gradient-to-r ${style.bg} border-2 ${style.border} rounded-2xl px-4 py-2.5 shadow-2xl backdrop-blur-md flex items-center gap-3`}>
        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1 ${style.badge}`}>
          <Tag className="w-3 h-3" /><span>PROMO</span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-bold text-white text-sm truncate">
            <span>{current.title}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          </div>
          <p className={`text-xs ${style.text} truncate`}>{current.subtitle}</p>
        </div>
      </div>
    </div>
  );
};
