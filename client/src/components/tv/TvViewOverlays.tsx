import { type FC } from 'react';
import { TvSidebarOverlay } from './TvSidebarOverlay';
import type { QueueItem, PromoBanner } from '../../types';

interface TvViewOverlaysProps {
  roomCode: string;
  currentSong: QueueItem | null;
  banners: PromoBanner[];
}

export const TvViewOverlays: FC<TvViewOverlaysProps> = ({
  roomCode,
  currentSong,
  banners,
}) => {
  return (
    <TvSidebarOverlay
      roomCode={roomCode}
      currentSong={currentSong}
      banners={banners}
    />
  );
};
