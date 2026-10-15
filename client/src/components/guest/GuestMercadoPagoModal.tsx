import { useState, useEffect, useRef, type FC } from 'react';
import { Zap, Copy, Check, X, Smartphone, Building2, Banknote, Loader2, RefreshCw } from 'lucide-react';
import { MERCADO_PAGO_ALIAS, VIP_PRICE_ARS } from '../../utils/deviceId';
import { getPublicBaseUrl } from '../../utils/appUrl';

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
  const [isChecking, setIsChecking] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, []);

  if (!isOpen) return null;

  const handleCopy = () => {
    try { navigator.clipboard?.writeText(MERCADO_PAGO_ALIAS); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  const checkPaymentOnApi = async () => {
    setIsChecking(true); setVerifyMsg('Consultando en Mercado Pago...');
    try {
      const baseUrl = getPublicBaseUrl();
      const res = await fetch(`${baseUrl}/api/verify-payment?amount=${priceArs}&minutes=15`);
      const data = await res.json();
      if (data.verified) {
        setVerifyMsg('¡Transferencia confirmada con éxito! ⚡');
        if (timerRef.current) window.clearInterval(timerRef.current);
        setTimeout(() => { onConfirmPayment(); }, 1200);
        return true;
      } else {
        setVerifyMsg(`Aún no vemos los $${priceArs} en la cuenta. Transfiere y vuelve a verificar.`);
      }
    } catch {
      setVerifyMsg('Error al conectar con la API de verificación.');
    } finally {
      setIsChecking(false);
    }
    return false;
  };

  const handlePayWithMp = () => {
    handleCopy();
    const isAndroid = /android/i.test(navigator.userAgent || '');
    window.location.href = isAndroid
      ? 'intent://home#Intent;scheme=mercadopago;package=com.mercadopago.wallet;end;'
      : 'mercadopago://home';

    setIsChecking(true); setVerifyMsg('Abriendo Mercado Pago... Aguardando acreditación...');
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(async () => {
      const ok = await checkPaymentOnApi();
      if (ok && timerRef.current) window.clearInterval(timerRef.current);
    }, 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl w-full max-w-sm p-4 shadow-2xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-amber-400 fill-amber-400" /><h3 className="text-sm font-black text-amber-300 uppercase tracking-wider">Abonar Prioridad</h3></div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-zinc-950 p-2 rounded-2xl border border-zinc-800 text-center">
          <p className="text-xs font-bold text-white truncate">{songTitle}</p>
          <div className="text-xl font-black text-amber-400 pt-0.5">${priceArs} <span className="text-[10px] text-zinc-400 font-normal">ARS</span></div>
        </div>

        <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
          <button type="button" onClick={() => setMethod('mp')} className={`py-1.5 px-1 rounded-xl text-[10px] font-black flex flex-col items-center gap-1 transition-all ${method === 'mp' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50' : 'text-zinc-400 hover:text-zinc-200'}`}><Smartphone className="w-3.5 h-3.5" /><span>Mercado Pago</span></button>
          <button type="button" onClick={() => setMethod('transfer')} className={`py-1.5 px-1 rounded-xl text-[10px] font-black flex flex-col items-center gap-1 transition-all ${method === 'transfer' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' : 'text-zinc-400 hover:text-zinc-200'}`}><Building2 className="w-3.5 h-3.5" /><span>Transferencia</span></button>
          <button type="button" onClick={() => setMethod('cash')} className={`py-1.5 px-1 rounded-xl text-[10px] font-black flex flex-col items-center gap-1 transition-all ${method === 'cash' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'text-zinc-400 hover:text-zinc-200'}`}><Banknote className="w-3.5 h-3.5" /><span>En Barra</span></button>
        </div>

        {method === 'mp' && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-2xl p-2">
              <div className="min-w-0"><span className="text-[9px] text-zinc-400 block font-bold">Alias oficial MP:</span><span className="font-mono text-xs font-bold text-sky-400 select-all truncate block">{MERCADO_PAGO_ALIAS}</span></div>
              <button type="button" onClick={handleCopy} className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 shrink-0 ${copied ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-200'}`}>{copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}<span>{copied ? 'Listo' : 'Copiar'}</span></button>
            </div>
            <button type="button" onClick={handlePayWithMp} className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"><Smartphone className="w-4 h-4 fill-zinc-950" /><span>Girar ${priceArs} y Abrir MP ⚡</span></button>
            {verifyMsg && (
              <div className="p-2 rounded-xl bg-zinc-950 border border-sky-500/30 text-center space-y-1">
                <p className="text-[10px] text-sky-300 flex items-center justify-center gap-1.5">{isChecking && <Loader2 className="w-3 h-3 animate-spin" />}<span>{verifyMsg}</span></p>
                <button type="button" onClick={checkPaymentOnApi} className="text-[10px] text-amber-400 font-bold underline flex items-center justify-center gap-1 mx-auto mt-1"><RefreshCw className="w-3 h-3" /> Verificar Acreditación</button>
              </div>
            )}
          </div>
        )}

        {method === 'transfer' && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-2xl p-2">
              <div className="min-w-0"><span className="text-[9px] text-zinc-400 block font-bold">Alias CBU/CVU:</span><span className="font-mono text-xs font-bold text-purple-400 select-all truncate block">{MERCADO_PAGO_ALIAS}</span></div>
              <button type="button" onClick={handleCopy} className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 shrink-0 ${copied ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-200'}`}>{copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}<span>{copied ? 'Listo' : 'Copiar'}</span></button>
            </div>
            <button type="button" onClick={checkPaymentOnApi} className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"><RefreshCw className="w-4 h-4" /><span>Ya Transferí ${priceArs} • Verificar</span></button>
            {verifyMsg && <p className="text-[10px] text-purple-300 text-center mt-1">{verifyMsg}</p>}
          </div>
        )}

        {method === 'cash' && (
          <div className="space-y-2 pt-1">
            <div className="p-2.5 bg-zinc-950 rounded-2xl border border-emerald-500/30 text-center space-y-1">
              <p className="text-xs font-bold text-emerald-400">Pago en Efectivo / Barra</p>
              <p className="text-[10px] text-zinc-300">Abona <b>${priceArs} ARS</b> en barra o al DJ para activar tu turno prioritario.</p>
            </div>
            <button type="button" onClick={onConfirmPayment} className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"><Banknote className="w-4 h-4" /><span>Avisar Pago en Barra (${priceArs}) 💵</span></button>
          </div>
        )}
      </div>
    </div>
  );
};
