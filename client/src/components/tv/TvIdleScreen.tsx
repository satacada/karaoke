import { useState, useEffect, type FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Disc3, Sparkles, Smartphone, Sliders, Play, Pause, ShieldCheck, Monitor } from 'lucide-react';
import { TvIdlePromoCard } from './TvIdlePromoCard';
import { getHostUrl } from '../../utils/appUrl';
import type { PromoBanner } from '../../types';

interface TvIdleScreenProps {
  roomCode: string; joinUrl: string; roomName?: string; zoneName?: string;
  status?: 'active' | 'paused' | 'closed'; banners?: PromoBanner[];
  autoDjActive?: boolean; onStartAutoDj?: () => void; isStartingAutoDj?: boolean;
  onSwitchToHost?: () => void;
}

export const TvIdleScreen: FC<TvIdleScreenProps> = ({
  roomCode, roomName = 'Rockola Digital Live', zoneName, status = 'active',
  banners = [], autoDjActive = false, onStartAutoDj, isStartingAutoDj = false, onSwitchToHost,
}) => {
  const [localBanners, setLocalBanners] = useState<PromoBanner[]>(banners);
  const [promoIdx, setPromoIdx] = useState(0); const [now, setNow] = useState(() => Date.now());
  const hostUrl = getHostUrl(roomCode);

  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 2000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    if (banners && banners.length > 0) setLocalBanners(banners);
    else { const s = localStorage.getItem(`tv_banners_${roomCode}`); if (s) { try { setLocalBanners(JSON.parse(s)); } catch {} } }
  }, [banners, roomCode]);

  const activeBanners = localBanners.filter((b) => b.is_active && (!b.expires_at || b.expires_at > now));
  const cleanRoomName = (!roomName || roomName.toLowerCase().includes('karaoke')) ? 'Rockola Digital Live' : roomName;

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => setPromoIdx((p) => (p + 1) % activeBanners.length), 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const currentPromo = activeBanners[promoIdx % activeBanners.length] || null;

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-zinc-950 via-purple-950/40 to-zinc-950 flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />
      <main className="relative z-10 flex flex-col items-center max-w-4xl text-center">
        <div className="relative mb-2">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-bounce">
            <Disc3 className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <Sparkles className="w-5 h-5 text-amber-300 absolute -top-2 -right-2 animate-spin" />
        </div>
        {autoDjActive && <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold mb-1 shadow-lg"><Disc3 className="w-3.5 h-3.5 animate-spin" /> Modo Auto-DJ Configurado</div>}
        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 tracking-tight mb-1">{cleanRoomName}</h1>
        {zoneName && zoneName !== 'Salón Principal' && <span className="text-xs font-bold text-purple-300 font-mono tracking-widest uppercase mb-1 block">Sector: {zoneName}</span>}

        {status !== 'closed' && (
          <div className="flex flex-col md:flex-row items-center gap-6 bg-zinc-900/90 backdrop-blur-xl border-2 border-purple-500/40 p-6 rounded-3xl shadow-2xl shadow-purple-950/70 max-w-3xl mt-2">
            <div className="bg-white p-3.5 rounded-3xl shadow-2xl border-4 border-purple-500/30 shrink-0">
              <QRCodeSVG value={hostUrl} size={250} level="M" includeMargin={false} />
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2.5 flex-1">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-600/30 border border-pink-500/40 text-pink-300 text-[11px] font-bold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                  <span>Vincular Administrador / DJ</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Sala:</span>
                  <span className="text-2xl font-mono font-black text-white tracking-widest bg-zinc-800 px-3 py-0.5 rounded-xl border border-zinc-700">{roomCode}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 text-left text-xs text-zinc-300">
                <div className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-amber-400 shrink-0" /><span>1. Escanea este QR con tu celular para conectar la Consola DJ</span></div>
                <div className="flex items-center gap-2"><Sliders className="w-4 h-4 text-purple-400 shrink-0" /><span>2. Ingresa con tu PIN de 4 dígitos o cuenta de Google</span></div>
                <div className="flex items-center gap-2"><Disc3 className="w-4 h-4 text-emerald-400 shrink-0" /><span>3. Elige tocar DJ Automático o pon música para arrancar la Rockola</span></div>
              </div>
              {onSwitchToHost && (
                <button type="button" onClick={onSwitchToHost} className="w-full py-2 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all">
                  <Monitor className="w-3.5 h-3.5" /><span>Abrir Consola Administrador en esta pantalla</span>
                </button>
              )}
              {onStartAutoDj && (
                <div className="w-full mt-0.5">
                  <button type="button" onClick={onStartAutoDj} disabled={isStartingAutoDj} className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 border border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50">
                    <Play className="w-3.5 h-3.5 fill-white" /><span>{isStartingAutoDj ? 'Iniciando sonido...' : '▶ Iniciar Música Inteligente'}</span>
                  </button>
                  <p className="text-[10px] text-zinc-400 mt-1 flex items-center justify-center gap-1"><Pause className="w-3 h-3 text-pink-400" /> Pausa con botón <b>Pausa / OK</b> del mando o diciendo <b>"Pausa"</b></p>
                </div>
              )}
              <TvIdlePromoCard promo={currentPromo} now={now} />
            </div>
          </div>
        )}
      </main>
      <footer className="absolute bottom-2 right-4 z-20 pointer-events-none select-none">
        <span className="text-[clamp(9px,0.7vw,11px)] font-mono font-medium text-zinc-400/80 uppercase tracking-widest tv-text-outline-sm">powered : David Taboada</span>
      </footer>
    </div>
  );
};
