import type { FC } from 'react';
import { Volume2, Play } from 'lucide-react';

interface TvAutoplayBlockedPromptProps {
  onUnlock: () => void;
}

export const TvAutoplayBlockedPrompt: FC<TvAutoplayBlockedPromptProps> = ({ onUnlock }) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onUnlock();
      }}
      className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center p-6 select-none cursor-pointer"
    >
      <div className="w-16 h-16 rounded-full bg-pink-600/30 border border-pink-500/50 flex items-center justify-center text-pink-400">
        <Volume2 className="w-8 h-8 animate-bounce" />
      </div>
      <div>
        <h3 className="text-xl font-black text-white">Activar Sonido de la TV</h3>
        <p className="text-sm text-zinc-300 max-w-sm mt-1">
          El navegador requiere un clic previo para autorizar la reproducción con audio.
        </p>
      </div>
      <button
        type="button"
        className="py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm uppercase tracking-wider shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
      >
        <Play className="w-4 h-4 fill-white" />
        <span>Toca aquí o pulsa OK en el mando</span>
      </button>
    </div>
  );
};
