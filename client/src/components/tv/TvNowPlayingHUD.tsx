import type { FC } from 'react';
import { Disc3, Music2, Clock, Pause, Play } from 'lucide-react';
import type { QueueItem } from '../../types';

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

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent px-[clamp(0.75rem,2.5vw,2rem)] py-[clamp(0.35rem,1vh,0.75rem)] pt-[clamp(1.5rem,3.5vh,2.5rem)]">
      <div className="max-w-6xl mx-auto flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-white font-bold text-[clamp(10px,0.8vw,13px)] shadow-md shrink-0 ${song.requested_by.includes('Auto-DJ') ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 shadow-purple-500/20' : 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 shadow-pink-500/20 animate-pulse-glow'}`}>
              <Disc3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin shrink-0" style={{ animationDuration: '4s' }} />
              <span className="truncate max-w-[140px] md:max-w-[200px]">{song.requested_by.includes('Auto-DJ') ? 'Auto-DJ' : `Pidió: ${song.requested_by}`}</span>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-[clamp(0.8rem,1.3vw,1.35rem)] font-bold text-white truncate drop-shadow-sm flex items-center gap-1.5 leading-tight">
                <Music2 className="w-3.5 h-3.5 text-purple-400 shrink-0 inline" />
                <span className="truncate">{song.title}</span>
              </h1>
              <p className="text-[clamp(10px,0.75vw,12px)] text-zinc-400 font-medium truncate">{song.author}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onTogglePlayPause && (
              <button
                type="button"
                onClick={onTogglePlayPause}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-xl font-bold text-[clamp(9px,0.7vw,11px)] uppercase tracking-wider transition-all shadow-md border cursor-pointer select-none pointer-events-auto active:scale-95 ${
                  isPaused
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400 text-white shadow-emerald-950/40 hover:brightness-110 animate-pulse'
                    : 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 border-pink-400/50 text-white shadow-purple-950/40 hover:brightness-110'
                }`}
                title={isPaused ? 'Continuar música' : 'Pausar música'}
              >
                {isPaused ? (
                  <>
                    <Play className="w-2.5 h-2.5 fill-white" />
                    <span>Continuar</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-2.5 h-2.5 fill-white" />
                    <span>Pausar</span>
                  </>
                )}
              </button>
            )}

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[clamp(10px,0.75vw,12px)] font-mono text-zinc-300">
              <Clock className="w-3 h-3 text-purple-400" />
              <span>{formatTime(currentTime)}</span>
              <span className="text-zinc-600">/</span>
              <span>{formatTime(effectiveDuration)}</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden border border-zinc-700/50">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full transition-all duration-300 ease-linear shadow-sm shadow-purple-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[clamp(8px,0.65vw,10px)] text-zinc-400/80 font-mono select-none px-0.5 leading-none">
          <span className="truncate opacity-75">Rockola Digital Live</span>
          <span className="tracking-widest uppercase font-semibold text-zinc-400/90 tv-text-outline-sm">powered : David Taboada</span>
        </div>
      </div>
    </div>
  );
};
