import type { FC } from 'react';
import { Mic, FastForward, Music } from 'lucide-react';
import type { QueueItem } from '../../types';

interface HostNowPlayingCardProps {
  currentSong: QueueItem | null;
  currentTime: number;
  onSkip: () => void;
  onSeek?: (seconds: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const HostNowPlayingCard: FC<HostNowPlayingCardProps> = ({
  currentSong,
  currentTime,
  onSkip,
  onSeek,
}) => {
  if (!currentSong) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3.5 text-center text-zinc-400 text-xs flex items-center justify-between gap-2">
        <span className="truncate">📺 TV en espera / Auto-DJ activo</span>
        <button
          onClick={onSkip}
          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-[11px] border border-zinc-700 flex items-center gap-1 shrink-0 active:scale-95 transition-all"
        >
          <FastForward className="w-3 h-3 text-pink-400" />
          <span>Siguiente</span>
        </button>
      </div>
    );
  }

  const duration = currentSong.duration_seconds || 180;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / duration) * 100));

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSeconds = Math.floor(clickRatio * duration);
    onSeek(targetSeconds);
  };

  return (
    <div className="bg-gradient-to-r from-purple-950/40 via-zinc-900 to-zinc-900 border border-purple-500/30 rounded-2xl p-4 shadow-xl">
      <header className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-600/30 text-pink-300 border border-pink-500/40 text-xs font-bold">
          <Mic className="w-3.5 h-3.5 animate-pulse" />
          <span>{currentSong.requested_by}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {onSeek && (
            <button
              onClick={() => onSeek(0)}
              title="Reiniciar tema al inicio"
              className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold border border-zinc-700 active:scale-95"
            >
              ⏮ Inicio
            </button>
          )}
          <button
            onClick={onSkip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/40 active:scale-95 transition-all"
            aria-label="Saltar canción"
          >
            <FastForward className="w-3.5 h-3.5 fill-white" />
            <span>Saltar</span>
          </button>
        </div>
      </header>

      <div className="flex items-center gap-2.5 mb-2">
        <Music className="w-5 h-5 text-purple-400 shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-white truncate leading-snug">{currentSong.title}</h2>
          <p className="text-xs text-zinc-400 truncate">{currentSong.author}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mb-1">
        <span>{formatTime(currentTime)}</span>
        <span className="text-[10px] text-zinc-500 font-sans italic">Toca la barra para avanzar/retroceder</span>
        <span>{currentSong.duration_text || formatTime(duration)}</span>
      </div>

      {/* Barra interactiva: toca o arrastra en cualquier punto */}
      <div
        onClick={handleProgressBarClick}
        className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden border border-zinc-700/50 cursor-pointer relative"
        title="Toca para ir a este punto"
      >
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
