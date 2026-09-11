import { useState, useEffect, type FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Disc3, Sparkles, Smartphone, Signal, Music2, Play, Pause, Sliders } from 'lucide-react';
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
  roomCode, joinUrl, roomName = 'Rockola Digital Live', zoneName, status = 'active',
  banners = [], autoDjActive = false, onStartAutoDj, isStartingAutoDj = false, onSwitchToHost,
}) => {
  const [localBanners, setLocalBanners] = useState<PromoBanner[]>(banners);
  const [promoIdx, setPromoIdx] = useState(0); const [now, setNow] = useState(() => Date.now());
  const [qrType, setQrType] = useState<'guest' | 'host'>('guest');

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
  const activeQrUrl = qrType === 'guest' ? joinUrl : getHostUrl(roomCode);

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
        <div className="flex items-center gap-1.5 my-3 bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800 shadow-xl">
          <button type="button" onClick={() => setQrType('guest')} className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${qrType === 'guest' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}><Music2 className="w-3.5 h-3.5" /><span>📱 QR Pedidos (Clientes)</span></button>
          <button type="button" onClick={() => setQrType('host')} className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${qrType === 'host' ? 'bg-gradient-to-r from-pink-600 to-amber-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}><Sliders className="w-3.5 h-3.5" /><span>🎧 QR Control (Administrador)</span></button>
        </div>
        {status !== 'closed' && (
          <div className="flex flex-col md:flex-row items-center gap-5 bg-zinc-900/85 backdrop-blur-xl border border-purple-500/30 p-5 rounded-3xl shadow-2xl shadow-purple-950/60 max-w-2xl">
            <div className="bg-white p-2.5 rounded-2xl shadow-xl border-4 border-purple-500/20 shrink-0">
              <QRCodeSVG value={activeQrUrl} size={170} level="H" includeMargin={false} />
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2 flex-1">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold block mb-0.5">{qrType === 'guest' ? 'Código de Sala para Pedidos' : 'Enlace de Control Administrador'}</span>
                <span className="text-2xl font-mono font-black text-white tracking-widest bg-zinc-800/80 px-3 py-0.5 rounded-xl border border-zinc-700 inline-block">{roomCode}</span>
              </div>
              <div className="flex flex-col gap-1 text-left text-xs text-zinc-300">
                {qrType === 'guest' ? (
                  <>
                    <div className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-pink-400 shrink-0" /><span>1. Abre la cámara de tu celular</span></div>
                    <div className="flex items-center gap-2"><Signal className="w-4 h-4 text-emerald-400 shrink-0" /><span>2. Usa tus datos móviles (sin Wi-Fi)</span></div>
                    <div className="flex items-center gap-2"><Music2 className="w-4 h-4 text-purple-400 shrink-0" /><span>3. Busca tu canción favorita y pon tu música</span></div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-amber-400 shrink-0" /><span>1. Escanea para controlar la TV desde tu celular</span></div>
                    <div className="flex items-center gap-2"><Sliders className="w-4 h-4 text-purple-400 shrink-0" /><span>2. Reordena la cola, ajusta volumen y salta temas</span></div>
                    {onSwitchToHost && <button type="button" onClick={onSwitchToHost} className="mt-1 w-full py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"><Sliders className="w-3.5 h-3.5" /><span>Abrir Consola Administrador en esta pantalla</span></button>}
                  </>
                )}
              </div>
              {onStartAutoDj && (
                <div className="w-full mt-1">
                  <button type="button" onClick={onStartAutoDj} disabled={isStartingAutoDj} className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 border border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50">
                    <Play className="w-3.5 h-3.5 fill-white" /><span>{isStartingAutoDj ? 'Iniciando sonido...' : '▶ Iniciar Música Inteligente'}</span>
                  </button>
                  <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center justify-center gap-1"><Pause className="w-3 h-3 text-pink-400" /> Pausa con botón <b>Pausa / OK</b> del mando o diciendo <b>"Pausa"</b></p>
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
