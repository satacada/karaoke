import { useState, type FC } from 'react';
import { Zap, Copy, Check, ExternalLink, X, ShieldCheck, Smartphone, Building2, Banknote } from 'lucide-react';
import { MERCADO_PAGO_ALIAS, VIP_PRICE_ARS } from '../../utils/deviceId';

interface GuestMercadoPagoModalProps {
  isOpen: boolean; songTitle: string; priceArs?: number;
  onConfirmPayment: () => void; onClose: () => void;
}

type PaymentMethod = 'mp' | 'transfer' | 'cash';

export const GuestMercadoPagoModal: FC<GuestMercadoPagoModalProps> = ({
  isOpen, songTitle, priceArs = VIP_PRICE_ARS, onConfirmPayment, onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('mp');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(MERCADO_PAGO_ALIAS);
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenMpApp = () => {
    const isAndroid = /android/i.test(navigator.userAgent || '');
    window.location.href = isAndroid
      ? 'intent://#Intent;package=com.mercadopago.wallet;scheme=mercadopago;end;'
      : 'mercadopago://';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl w-full max-w-sm p-4 shadow-2xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider">Prioridad & Medios de Pago</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800 text-center">
          <p className="text-xs font-bold text-white truncate">{songTitle}</p>
          <div className="text-xl font-black text-amber-400 pt-0.5">${priceArs} <span className="text-[10px] text-zinc-400 font-normal">ARS</span></div>
        </div>

        {/* Selector de Medios de Pago */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
          <button type="button" onClick={() => setMethod('mp')} className={`py-1.5 px-1 rounded-xl text-[10px] font-black flex flex-col items-center gap-1 transition-all ${method === 'mp' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50' : 'text-zinc-400 hover:text-zinc-200'}`}>
            <Smartphone className="w-3.5 h-3.5" /><span>Mercado Pago</span>
          </button>
          <button type="button" onClick={() => setMethod('transfer')} className={`py-1.5 px-1 rounded-xl text-[10px] font-black flex flex-col items-center gap-1 transition-all ${method === 'transfer' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' : 'text-zinc-400 hover:text-zinc-200'}`}>
            <Building2 className="w-3.5 h-3.5" /><span>Transferencia</span>
          </button>
          <button type="button" onClick={() => setMethod('cash')} className={`py-1.5 px-1 rounded-xl text-[10px] font-black flex flex-col items-center gap-1 transition-all ${method === 'cash' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'text-zinc-400 hover:text-zinc-200'}`}>
            <Banknote className="w-3.5 h-3.5" /><span>En Barra</span>
          </button>
        </div>

        {method === 'mp' && (
          <div className="space-y-2">
            <button type="button" onClick={handleOpenMpApp} className="w-full py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-950/50 active:scale-95 transition-all">
              <ExternalLink className="w-4 h-4" /><span>Abrir App Mercado Pago</span>
            </button>
            <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-2xl p-2">
              <span className="font-mono text-[11px] font-bold text-sky-400 select-all">{MERCADO_PAGO_ALIAS}</span>
              <button type="button" onClick={handleCopy} className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 ${copied ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-200'}`}>
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}<span>{copied ? 'Listo' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        )}

        {method === 'transfer' && (
          <div className="space-y-2">
            <p className="text-[11px] text-zinc-300 leading-tight">Transfiere desde <b>MODO, Cuenta DNI, Ualá</b> o cualquier app bancaria:</p>
            <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-2xl p-2">
              <span className="font-mono text-[11px] font-bold text-purple-400 select-all">{MERCADO_PAGO_ALIAS}</span>
              <button type="button" onClick={handleCopy} className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 ${copied ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-200'}`}>
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}<span>{copied ? 'Listo' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        )}

        {method === 'cash' && (
          <div className="p-3 bg-zinc-950 rounded-2xl border border-emerald-500/30 text-center space-y-1">
            <p className="text-xs font-bold text-emerald-400">Pago en Efectivo / Barra</p>
            <p className="text-[11px] text-zinc-300">Abona <b>${priceArs} ARS</b> en la barra o al mozo/DJ para activar tu turno prioritario.</p>
          </div>
        )}

        <button type="button" onClick={onConfirmPayment} className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all">
          <ShieldCheck className="w-4 h-4" />
          <span>{method === 'cash' ? `Confirmar Pago en Barra ($${priceArs}) ⚡` : `Confirmar Pago de $${priceArs} ⚡`}</span>
        </button>
      </div>
    </div>
  );
};
