import { useState, type FC } from 'react';
import { Zap, Copy, Check, ExternalLink, X, ShieldCheck } from 'lucide-react';
import { MERCADO_PAGO_ALIAS, VIP_PRICE_ARS } from '../../utils/deviceId';

interface GuestMercadoPagoModalProps {
  isOpen: boolean;
  songTitle: string;
  onConfirmPayment: () => void;
  onClose: () => void;
}

export const GuestMercadoPagoModal: FC<GuestMercadoPagoModalProps> = ({
  isOpen, songTitle, onConfirmPayment, onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyAlias = () => {
    navigator.clipboard?.writeText(MERCADO_PAGO_ALIAS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenMercadoPago = () => {
    // Intenta abrir la app de Mercado Pago por URI scheme
    window.location.href = 'mercadopago://';
    setTimeout(() => {
      // Si no tiene la app instalada, redirige a la web de MP
      window.open('https://www.mercadopago.com.ar', '_blank');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider">Pase VIP con Mercado Pago</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-center space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Canción seleccionada</span>
          <p className="text-xs font-bold text-white truncate">{songTitle}</p>
          <div className="text-2xl font-black text-amber-400 pt-1">${VIP_PRICE_ARS} <span className="text-xs text-zinc-400 font-normal">ARS</span></div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-zinc-300">Transfiere al Alias oficial:</label>
          <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-2xl p-2.5">
            <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider select-all">{MERCADO_PAGO_ALIAS}</span>
            <button
              type="button"
              onClick={handleCopyAlias}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                copied ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenMercadoPago}
          className="w-full py-2.5 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <ExternalLink className="w-4 h-4 text-sky-400" />
          <span>Abrir app Mercado Pago</span>
        </button>

        <div className="pt-1">
          <button
            type="button"
            onClick={onConfirmPayment}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Ya transferí ${VIP_PRICE_ARS} • Enviar VIP ⚡</span>
          </button>
        </div>
      </div>
    </div>
  );
};
