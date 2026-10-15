import type { FC } from 'react';
import { Disc3, Music2, Clock, Play } from 'lucide-react';
import type { QueueItem } from '../../types';
import { isTvHudIntervalActive } from '../../utils/tvPlaybackInterval';

interface TvNowPlayingHUDProps {
  song: QueueItem;
  currentTime: number;
  duration: number;
  isPaused?: boolean;
  onTogglePlayPause?: () => void;
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
  isPaused = false,
  onTogglePlayPause,
}) => {
  const effectiveDuration = duration > 0 ? duration : song.duration_seconds || 180;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100));
  const isVisible = isTvHudIntervalActive(currentTime, duration, isPaused);

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-30 px-[clamp(0.75rem,2vw,1.5rem)] pt-3 pb-1.5 pointer-events-none select-none transition-all duration-700 ease-in-out ${
        isVisible ? 'bg-gradient-to-t from-black/90 via-black/40 to-transparent' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-1">
        {/* Título de la canción actual: sincronizado con el intervalo no invasivo */}
        <div
          className={`flex items-end justify-between gap-3 pr-36 sm:pr-44 min-w-0 transition-opacity duration-700 ease-in-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
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

        {/* Barra horizontal de avance: Seleccionable e interactiva con el control remoto */}
        <div className="flex items-center gap-2.5 pr-36 sm:pr-44">
          <button
            id="tv-timeline-bar"
            type="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onTogglePlayPause?.(); }}
            onKeyDown={(e) => {
              if (['Enter', ' ', 'MediaPlayPause', 'MediaPlay', 'MediaPause'].includes(e.key) || e.keyCode === 179) {
                e.preventDefault(); e.stopPropagation(); onTogglePlayPause?.();
              } else if (e.key === 'ArrowUp') {
                e.preventDefault(); document.getElementById('tv-gear-btn')?.focus();
              }
            }}
            title={isPaused ? 'Línea de tiempo pausada - Presiona OK para reproducir' : 'Línea de tiempo activa - Presiona OK para pausar'}
            className="flex-1 group/bar relative py-1 focus:outline-none pointer-events-auto cursor-pointer"
          >
            <div
              className={`w-full bg-black/80 h-2 group-focus/bar:h-3 rounded-full overflow-hidden border border-white/20 group-focus/bar:border-pink-400 group-focus/bar:ring-4 group-focus/bar:ring-pink-500/80 shadow-md transition-all ${
                isVisible ? 'opacity-100' : 'opacity-40 hover:opacity-100 group-focus/bar:opacity-100'
              }`}
            >
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full transition-all duration-300 ease-linear shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {isPaused && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/95 text-zinc-950 text-[11px] font-black shadow-2xl border border-white/40 animate-pulse">
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PAUSADO (OK: Reanudar)</span>
              </div>
            )}
          </button>
          <span className="font-semibold text-white/20 text-[8px] tracking-wide tv-text-outline-sm shrink-0 whitespace-nowrap select-none">
            Powered by DT
          </span>
        </div>
      </div>
    </div>
  );
};
