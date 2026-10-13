import type { FC } from 'react';
import { TvPromoTicker } from './TvPromoTicker';
import { TvDedicationBanner } from './TvDedicationBanner';
import type { PromoBanner, QueueItem } from '../../types';

interface TvSidebarOverlayProps {
  roomCode: string;
  currentSong: QueueItem | null;
  banners: PromoBanner[];
}

export const TvSidebarOverlay: FC<TvSidebarOverlayProps> = ({
  roomCode, currentSong, banners,
}) => {
  if (!currentSong) return null;
  return (
    <aside className="absolute top-[clamp(3.5rem,5vh,4.5rem)] right-[clamp(0.5rem,1.5vw,1rem)] z-40 flex flex-col items-end gap-1 w-[clamp(170px,15vw,220px)] pointer-events-none transition-all">
      <TvPromoTicker banners={banners} roomCode={roomCode} />
      <TvDedicationBanner currentSong={currentSong} />
    </aside>
  );
};
