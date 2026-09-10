import type { FC } from 'react';
import { Settings } from 'lucide-react';
import { TvFloatingQr } from './TvFloatingQr';
import { TvPromoTicker } from './TvPromoTicker';
import { TvDedicationBanner } from './TvDedicationBanner';
import type { PromoBanner, QueueItem } from '../../types';

interface TvSidebarOverlayProps {
  roomCode: string;
  joinUrl: string;
  currentSong: QueueItem | null;
  banners: PromoBanner[];
  onOpenSettings: () => void;
}

export const TvSidebarOverlay: FC<TvSidebarOverlayProps> = ({
  roomCode, joinUrl, currentSong, banners, onOpenSettings
}) => (
  <aside className="absolute top-[clamp(0.5rem,1.5vh,1rem)] right-[clamp(0.5rem,1.5vw,1rem)] z-40 flex flex-col items-end gap-1 w-[clamp(88px,8.5vw,130px)] pointer-events-none transition-all">
    <div className="flex justify-end pointer-events-auto">
      <button
        type="button"
        onClick={onOpenSettings}
        title="Configuración de pantalla"
        className="p-1 rounded-lg bg-black/40 hover:bg-black/70 text-zinc-400 hover:text-white border border-white/10 transition-colors"
      >
        <Settings className="w-3 h-3" />
      </button>
    </div>
    <div className="pointer-events-auto">
      <TvFloatingQr roomCode={roomCode} joinUrl={joinUrl} currentSongId={currentSong?.id} />
    </div>
    <TvPromoTicker banners={banners} roomCode={roomCode} />
    <TvDedicationBanner currentSong={currentSong} />
  </aside>
);
