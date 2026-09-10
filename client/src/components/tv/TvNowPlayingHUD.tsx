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

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent p-6 pt-16">
      <div className="max-w-6xl mx-auto flex flex-col gap-3">
        {/* Singer Chip & Track Info */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl text-white font-bold text-lg md:text-xl shadow-lg ${song.requested_by.includes('Auto-DJ') ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 shadow-purple-500/30' : 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 shadow-pink-500/30 animate-pulse-glow'}`}>
              <Disc3 className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
              <span>{song.requested_by.includes('Auto-DJ') ? 'Ambiente: Auto-DJ' : `Pidió: ${song.requested_by}`}</span>
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white truncate drop-shadow-md flex items-center gap-2">
                <Music2 className="w-6 h-6 text-purple-400 shrink-0 inline" />
                <span className="truncate">{song.title}</span>
              </h1>
              <p className="text-sm md:text-base text-zinc-400 font-medium truncate">
                {song.author}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-sm font-mono text-zinc-300">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>{formatTime(currentTime)}</span>
            <span className="text-zinc-600">/</span>
            <span>{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800/80 h-2.5 rounded-full overflow-hidden border border-zinc-700/50">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full transition-all duration-300 ease-linear shadow-sm shadow-purple-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
