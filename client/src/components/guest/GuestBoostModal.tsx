import { useState, type FC } from 'react';
import { Zap, X, Trophy } from 'lucide-react';
import type { QueueItem } from '../../types';

interface GuestBoostModalProps {
  isOpen: boolean; song: QueueItem | null; highestVipAmount: number;
  onProceedToPayment: (amount: number) => void; onClose: () => void;
}

export const GuestBoostModal: FC<GuestBoostModalProps> = ({
  isOpen, song, highestVipAmount, onProceedToPayment, onClose,
}) => {
  const minToBeat = highestVipAmount > 0 ? highestVipAmount + 50 : 100;
  const [amount, setAmount] = useState(minToBeat);

  if (!isOpen || !song) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider">Subir a Cola Prioritaria</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-bold">Canción a adelantar</span>
          <p className="text-xs font-bold text-white truncate">{song.title}</p>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
            <span>Elige tu monto de aporte:</span>
            <span className="text-amber-400 font-mono text-sm font-black">${amount} ARS</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[100, 200, 500, minToBeat].filter((v, i, a) => a.indexOf(v) === i).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setAmount(opt)}
                className={`py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                  amount === opt
                    ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md font-black'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-amber-400/40'
                }`}
              >
                ${opt}
              </button>
            ))}
          </div>
          <div className="text-[11px] bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-amber-300/90 leading-tight">
            {amount > highestVipAmount
              ? `⚡ ¡Con $${amount} serás el #1 de la cola prioritaria!`
              : `⚠️ El aporte más alto actual es $${highestVipAmount}. Supera ese monto para tocar de primero.`}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onProceedToPayment(amount)}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Zap className="w-4 h-4 fill-zinc-950" />
          <span>Pagar Prioridad (${amount} ARS) ⚡</span>
        </button>
      </div>
    </div>
  );
};
