import { useState, useEffect, type FC } from 'react';
import { Tag, Sparkles, Clock } from 'lucide-react';
import type { PromoBanner } from '../../types';

interface TvPromoTickerProps {
  banners?: PromoBanner[];
  roomCode?: string;
}

const STYLES: Record<string, { bg: string; border: string; title: string; sub: string; badge: string; glow: string }> = {
  gold: {
    bg: 'from-amber-950/95 via-yellow-950/90 to-zinc-950/95', border: 'border-amber-400 text-amber-400',
    title: 'neon-text-gold', sub: 'text-amber-200/90', badge: 'bg-amber-400 text-zinc-950 shadow-[0_0_10px_#facc15]',
    glow: 'shadow-[0_0_25px_rgba(250,204,21,0.35)]',
  },
  emerald: {
    bg: 'from-emerald-950/95 via-teal-950/90 to-zinc-950/95', border: 'border-emerald-400 text-emerald-400',
    title: 'neon-text-emerald', sub: 'text-emerald-200/90', badge: 'bg-emerald-400 text-zinc-950 shadow-[0_0_10px_#4ade80]',
    glow: 'shadow-[0_0_25px_rgba(74,222,128,0.35)]',
  },
  purple: {
    bg: 'from-purple-950/95 via-indigo-950/90 to-zinc-950/95', border: 'border-purple-400 text-purple-400',
    title: 'neon-text-purple', sub: 'text-purple-200/90', badge: 'bg-purple-500 text-white shadow-[0_0_10px_#c084fc]',
    glow: 'shadow-[0_0_25px_rgba(192,132,252,0.35)]',
  },
  ruby: {
    bg: 'from-rose-950/95 via-red-950/90 to-zinc-950/95', border: 'border-rose-400 text-rose-400',
    title: 'neon-text-ruby', sub: 'text-rose-200/90', badge: 'bg-rose-500 text-white shadow-[0_0_10px_#fb7185]',
    glow: 'shadow-[0_0_25px_rgba(251,113,133,0.35)]',
  },
};

export const TvPromoTicker: FC<TvPromoTickerProps> = ({ banners = [], roomCode = 'FIESTA' }) => {
  const [localBanners, setLocalBanners] = useState<PromoBanner[]>(banners);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (banners.length > 0) {
      setLocalBanners(banners);
    } else {
      const saved = localStorage.getItem(`tv_banners_${roomCode}`);
      if (saved) { try { setLocalBanners(JSON.parse(saved)); } catch {} }
    }
  }, [banners, roomCode]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeBanners = localBanners.filter((b) => b.is_active && (!b.expires_at || b.expires_at > now));

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (activeBanners.length === 0) return;
    let timer: ReturnType<typeof setTimeout>;
    if (isVisible) {
      timer = setTimeout(() => {
        setIsVisible(false);
      }, 14000);
    } else {
      timer = setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % activeBanners.length);
        setIsVisible(true);
      }, 46000);
    }
    return () => clearTimeout(timer);
  }, [isVisible, activeBanners.length]);

  if (activeBanners.length === 0 || !isVisible) return null;

  const current = activeBanners[currentIdx % activeBanners.length];
  const s = STYLES[current.color] || STYLES.gold;
  const remSec = current.expires_at ? Math.max(0, Math.floor((current.expires_at - now) / 1000)) : null;
  const remText = remSec !== null ? (remSec >= 60 ? `${Math.ceil(remSec / 60)} min` : `${remSec}s`) : null;

  return (
    <div className="w-full animate-in fade-in slide-in-from-top-3 duration-500 pointer-events-auto">
      <div className={`relative bg-gradient-to-br ${s.bg} border-2 ${s.border} rounded-2xl p-3 ${s.glow} backdrop-blur-xl flex flex-col gap-1 text-left overflow-hidden transition-all duration-300`}>
        <div className="flex items-center justify-between gap-1">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${s.badge}`}>
            <Tag className="w-3 h-3" /><span>PROMO LOCAL</span>
          </span>
          {remText ? (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 border border-white/20 text-[10px] font-mono font-bold text-amber-300 animate-pulse">
              <Clock className="w-2.5 h-2.5" /> {remText}
            </span>
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
          )}
        </div>
        <h4 className={`font-black text-xs leading-snug line-clamp-2 mt-0.5 uppercase tracking-wide animate-neon-tube ${s.title}`}>
          {current.title}
        </h4>
        {current.subtitle && (
          <p className={`text-[11px] font-semibold ${s.sub} leading-tight line-clamp-2`}>{current.subtitle}</p>
        )}
      </div>
    </div>
  );
};
