import type { FC } from 'react';
import { Settings, Sliders } from 'lucide-react';
import { TvFloatingQr } from './TvFloatingQr';
import { TvLiveReactionsZone } from './TvLiveReactionsZone';
import { TvPromoTicker } from './TvPromoTicker';
import { TvDedicationBanner } from './TvDedicationBanner';
import type { PromoBanner, QueueItem } from '../../types';

interface TvSidebarOverlayProps {
  roomCode: string;
  joinUrl: string;
  currentSong: QueueItem | null;
  banners: PromoBanner[];
  onOpenSettings: () => void;
  onSwitchToHost?: () => void;
}

export const TvSidebarOverlay: FC<TvSidebarOverlayProps> = ({
  roomCode, joinUrl, currentSong, banners, onOpenSettings, onSwitchToHost
}) => (
  <aside className="absolute top-[clamp(0.5rem,1.5vh,1rem)] right-[clamp(0.5rem,1.5vw,1rem)] z-40 flex flex-col items-end gap-1 w-[clamp(92px,9vw,135px)] pointer-events-none transition-all">
    <div className="flex items-center justify-end gap-1 pointer-events-auto">
      {onSwitchToHost && (
        <button
          type="button"
          onClick={onSwitchToHost}
          title="Abrir consola Administrador en esta pantalla"
          className="px-1.5 py-0.5 rounded-lg bg-purple-900/60 hover:bg-purple-700 text-purple-200 hover:text-white border border-purple-500/30 text-[9px] font-bold transition-colors flex items-center gap-0.5 cursor-pointer"
        >
          <Sliders className="w-2.5 h-2.5" />
          <span>Admin</span>
        </button>
      )}
      <button
        type="button"
        onClick={onOpenSettings}
        title="Configuración de pantalla"
        className="p-1 rounded-lg bg-black/40 hover:bg-black/70 text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
      >
        <Settings className="w-3 h-3" />
      </button>
    </div>
    <div className="pointer-events-auto w-full">
      <TvFloatingQr roomCode={roomCode} joinUrl={joinUrl} onSwitchToHost={onSwitchToHost} currentSongId={currentSong?.id} />
    </div>
    <TvLiveReactionsZone roomCode={roomCode} />
    <TvPromoTicker banners={banners} roomCode={roomCode} />
    <TvDedicationBanner currentSong={currentSong} />
  </aside>
);
