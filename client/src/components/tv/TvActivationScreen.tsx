import { useState, useEffect, type FC, type FormEvent } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Tv, Radio, ArrowRight, CheckCircle2, Sparkles, Sliders } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { getPairUrl } from '../../utils/appUrl';

interface TvActivationScreenProps {
  onPaired: (roomCode: string) => void;
  onSwitchToHost?: () => void;
}

export const TvActivationScreen: FC<TvActivationScreenProps> = ({ onPaired, onSwitchToHost }) => {
  const [code] = useState(() => `TV-${Math.floor(1000 + Math.random() * 9000)}`);
  const [manualCode, setManualCode] = useState('');
  const [isFlashing, setIsFlashing] = useState(false);
  const [pairedInfo, setPairedInfo] = useState<{ roomCode: string; roomName: string } | null>(null);

  const pairUrl = getPairUrl(code);

  useEffect(() => {
    const channel = supabase
      .channel(`tv-activation-${code}`)
      .on('broadcast', { event: 'paired' }, ({ payload }) => {
        if (payload?.roomCode) {
          setPairedInfo({ roomCode: payload.roomCode, roomName: payload.roomName || payload.roomCode });
          try { localStorage.setItem('tv_paired_room', payload.roomCode.toUpperCase()); } catch {}
          setTimeout(() => onPaired(payload.roomCode.toUpperCase()), 1800);
        }
      })
      .on('broadcast', { event: 'flash' }, () => {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 3500);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [code, onPaired]);

  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    const c = manualCode.trim().toUpperCase();
    if (c) {
      try { localStorage.setItem('tv_paired_room', c); } catch {}
      onPaired(c);
    }
  };

  return (
    <div className={`relative min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 select-none transition-all duration-300 ${isFlashing ? 'ring-8 ring-emerald-400 bg-emerald-950/20' : ''}`}>
      {isFlashing && (
        <div className="absolute top-8 px-6 py-3 rounded-2xl bg-emerald-500 text-zinc-950 font-black text-lg shadow-2xl flex items-center gap-2 animate-bounce z-50">
          <Sparkles className="w-6 h-6" /><span>⚡ ¡PANTALLA IDENTIFICADA POR EL DUEÑO!</span>
        </div>
      )}

      {pairedInfo ? (
        <div className="bg-zinc-900 border border-emerald-500/50 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
          <h2 className="text-2xl font-black text-white">¡Pantalla Vinculada!</h2>
          <p className="text-sm text-zinc-300">Asignada exitosamente al ambiente: <b className="text-emerald-400">{pairedInfo.roomName}</b></p>
          <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mt-4" />
        </div>
      ) : (
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-xl space-y-3">
            <QRCodeSVG value={pairUrl} size={220} level="H" includeMargin className="rounded-lg" />
            <div className="text-center">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Código de enlace rápido</span>
              <span className="text-3xl font-black font-mono tracking-widest text-zinc-950 bg-zinc-100 px-4 py-1 rounded-xl border border-zinc-300 block">{code}</span>
            </div>
          </div>

          <div className="space-y-5 text-left">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest">
              <Tv className="w-4 h-4" /><span>Activación de Pantalla TV</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight leading-tight">Vincular esta TV con tu cuenta de Administrador</h1>
            <p className="text-sm text-zinc-400 leading-relaxed">Apunta la cámara de tu celular al código QR para asignar esta pantalla a una sala (ej. <b>Salón Principal, Terraza, VIP</b>).</p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
              <Radio className="w-4 h-4 animate-pulse shrink-0" />
              <span>Esperando vinculación del celular del dueño en tiempo real...</span>
            </div>

            <div className="pt-2 border-t border-zinc-800">
              <span className="text-[11px] text-zinc-500 block mb-1.5">¿Prefieres escribir el código de sala con el control remoto?</span>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input type="text" value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="Ej: FIESTA o TERRA" className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono font-bold focus:outline-none focus:border-purple-500 flex-1" />
                <button type="submit" disabled={!manualCode.trim()} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors">
                  <span>Conectar</span><ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {onSwitchToHost && (
              <div className="pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={onSwitchToHost}
                  className="w-full py-2 px-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  <span>Abrir Consola Administrador en esta pantalla</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
