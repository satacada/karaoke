import type { FC } from 'react';
import { Disc3, Music2, Clock } from 'lucide-react';
import type { QueueItem } from '../../types';

interface TvNowPlayingHUDProps {
  song: QueueItem;
  currentTime: number;
  duration: number;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const TvNowPlayingHUD: FC<TvNowPlayingHUDProps> = ({
  song,
  currentTime,
  duration,
}) => {
  const effectiveDuration = duration > 0 ? duration : song.duration_seconds || 180;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100));

  // El título solo aparece los primeros 15 segundos y luego desaparece
  const isTitleVisible = currentTime <= 15;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-[clamp(0.75rem,2vw,1.5rem)] pt-3 pb-1.5 pointer-events-none select-none">
      <div className="max-w-7xl mx-auto flex flex-col gap-1">
        {/* Título a la izquierda y Tiempo a su derecha: Solo los primeros 15s */}
        <div
          className={`flex items-end justify-between gap-3 pr-36 sm:pr-44 min-w-0 transition-opacity duration-700 ease-in-out ${
            isTitleVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-white font-black text-[clamp(9px,0.7vw,11px)] shadow-md shrink-0 border border-black/80 ${
                song.requested_by.includes('Auto-DJ')
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600'
              }`}
            >
              <Disc3 className="w-3 h-3 animate-spin shrink-0" style={{ animationDuration: '4s' }} />
              <span className="truncate max-w-[120px] md:max-w-[180px]">
                {song.requested_by.includes('Auto-DJ') ? 'Auto-DJ' : song.requested_by}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-[clamp(0.9rem,1.3vw,1.35rem)] font-black text-white truncate drop-shadow-md flex items-center gap-1.5 leading-tight tv-text-outline">
                <Music2 className="w-3.5 h-3.5 text-pink-400 shrink-0 inline" />
                <span className="truncate">{song.title}</span>
              </h1>
              <p className="text-[clamp(10px,0.7vw,11px)] text-white/80 font-bold truncate tv-text-outline-sm">
                {song.author}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/70 border border-white/20 text-[clamp(10px,0.75vw,12px)] font-mono font-bold text-white tv-text-outline-sm shrink-0 shadow-md">
            <Clock className="w-3 h-3 text-pink-400" />
            <span>{formatTime(currentTime)}</span>
            <span className="text-zinc-400">/</span>
            <span>{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        {/* Barra horizontal de avance en la parte inferior extrema + Powered by DTC más chico */}
        <div className="flex items-center gap-2.5 pr-36 sm:pr-44">
          <div className="flex-1 bg-black/80 h-1.5 rounded-full overflow-hidden border border-white/20 shadow-md">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full transition-all duration-300 ease-linear shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="tracking-widest uppercase font-black text-white/50 text-[8px] tv-text-outline-sm shrink-0 whitespace-nowrap">
            Powered by DTC
          </span>
        </div>
      </div>
    </div>
  );
};
