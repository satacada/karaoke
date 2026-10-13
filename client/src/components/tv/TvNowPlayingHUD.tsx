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

  // Aparece al inicio por 15 segundos y luego cada 60 segundos se muestra por 10 segundos
  const isMetaVisible = currentTime <= 15 || (Math.floor(currentTime) % 60 < 10);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-[clamp(0.75rem,2.5vw,2rem)] pt-3 pb-1">
      <div className="max-w-6xl mx-auto flex flex-col gap-1">
        {/* Título y Autor: 15s iniciales y luego cada 60s */}
        <div
          className={`flex items-center gap-2.5 min-w-0 transition-opacity duration-700 ease-in-out ${
            isMetaVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-white font-black text-[clamp(10px,0.8vw,13px)] shadow-lg shrink-0 border border-black ${
              song.requested_by.includes('Auto-DJ')
                ? 'bg-gradient-to-r from-pink-600 to-purple-600'
                : 'bg-gradient-to-r from-purple-600 to-pink-600'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5 animate-spin shrink-0" style={{ animationDuration: '4s' }} />
            <span className="truncate max-w-[140px] md:max-w-[200px]">
              {song.requested_by.includes('Auto-DJ') ? 'Auto-DJ' : `Pidió: ${song.requested_by}`}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-[clamp(0.95rem,1.4vw,1.45rem)] font-black text-white truncate drop-shadow-md flex items-center gap-1.5 leading-tight tv-text-outline">
              <Music2 className="w-4 h-4 text-pink-400 shrink-0 inline" />
              <span className="truncate">{song.title}</span>
            </h1>
            <p className="text-[clamp(11px,0.8vw,13px)] text-white font-bold truncate tv-text-outline-sm">{song.author}</p>
          </div>
        </div>

        {/* Fila superior a la barra: Botón Pausar/Continuar y Duración encima de la barra de avance */}
        <div className="flex items-center justify-between text-[clamp(9px,0.7vw,11px)] font-mono select-none px-0.5 pr-36 sm:pr-44 pointer-events-auto">
          <div className="flex items-center gap-2">
            {onTogglePlayPause && (
              <button
                type="button"
                onClick={onTogglePlayPause}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg font-black text-[clamp(9px,0.75vw,11px)] uppercase tracking-wider transition-all shadow-md border cursor-pointer select-none pointer-events-auto active:scale-95 ${
                  isPaused
                    ? 'bg-emerald-600 border-white text-white shadow-emerald-950/40 hover:brightness-110 animate-pulse'
                    : 'bg-pink-600 border-white/60 text-white shadow-purple-950/40 hover:brightness-110'
                }`}
                title={isPaused ? 'Continuar música (Espacio / OK en TV Box)' : 'Pausar música (Espacio / OK en TV Box)'}
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

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 border border-white/20 text-[clamp(10px,0.75vw,12px)] font-mono font-bold text-white tv-text-outline-sm">
              <Clock className="w-3 h-3 text-pink-400" />
              <span>{formatTime(currentTime)}</span>
              <span className="text-zinc-400">/</span>
              <span>{formatTime(effectiveDuration)}</span>
            </div>
          </div>

          <span className="tracking-widest uppercase font-black text-white text-[9px] tv-text-outline-sm">
            Powered by DTC
          </span>
        </div>

        {/* Barra horizontal de avance: ubicada en la parte más baja de la pantalla */}
        <div className="w-full pr-36 sm:pr-44 pb-0.5">
          <div className="w-full bg-black/70 h-2 rounded-full overflow-hidden border border-white/30 shadow-md">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full transition-all duration-300 ease-linear shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
