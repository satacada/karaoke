import { useState, type FC } from 'react';
import { Sparkles, Heart, Zap, X, Music } from 'lucide-react';
import { validateDedication, MAX_DEDICATION_LENGTH } from '../../utils/profanityFilter';
import type { SearchResultItem } from '../../types';

interface GuestSongConfirmModalProps {
  isOpen: boolean; song: SearchResultItem | null; guestName: string; canRequestVip?: boolean; highestVipAmount?: number;
  onConfirm: (dedication: string | null, isVip: boolean, vipAmount?: number) => void; onClose: () => void;
}

export const GuestSongConfirmModal: FC<GuestSongConfirmModalProps> = ({
  isOpen, song, guestName, canRequestVip = true, highestVipAmount = 0, onConfirm, onClose,
}) => {
  const [dedication, setDedication] = useState(''); const [isVip, setIsVip] = useState(false);
  const minToBeat = highestVipAmount > 0 ? highestVipAmount + 100 : 500;
  const [vipAmount, setVipAmount] = useState(500);

  if (!isOpen || !song) return null;
  const validation = validateDedication(dedication);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid) return;
    onConfirm(dedication.trim() || null, isVip, isVip ? vipAmount : undefined);
    setDedication(''); setIsVip(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-pink-400" /><h3 className="text-sm font-bold text-white uppercase tracking-wider">Confirmar Pedido</h3></div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex items-center gap-3 bg-zinc-950/80 p-2.5 rounded-2xl border border-zinc-800">
          {song.thumbnailUrl && <img src={song.thumbnailUrl} alt={song.title} className="w-12 h-9 object-cover rounded-xl shrink-0" />}
          <div className="min-w-0 flex-1"><h4 className="text-xs font-bold text-white truncate">{song.title}</h4><p className="text-[11px] text-zinc-400 truncate">{song.author} • {song.durationText}</p></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-pink-400" /><span>Dedicatoria en la TV (Opcional)</span></label>
            <input type="text" value={dedication} onChange={(e) => setDedication(e.target.value.slice(0, MAX_DEDICATION_LENGTH))} placeholder={`Ej: ¡Para ${guestName || 'la mesa'}! 🎂`} className={`w-full bg-zinc-950 border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none transition-colors ${!validation.isValid ? 'border-rose-500' : 'border-zinc-800 focus:border-pink-500'}`} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setIsVip(false)} className={`p-2.5 rounded-2xl border text-left transition-all ${!isVip ? 'bg-zinc-800/90 border-emerald-500 shadow-md' : 'bg-zinc-950/60 border-zinc-800 opacity-60'}`}>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 mb-0.5"><Music className="w-3.5 h-3.5" /><span>Normal (Gratis)</span></div>
              <p className="text-[10px] text-zinc-400">Entra a la fila en tu turno.</p>
            </button>
            <button type="button" disabled={!canRequestVip} onClick={() => { if (canRequestVip) { setIsVip(true); setVipAmount(minToBeat); } }} className={`p-2.5 rounded-2xl border text-left transition-all ${!canRequestVip ? 'opacity-40 cursor-not-allowed bg-zinc-950' : isVip ? 'bg-gradient-to-br from-amber-500/20 to-pink-500/20 border-amber-400 shadow-lg' : 'bg-zinc-950/60 border-zinc-800 opacity-60'}`}>
              <div className="flex items-center justify-between text-xs font-black text-amber-300 mb-0.5"><div className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /><span>Prioridad ⚡</span></div><span className="text-[10px] text-amber-400 font-mono">${minToBeat}</span></div>
              <p className="text-[10px] text-amber-200/80">Toca antes por mayor aporte.</p>
            </button>
          </div>
          {isVip && (
            <div className="space-y-1.5 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
              <div className="flex justify-between items-center text-[11px] font-bold text-amber-300"><span>Aporte para Prioridad:</span><span className="font-mono text-xs text-amber-400 font-black">${vipAmount} ARS</span></div>
              <div className="flex gap-1.5">{[500, 1000, 2000, minToBeat].filter((v, i, a) => a.indexOf(v) === i).map((opt) => (
                <button key={opt} type="button" onClick={() => setVipAmount(opt)} className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all ${vipAmount === opt ? 'bg-amber-400 text-zinc-950 border-amber-300 font-black' : 'bg-zinc-900 border-zinc-700 text-zinc-300'}`}>${opt}</button>
              ))}</div>
              <p className="text-[10px] text-amber-200/90">{vipAmount > highestVipAmount ? `⚡ Superas el mayor aporte ($${highestVipAmount}) y tocarás #1.` : `⚠️ Mayor aporte actual: $${highestVipAmount}. Para ser #1 debes superarlo.`}</p>
            </div>
          )}
          <button type="submit" disabled={!validation.isValid} className={`w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl transition-all ${isVip ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-zinc-950' : 'bg-emerald-500 text-zinc-950'}`}>
            {isVip ? <Zap className="w-4 h-4 fill-zinc-950" /> : <Music className="w-4 h-4" />}<span>{isVip ? `Continuar con Pago Prioritario ($${vipAmount}) ⚡` : 'Agregar a la Fila 🎤'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
