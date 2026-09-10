import { useState, useEffect, type FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Disc3, Sparkles, Smartphone, Signal, Tag, Music2 } from 'lucide-react';
import type { PromoBanner } from '../../types';

interface TvIdleScreenProps {
  roomCode: string;
  joinUrl: string;
  roomName?: string;
  zoneName?: string;
  status?: 'active' | 'paused' | 'closed';
  banners?: PromoBanner[];
  autoDjActive?: boolean;
}

export const TvIdleScreen: FC<TvIdleScreenProps> = ({
  roomCode, joinUrl, roomName = 'Rockola Digital Live', zoneName, status = 'active', banners = [], autoDjActive = false,
}) => {
  const [localBanners, setLocalBanners] = useState<PromoBanner[]>(banners);
  const [promoIdx, setPromoIdx] = useState(0);

  useEffect(() => {
    if (banners && banners.length > 0) {
      setLocalBanners(banners);
    } else {
      const saved = localStorage.getItem(`tv_banners_${roomCode}`);
      if (saved) {
        try { setLocalBanners(JSON.parse(saved)); } catch {}
      }
    }
  }, [banners, roomCode]);

  const activeBanners = localBanners.filter((b) => b.is_active);
  const cleanRoomName = (!roomName || roomName.toLowerCase().includes('karaoke')) ? 'Rockola Digital Live' : roomName;

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setPromoIdx((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const currentPromo = activeBanners[promoIdx % activeBanners.length];

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-zinc-950 via-purple-950/40 to-zinc-950 flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

      <main className="relative z-10 flex flex-col items-center max-w-4xl text-center">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-bounce">
            <Disc3 className="w-11 h-11 text-white animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <Sparkles className="w-7 h-7 text-amber-300 absolute -top-2 -right-2 animate-spin" />
        </div>

        {autoDjActive && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold mb-3 shadow-lg shadow-pink-500/10 animate-pulse">
            <Disc3 className="w-3.5 h-3.5 animate-spin" /> Modo Auto-DJ Ambiente Activo
          </div>
        )}
        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 tracking-tight mb-1">
          {cleanRoomName}
        </h1>
        {zoneName && zoneName !== 'Salón Principal' && (
          <span className="text-sm font-bold text-purple-300 font-mono tracking-widest uppercase mb-2 block">Sector: {zoneName}</span>
        )}
        <p className="text-lg md:text-xl text-zinc-300 font-medium max-w-xl mb-6">
          {status === 'closed' ? 'Este ambiente ha cerrado pedidos por hoy. ¡Te esperamos en el salón principal!' : 'Escanea el código con tu celular para poner tus temas y videos favoritos'}
        </p>

        {status !== 'closed' && (
        <div className="flex flex-col md:flex-row items-center gap-6 bg-zinc-900/80 backdrop-blur-xl border border-purple-500/30 p-6 rounded-3xl shadow-2xl shadow-purple-950/60">
          <div className="bg-white p-3 rounded-2xl shadow-xl border-4 border-purple-500/20 shrink-0">
            <QRCodeSVG value={joinUrl} size={190} level="H" includeMargin={false} />
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-purple-400 font-bold block mb-0.5">Código de Sala</span>
              <span className="text-4xl font-mono font-black text-white tracking-widest bg-zinc-800/80 px-5 py-1.5 rounded-2xl border border-zinc-700 inline-block">
                {roomCode}
              </span>
            </div>

            <div className="flex flex-col gap-2 text-left text-xs text-zinc-300">
              <div className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-pink-400 shrink-0" /><span>1. Abre la cámara de tu celular</span></div>
              <div className="flex items-center gap-2"><Signal className="w-4 h-4 text-emerald-400 shrink-0" /><span>2. Usa tus datos móviles (sin Wi-Fi)</span></div>
              <div className="flex items-center gap-2"><Music2 className="w-4 h-4 text-purple-400 shrink-0" /><span>3. Busca tu canción favorita y pon tu música</span></div>
            </div>

            {currentPromo && (
              <div className="w-full mt-1 bg-amber-500/10 border border-amber-500/40 rounded-xl p-2.5 text-left animate-in fade-in">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1 mb-0.5">
                  <Tag className="w-3 h-3" /> Promo del Local
                </span>
                <p className="text-xs font-bold text-white truncate">{currentPromo.title}</p>
                <p className="text-[11px] text-amber-200/80 truncate">{currentPromo.subtitle}</p>
              </div>
            )}
          </div>
        </div>
        )}
      </main>
    </div>
  );
};
