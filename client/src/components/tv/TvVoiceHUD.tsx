import { type FC } from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';

interface TvVoiceHUDProps {
  isSupported: boolean;
  isListening: boolean;
  lastCommand: string | null;
  onToggleVoice: () => void;
}

export const TvVoiceHUD: FC<TvVoiceHUDProps> = ({
  isSupported,
  isListening,
  lastCommand,
  onToggleVoice,
}) => {
  if (!isSupported) return null;

  return (
    <>
      {/* Indicador discreto en esquina superior derecha */}
      <div className="absolute top-4 right-16 z-40 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={onToggleVoice}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-bold transition-all shadow-lg cursor-pointer ${
            isListening
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-emerald-950/40 animate-pulse'
              : 'bg-zinc-900/60 border-zinc-700/60 text-zinc-400 hover:text-white'
          }`}
          title={isListening ? 'Control por voz activo. Di "Pausa", "Continuar", "Siguiente" o "DJ Automático"' : 'Activar control por voz'}
        >
          {isListening ? (
            <>
              <Mic className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
              <span>Voz Smart TV</span>
            </>
          ) : (
            <>
              <MicOff className="w-3.5 h-3.5" />
              <span>Activar Voz</span>
            </>
          )}
        </button>
      </div>

      {/* Toast de confirmación de comando por voz recibido */}
      {lastCommand && (
        <div className="absolute top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
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
      )}
    </>
  );
};
