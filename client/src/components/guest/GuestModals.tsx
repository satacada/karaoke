import type { FC } from 'react';
import { GuestSongConfirmModal } from './GuestSongConfirmModal';
import { GuestMercadoPagoModal } from './GuestMercadoPagoModal';
import { GuestCancelSongModal } from './GuestCancelSongModal';
import { GuestReplaceSongModal } from './GuestReplaceSongModal';
import { GuestGeoBlockedModal } from './GuestGeoBlockedModal';
import type { SearchResultItem, QueueItem } from '../../types';

interface GuestModalsProps {
  songToConfirm: SearchResultItem | null;
  pendingVipItem: { item: SearchResultItem; dedication: string | null } | null;
  songToCancel: QueueItem | null;
  songToReplace: QueueItem | null;
  geoBlockedDist: number | undefined;
  guestName: string;
  canRequestVip: boolean;
  vipPriceArs?: number;
  onConfirmSong: (dedication: string | null, isVip: boolean) => void;
  onConfirmVipPayment: () => void;
  onCloseConfirm: () => void;
  onCloseMp: () => void;
  onConfirmCancel: () => void;
  onCloseCancel: () => void;
  onReplace: (songId: string, item: SearchResultItem) => Promise<void>;
  onCloseReplace: () => void;
  onCloseGeoBlocked: () => void;
}

export const GuestModals: FC<GuestModalsProps> = ({
  songToConfirm, pendingVipItem, songToCancel, songToReplace, geoBlockedDist,
  guestName, canRequestVip, vipPriceArs, onConfirmSong, onConfirmVipPayment, onCloseConfirm,
  onCloseMp, onConfirmCancel, onCloseCancel, onReplace, onCloseReplace, onCloseGeoBlocked,
}) => {
  return (
    <>
      <GuestSongConfirmModal
        isOpen={Boolean(songToConfirm)}
        song={songToConfirm}
        guestName={guestName}
        canRequestVip={canRequestVip}
        onConfirm={onConfirmSong}
        onClose={onCloseConfirm}
      />
      <GuestMercadoPagoModal
        isOpen={Boolean(pendingVipItem)}
        songTitle={pendingVipItem?.item.title || ''}
        priceArs={vipPriceArs}
        onConfirmPayment={onConfirmVipPayment}
        onClose={onCloseMp}
      />
      <GuestCancelSongModal
        isOpen={Boolean(songToCancel)}
        songTitle={songToCancel?.title || ''}
        onConfirm={onConfirmCancel}
        onCancel={onCloseCancel}
      />
      <GuestReplaceSongModal
        isOpen={Boolean(songToReplace)}
        targetSong={songToReplace}
        onClose={onCloseReplace}
        onReplace={onReplace}
      />
      <GuestGeoBlockedModal
        isOpen={geoBlockedDist !== undefined}
        distanceMeters={geoBlockedDist}
        onClose={onCloseGeoBlocked}
      />
    </>
  );
};
