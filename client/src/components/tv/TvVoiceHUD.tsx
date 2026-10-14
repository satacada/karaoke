import { type FC } from 'react';
import { Sparkles } from 'lucide-react';

interface TvVoiceHUDProps {
  lastCommand: string | null;
}

export const TvVoiceHUD: FC<TvVoiceHUDProps> = ({ lastCommand }) => {
  if (!lastCommand) return null;

  return (
    <div className="absolute top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-none select-none">
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-emerald-500/50 text-white shadow-2xl shadow-emerald-950/60">
        <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold">Comando de Voz</p>
          <p className="text-xs font-bold text-zinc-100">"{lastCommand}"</p>
        </div>
      </div>
    </div>
  );
};
