import { useState, type FC } from 'react';
import { Sparkles, Heart, Zap, X, Music } from 'lucide-react';
import { validateDedication, MAX_DEDICATION_LENGTH } from '../../utils/profanityFilter';
import type { SearchResultItem } from '../../types';

interface GuestSongConfirmModalProps {
  isOpen: boolean; song: SearchResultItem | null; guestName: string; canRequestVip?: boolean;
  onConfirm: (dedication: string | null, isVip: boolean) => void; onClose: () => void;
}

export const GuestSongConfirmModal: FC<GuestSongConfirmModalProps> = ({
  isOpen, song, guestName, canRequestVip = true, onConfirm, onClose,
}) => {
  const [dedication, setDedication] = useState(''); const [isVip, setIsVip] = useState(false);

  if (!isOpen || !song) return null;
  const validation = validateDedication(dedication);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid) return;
    onConfirm(dedication.trim() || null, isVip);
    setDedication(''); setIsVip(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Confirmar Pedido</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex items-center gap-3 bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800">
          {song.thumbnailUrl && <img src={song.thumbnailUrl} alt={song.title} className="w-14 h-10 object-cover rounded-xl shrink-0" />}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">{song.title}</h4>
            <p className="text-[11px] text-zinc-400 truncate">{song.author} • {song.durationText}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-400" />
              <span>Dedicatoria en la TV <span className="text-zinc-500 font-normal">(Opcional)</span></span>
            </label>
            <input
              type="text"
              value={dedication}
              onChange={(e) => setDedication(e.target.value.slice(0, MAX_DEDICATION_LENGTH))}
              placeholder={`Ej: ¡Feliz cumple ${guestName}! Mesa 4 🎂`}
              className={`w-full bg-zinc-950 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors ${
                !validation.isValid ? 'border-rose-500/80 focus:border-rose-500' : 'border-zinc-800 focus:border-pink-500'
              }`}
            />
            <div className="flex justify-between items-center text-[10px]">
              <span className={validation.isValid ? 'text-zinc-500' : 'text-rose-400 font-semibold'}>{validation.errorReason || 'Aparecerá 40 segundos al iniciar la canción.'}</span>
              <span className="text-zinc-500">{dedication.length}/{MAX_DEDICATION_LENGTH}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsVip(false)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                !isVip ? 'bg-zinc-800/90 border-emerald-500 shadow-md scale-[1.02]' : 'bg-zinc-950/60 border-zinc-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 mb-0.5">
                <Music className="w-3.5 h-3.5" /><span>Normal</span>
              </div>
              <p className="text-[10px] text-zinc-400">Entra a la fila en tu turno.</p>
            </button>

            <button
              type="button"
              disabled={!canRequestVip}
              onClick={() => canRequestVip && setIsVip(true)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                !canRequestVip
                  ? 'opacity-40 cursor-not-allowed bg-zinc-950 border-zinc-800'
                  : isVip
                  ? 'bg-gradient-to-br from-amber-500/20 to-pink-500/20 border-amber-400 shadow-lg scale-[1.02]'
                  : 'bg-zinc-950/60 border-zinc-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-xs font-black text-amber-300 mb-0.5">
                <div className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /><span>Pase VIP ⚡</span></div>
                <span className="text-[10px] text-amber-400 font-mono">$500</span>
              </div>
              <p className="text-[10px] text-amber-200/80">
                {canRequestVip ? 'Toca de siguiente (Máx 3).' : 'Límite de 3 alcanzado.'}
              </p>
            </button>
          </div>

          <button
            type="submit"
            disabled={!validation.isValid}
            className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl transition-all ${
              isVip
                ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-zinc-950 hover:brightness-110'
                : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
            } disabled:opacity-30`}
          >
            {isVip ? <Zap className="w-4 h-4 fill-zinc-950" /> : <Music className="w-4 h-4" />}
            <span>{isVip ? 'Continuar con Pago VIP ($500) ⚡' : 'Agregar a la Fila 🎤'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
