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
  <aside className="absolute top-12 right-2 sm:top-6 sm:right-6 z-40 flex flex-col gap-2 w-44 xs:w-52 sm:w-64 pointer-events-none transition-all">
    <div className="flex justify-end pointer-events-auto">
      <button
        type="button"
        onClick={onOpenSettings}
        title="Configuración de pantalla"
        className="p-1.5 rounded-xl bg-black/50 hover:bg-black/80 text-zinc-400 hover:text-white border border-white/10 transition-colors"
      >
        <Settings className="w-3.5 h-3.5" />
      </button>
    </div>
    <div className="pointer-events-auto">
      <TvFloatingQr roomCode={roomCode} joinUrl={joinUrl} currentSongId={currentSong?.id} />
    </div>
    <TvPromoTicker banners={banners} roomCode={roomCode} />
    <TvDedicationBanner currentSong={currentSong} />
  </aside>
);
