import { type FC } from 'react';
import { TvSidebarOverlay } from './TvSidebarOverlay';
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
  onSwitchToHost?: () => void;
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
  onSwitchToHost,
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
      <TvUnlinkModal
        isOpen={showUnlinkModal}
        roomCode={roomCode}
        roomName={roomName}
        onClose={() => setShowUnlinkModal(false)}
        onSwitchToHost={onSwitchToHost}
        onConfirmUnlink={() => {
          try { localStorage.removeItem('tv_paired_room'); } catch {}
          setShowUnlinkModal(false);
          onUnlink?.();
        }}
      />
    </>
  );
};
