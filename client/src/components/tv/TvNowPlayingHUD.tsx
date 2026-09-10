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
    <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent px-5 py-2.5 pt-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-white font-bold text-xs md:text-sm shadow-md shrink-0 ${song.requested_by.includes('Auto-DJ') ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 shadow-purple-500/20' : 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 shadow-pink-500/20 animate-pulse-glow'}`}>
              <Disc3 className="w-3.5 h-3.5 animate-spin shrink-0" style={{ animationDuration: '4s' }} />
              <span className="truncate max-w-[140px] md:max-w-[200px]">{song.requested_by.includes('Auto-DJ') ? 'Auto-DJ' : `Pidió: ${song.requested_by}`}</span>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-sm md:text-base lg:text-lg font-bold text-white truncate drop-shadow-sm flex items-center gap-1.5 leading-tight">
                <Music2 className="w-4 h-4 text-purple-400 shrink-0 inline" />
                <span className="truncate">{song.title}</span>
              </h1>
              <p className="text-[11px] md:text-xs text-zinc-400 font-medium truncate">{song.author}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onTogglePlayPause && (
              <button
                type="button"
                onClick={onTogglePlayPause}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all shadow-md border cursor-pointer select-none pointer-events-auto active:scale-95 ${
                  isPaused
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400 text-white shadow-emerald-950/40 hover:brightness-110 animate-pulse'
                    : 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 border-pink-400/50 text-white shadow-purple-950/40 hover:brightness-110'
                }`}
                title={isPaused ? 'Continuar música' : 'Pausar música'}
              >
                {isPaused ? (
                  <>
                    <Play className="w-3 h-3 fill-white" />
                    <span>Continuar</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3 fill-white" />
                    <span>Pausar</span>
                  </>
                )}
              </button>
            )}

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-300">
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
      </div>
    </div>
  );
};
