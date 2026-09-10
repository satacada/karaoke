import { type FC } from 'react';
import { TvSidebarOverlay } from './TvSidebarOverlay';
import { TvFloatingReactions } from './TvFloatingReactions';
import { TvUnlinkModal } from './TvUnlinkModal';
import type { QueueItem, PromoBanner } from '../../types';

interface TvViewOverlaysProps {
  roomCode: string;
  roomName?: string;
  joinUrl: string;
  currentSong: QueueItem | null;
  banners: PromoBanner[];
  showUnlinkModal: boolean;
  setShowUnlinkModal: (show: boolean) => void;
  onUnlink?: () => void;
}

export const TvViewOverlays: FC<TvViewOverlaysProps> = ({
  roomCode,
  roomName,
  joinUrl,
  currentSong,
  banners,
  showUnlinkModal,
  setShowUnlinkModal,
  onUnlink,
}) => {
  return (
    <>
      <TvSidebarOverlay
        roomCode={roomCode}
        joinUrl={joinUrl}
        currentSong={currentSong}
        banners={banners}
        onOpenSettings={() => setShowUnlinkModal(true)}
      />
      <TvFloatingReactions roomCode={roomCode} />
      <TvUnlinkModal
        isOpen={showUnlinkModal}
        roomCode={roomCode}
        roomName={roomName}
        onClose={() => setShowUnlinkModal(false)}
        onConfirmUnlink={() => {
          try { localStorage.removeItem('tv_paired_room'); } catch {}
          setShowUnlinkModal(false);
          onUnlink?.();
        }}
      />
    </>
  );
};
