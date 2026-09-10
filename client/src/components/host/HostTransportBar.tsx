import { useState, type FC } from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX, RotateCcw, RotateCw } from 'lucide-react';

interface HostTransportBarProps {
  isPlaying: boolean;
  volume: number;
  onPlayPause: () => void;
  onSkip: () => void;
  onSeek: (offsetSeconds: number) => void;
  onVolumeChange: (newVol: number) => void;
}

export const HostTransportBar: FC<HostTransportBarProps> = ({
  isPlaying,
  volume,
  onPlayPause,
  onSkip,
  onSeek,
  onVolumeChange,
}) => {
  const [showVolume, setShowVolume] = useState(false);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800 p-2.5 pb-6 max-w-lg mx-auto shadow-2xl">
      {showVolume && (
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-700 p-3 rounded-2xl mb-2 shadow-2xl animate-fade-in">
          <button
            onClick={() => onVolumeChange(volume === 0 ? 80 : 0)}
            className="text-zinc-400 hover:text-white"
          >
            {volume === 0 ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(parseInt(e.target.value, 10))}
            className="w-full accent-pink-500 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-mono text-zinc-300 w-8 text-right">{volume}%</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setShowVolume((prev) => !prev)}
          className={`p-2.5 rounded-xl border transition-all ${
            showVolume ? 'bg-pink-600 text-white border-pink-500' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
          }`}
          aria-label="Ajustar volumen"
        >
          <Volume2 className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSeek(-10)}
            className="p-2.5 rounded-xl bg-zinc-900 text-zinc-300 border border-zinc-800 active:scale-95"
            aria-label="Retroceder 10 segundos"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onPlayPause}
            className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/40 active:scale-90 transition-transform"
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </button>

          <button
            onClick={() => onSeek(10)}
            className="p-2.5 rounded-xl bg-zinc-900 text-zinc-300 border border-zinc-800 active:scale-95"
            aria-label="Adelantar 10 segundos"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onSkip}
          className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-rose-950/40 active:scale-95 text-xs tracking-wide shrink-0 transition-transform"
          aria-label="Saltar canción"
        >
          <SkipForward className="w-4 h-4 fill-white" />
          <span>Saltar</span>
        </button>
      </div>
    </footer>
  );
};
