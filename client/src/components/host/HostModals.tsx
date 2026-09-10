import type { FC } from 'react';
import { HostResetQueueModal } from './HostResetQueueModal';
import { HostGuestManagerModal } from './HostGuestManagerModal';
import { HostDeleteSongModal } from './HostDeleteSongModal';
import { HostSettingsModal } from './HostSettingsModal';
import { SuperAdminApprovalModal } from './SuperAdminApprovalModal';
import { HostBannersModal } from './HostBannersModal';
import { HostMasterHubModal } from './multiroom/HostMasterHubModal';
import { HostCreateRoomModal } from './multiroom/HostCreateRoomModal';
import { HostTransferQueueModal } from './multiroom/HostTransferQueueModal';
import { HostAutoDjModal } from './HostAutoDjModal';
import { HostPairTvModal } from './HostPairTvModal';
import type { KaraokeRoom, QueueItem, PromoBanner } from '../../types';

interface HostModalsProps {
  showResetModal: boolean; isResetting: boolean; onConfirmReset: () => void; onCloseReset: () => void;
  showGuestModal: boolean; nextSongs: QueueItem[]; onPurgeGuest: (guestId: string) => void; onCloseGuest: () => void;
  songToDelete: QueueItem | null; onConfirmDeleteSong: () => void; onCloseDeleteSong: () => void;
  showSettingsModal: boolean; room: KaraokeRoom | null; ownerEmail?: string | null; onCloseSettings: () => void; onSavedSettings: () => void;
  showSuperAdminModal: boolean; onCloseSuperAdmin: () => void; onUpdatedSuperAdmin: () => void;
  showBannersModal: boolean; onCloseBanners: () => void; onSaveBanners: (banners: PromoBanner[]) => Promise<void>;
  showMasterHubModal: boolean; ownerRooms: KaraokeRoom[]; onCloseMasterHub: () => void; onRefreshMasterHub: () => void;
  onOpenTransfer: (room: KaraokeRoom) => void; onOpenCreateRoom: () => void;
  showCreateRoomModal: boolean; onCloseCreateRoom: () => void; onCreatedRoom: (newRoom: KaraokeRoom) => void;
  roomToTransfer: KaraokeRoom | null; onCloseTransfer: () => void; onTransferred: () => void;
  showAutoDjModal?: boolean; onCloseAutoDj?: () => void; onUpdatedAutoDj?: () => void;
  showPairTvModal?: boolean; initialTvCode?: string; onOpenPairTv?: () => void; onClosePairTv?: () => void; onPairedTv?: (roomCode: string) => void;
}

export const HostModals: FC<HostModalsProps> = ({
  showResetModal, isResetting, onConfirmReset, onCloseReset,
  showGuestModal, nextSongs, onPurgeGuest, onCloseGuest,
  songToDelete, onConfirmDeleteSong, onCloseDeleteSong,
  showSettingsModal, room, ownerEmail, onCloseSettings, onSavedSettings,
  showSuperAdminModal, onCloseSuperAdmin, onUpdatedSuperAdmin,
  showBannersModal, onCloseBanners, onSaveBanners,
  showMasterHubModal, ownerRooms, onCloseMasterHub, onRefreshMasterHub,
  onOpenTransfer, onOpenCreateRoom, showCreateRoomModal, onCloseCreateRoom, onCreatedRoom,
  roomToTransfer, onCloseTransfer, onTransferred,
  showAutoDjModal = false, onCloseAutoDj = () => {}, onUpdatedAutoDj = () => {},
  showPairTvModal = false, initialTvCode = '', onOpenPairTv = () => {}, onClosePairTv = () => {}, onPairedTv = () => {},
}) => {
  return (
    <>
      <HostResetQueueModal isOpen={showResetModal} isResetting={isResetting} onConfirm={onConfirmReset} onClose={onCloseReset} />
      <HostGuestManagerModal isOpen={showGuestModal} queue={nextSongs} onPurgeGuest={onPurgeGuest} onClose={onCloseGuest} />
      <HostDeleteSongModal item={songToDelete} onConfirm={onConfirmDeleteSong} onClose={onCloseDeleteSong} />
      <HostSettingsModal isOpen={showSettingsModal} room={room} ownerEmail={ownerEmail} onClose={onCloseSettings} onSaved={onSavedSettings} />
      <SuperAdminApprovalModal isOpen={showSuperAdminModal} superAdminEmail={ownerEmail || 'SuperAdmin'} onClose={onCloseSuperAdmin} onUpdated={onUpdatedSuperAdmin} />
      <HostBannersModal isOpen={showBannersModal} banners={room?.promo_banners || []} onClose={onCloseBanners} onSave={onSaveBanners} />
      <HostMasterHubModal isOpen={showMasterHubModal} rooms={ownerRooms} ownerEmail={ownerEmail} onClose={onCloseMasterHub} onRefresh={onRefreshMasterHub} onOpenTransfer={onOpenTransfer} onOpenCreateRoom={onOpenCreateRoom} onOpenPairTv={onOpenPairTv} />
      <HostCreateRoomModal isOpen={showCreateRoomModal} ownerEmail={ownerEmail || ''} businessName={room?.business_name || room?.name || 'Mi Local'} onClose={onCloseCreateRoom} onCreated={onCreatedRoom} />
      {roomToTransfer && (
        <HostTransferQueueModal isOpen={Boolean(roomToTransfer)} sourceRoom={roomToTransfer} allRooms={ownerRooms} pendingQueueCount={nextSongs.length} onClose={onCloseTransfer} onTransferred={onTransferred} />
      )}
      <HostAutoDjModal isOpen={showAutoDjModal} room={room} onClose={onCloseAutoDj} onUpdated={onUpdatedAutoDj} />
      <HostPairTvModal isOpen={showPairTvModal} initialCode={initialTvCode} rooms={ownerRooms} onClose={onClosePairTv} onSuccess={onPairedTv} />
    </>
  );
};
