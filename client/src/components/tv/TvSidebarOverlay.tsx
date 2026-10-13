import type { FC } from 'react';
import { Settings } from 'lucide-react';
import { TvPromoTicker } from './TvPromoTicker';
import { TvDedicationBanner } from './TvDedicationBanner';
import type { PromoBanner, QueueItem } from '../../types';

interface TvSidebarOverlayProps {
  roomCode: string;
  currentSong: QueueItem | null;
  banners: PromoBanner[];
  onOpenSettings?: () => void;
}

export const TvSidebarOverlay: FC<TvSidebarOverlayProps> = ({
  roomCode, currentSong, banners, onOpenSettings,
}) => {
  return (
    <aside className="absolute top-[clamp(0.5rem,1.5vh,1rem)] right-[clamp(0.5rem,1.5vw,1rem)] z-40 flex flex-col items-end gap-2 pointer-events-none transition-all">
      {onOpenSettings && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenSettings();
          }}
          title="Configuración, QR Administrador y Salir"
          aria-label="Abrir configuración y QR Administrador"
          className="pointer-events-auto p-2 rounded-xl bg-black/60 hover:bg-black/85 border border-white/20 text-white/80 hover:text-white backdrop-blur-md shadow-lg transition-all active:scale-90 cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}
      {currentSong && (
        <div className="flex flex-col items-end gap-1 w-[clamp(170px,15vw,220px)]">
          <TvPromoTicker banners={banners} roomCode={roomCode} />
          <TvDedicationBanner currentSong={currentSong} />
        </div>
      )}
    </aside>
  );
};
