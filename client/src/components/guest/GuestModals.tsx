import type { FC } from 'react';
import { GuestSongConfirmModal } from './GuestSongConfirmModal';
import { GuestMercadoPagoModal } from './GuestMercadoPagoModal';
import { GuestCancelSongModal } from './GuestCancelSongModal';
import { GuestReplaceSongModal } from './GuestReplaceSongModal';
import { GuestGeoBlockedModal } from './GuestGeoBlockedModal';
import { GuestBoostModal } from './GuestBoostModal';
import type { SearchResultItem, QueueItem } from '../../types';

interface GuestModalsProps {
  songToConfirm: SearchResultItem | null;
  pendingVipItem: { item: SearchResultItem; dedication: string | null; amount?: number } | null;
  songToCancel: QueueItem | null;
  songToReplace: QueueItem | null;
  songToBoost: QueueItem | null;
  geoBlockedDist: number | undefined;
  guestName: string;
  canRequestVip: boolean;
  highestVipAmount: number;
  vipPriceArs?: number;
  onConfirmSong: (dedication: string | null, isVip: boolean, vipAmount?: number) => void;
  onConfirmVipPayment: () => void;
  onProceedBoostPayment: (amount: number) => void;
  onCloseConfirm: () => void;
  onCloseMp: () => void;
  onCloseBoost: () => void;
  onConfirmCancel: () => void;
  onCloseCancel: () => void;
  onReplace: (songId: string, item: SearchResultItem) => Promise<void>;
  onCloseReplace: () => void;
  onCloseGeoBlocked: () => void;
}

export const GuestModals: FC<GuestModalsProps> = ({
  songToConfirm, pendingVipItem, songToCancel, songToReplace, songToBoost, geoBlockedDist,
  guestName, canRequestVip, highestVipAmount, vipPriceArs, onConfirmSong, onConfirmVipPayment, onProceedBoostPayment, onCloseConfirm,
  onCloseMp, onCloseBoost, onConfirmCancel, onCloseCancel, onReplace, onCloseReplace, onCloseGeoBlocked,
}) => {
  return (
    <>
      <GuestSongConfirmModal isOpen={Boolean(songToConfirm)} song={songToConfirm} guestName={guestName} canRequestVip={canRequestVip} highestVipAmount={highestVipAmount} onConfirm={onConfirmSong} onClose={onCloseConfirm} />
      <GuestBoostModal isOpen={Boolean(songToBoost)} song={songToBoost} highestVipAmount={highestVipAmount} onProceedToPayment={onProceedBoostPayment} onClose={onCloseBoost} />
      <GuestMercadoPagoModal isOpen={Boolean(pendingVipItem)} songTitle={pendingVipItem?.item.title || ''} priceArs={pendingVipItem?.amount || vipPriceArs} onConfirmPayment={onConfirmVipPayment} onClose={onCloseMp} />
      <GuestCancelSongModal isOpen={Boolean(songToCancel)} songTitle={songToCancel?.title || ''} onConfirm={onConfirmCancel} onCancel={onCloseCancel} />
      <GuestReplaceSongModal isOpen={Boolean(songToReplace)} targetSong={songToReplace} onClose={onCloseReplace} onReplace={onReplace} />
      <GuestGeoBlockedModal isOpen={geoBlockedDist !== undefined} distanceMeters={geoBlockedDist} onClose={onCloseGeoBlocked} />
    </>
  );
};
