import { useState, useRef, useEffect, type FC } from 'react';
import { ListMusic } from 'lucide-react';
import { useTvRealtime } from '../../hooks/useTvRealtime';
import { supabase } from '../../lib/supabaseClient';
import { HostAuth } from './HostAuth'; import { HostHeader } from './HostHeader';
import { HostNowPlayingCard } from './HostNowPlayingCard'; import { HostQueueItem } from './HostQueueItem';
import { HostTransportBar } from './HostTransportBar'; import { HostMultiRoomBar } from './multiroom/HostMultiRoomBar';
import { HostModals } from './HostModals'; import { HostPendingApprovalView } from './HostPendingApprovalView';
import { HostEmptyQueueCard } from './HostEmptyQueueCard';
import { sendRemoteCommand, reorderQueueItem, purgeGuestSongs, deleteQueueItem, resetRoomQueue, updateRoomBanners, toggleQueueLock, getRoomsForOwner, updatePlaybackTick, updateRoomSettings, advanceNextSong } from '../../services/karaokeApi';
import { enqueueAutoDjSong } from '../../services/autoDjService'; import { setLocalAutoDjActive } from '../../services/autoDjStateService'; import { getLocalRentalSession } from '../../services/rentalService';
import type { QueueItem, KaraokeRoom, RoomRentalSession } from '../../types';

const SUPER_ADMINS = (import.meta.env.VITE_SUPER_ADMIN_EMAILS || 'satacada@gmail.com,david@gmail.com,admin@karaoke.com').toLowerCase().split(',').map((s: string) => s.trim());

export const HostView: FC<{ roomCode?: string; onSwitchToTv?: () => void; onSwitchToGuest?: () => void }> = ({ roomCode = 'FIESTA', onSwitchToTv, onSwitchToGuest }) => {
  const [activeCode, setActiveCode] = useState(roomCode);
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem(`host_auth_${roomCode}`) === 'true' || localStorage.getItem(`host_auth_${roomCode}`) === 'true' || localStorage.getItem('rockola_is_admin_device') === 'true');
  const [isOwner, setIsOwner] = useState(false); const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null); const [ownerRooms, setOwnerRooms] = useState<KaraokeRoom[]>([]);
  const [volume, setVolume] = useState(100); const [isPlaying, setIsPlaying] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'blue' | 'neon' | 'light'>(() => (localStorage.getItem('host_theme') as 'dark' | 'blue' | 'neon' | 'light') || 'dark');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>(() => (localStorage.getItem('host_font_size') as 'normal' | 'large' | 'xl') || 'normal');
  const [showResetModal, setShowResetModal] = useState(false); const [showGuestModal, setShowGuestModal] = useState(false); const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false); const [showBannersModal, setShowBannersModal] = useState(false); const [showMasterHubModal, setShowMasterHubModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false); const [roomToTransfer, setRoomToTransfer] = useState<KaraokeRoom | null>(null); const [songToDelete, setSongToDelete] = useState<QueueItem | null>(null);
  const [isResetting, setIsResetting] = useState(false); const [showAutoDjModal, setShowAutoDjModal] = useState(false); const [showRentalModal, setShowRentalModal] = useState(false);
  const [isStartingAutoDj, setIsStartingAutoDj] = useState(false); const [rentalSession, setRentalSession] = useState<RoomRentalSession | null>(() => getLocalRentalSession(activeCode));
  const [showPairTvModal, setShowPairTvModal] = useState(() => Boolean(new URLSearchParams(window.location.search).get('pair'))); const [pairCode] = useState(() => new URLSearchParams(window.location.search).get('pair') || '');
  const draggedIndexRef = useRef<number | null>(null);

  const { room, currentSong, nextSongs, handleNextSong, refreshState } = useTvRealtime(activeCode);
  const isSuperAdmin = Boolean(ownerEmail && SUPER_ADMINS.includes(ownerEmail.toLowerCase()));

  useEffect(() => { if (room?.is_playing !== undefined) setIsPlaying(room.is_playing); }, [room?.is_playing]);

  const loadOwnerRooms = async (email: string) => { const r = await getRoomsForOwner(email); setOwnerRooms(r); };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setIsOwner(true); setOwnerEmail(data.user.email);
        const name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email.split('@')[0];
        setUserName(name); setIsAuthenticated(true); sessionStorage.setItem(`host_auth_${activeCode}`, 'true'); localStorage.setItem(`host_auth_${activeCode}`, 'true'); localStorage.setItem('rockola_is_admin_device', 'true'); loadOwnerRooms(data.user.email);
      } else { loadOwnerRooms('all'); }
    });
  }, [activeCode]);

  const handleAuth = (asOwner = false, email?: string) => {
    sessionStorage.setItem(`host_auth_${activeCode}`, 'true'); localStorage.setItem(`host_auth_${activeCode}`, 'true'); localStorage.setItem('rockola_is_admin_device', 'true');
    if (asOwner) { setIsOwner(true); if (email) { setOwnerEmail(email); setUserName(email.split('@')[0]); loadOwnerRooms(email); } }
    else { loadOwnerRooms('all'); }
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut(); sessionStorage.removeItem(`host_auth_${activeCode}`); localStorage.removeItem(`host_auth_${activeCode}`); localStorage.removeItem('rockola_is_admin_device');
    setIsAuthenticated(false); setIsOwner(false); setOwnerEmail(null); setUserName(null);
  };

  const handleCommand = (cmd: 'play' | 'pause' | 'skip' | 'volume' | 'seek', payload: Record<string, unknown> = {}) => {
    if (room) sendRemoteCommand(room.id, cmd, payload);
  };

  const handleStartAutoDj = async () => {
    if (!room || isStartingAutoDj) return;
    setIsStartingAutoDj(true);
    try {
      const targetGenre = room.auto_dj_genre || 'rock_nacional';
      setLocalAutoDjActive(activeCode, true, targetGenre);
      supabase.channel(`tv-room-${room.id}`).send({ type: 'broadcast', event: 'set_auto_dj', payload: { enabled: true, genre: targetGenre } }).catch(() => {});
      await updateRoomSettings(room.id, { is_playing: true });
      if (!currentSong && nextSongs.length === 0) { const ok = await enqueueAutoDjSong(room.id, targetGenre); if (ok) await advanceNextSong(room.id); }
      else if (!currentSong && nextSongs.length > 0) { await advanceNextSong(room.id); }
      await refreshState();
    } catch (err) { console.error('Error starting Auto-DJ from host:', err); }
    finally { setIsStartingAutoDj(false); }
  };

  const handleTogglePlayPause = () => {
    if (!currentSong && nextSongs.length === 0) { handleStartAutoDj(); return; }
    const nextPlaying = !isPlaying; setIsPlaying(nextPlaying); handleCommand(nextPlaying ? 'play' : 'pause');
    if (room) updatePlaybackTick(room.id, nextPlaying, room.current_time_seconds || 0).catch(() => {});
  };

  const handleDrop = async (targetIndex: number) => {
    const src = draggedIndexRef.current;
    if (src !== null && src !== targetIndex && room) { await reorderQueueItem(room.id, nextSongs[src].id, targetIndex + 1); refreshState(); }
    draggedIndexRef.current = null;
  };

  if (!isAuthenticated) return <HostAuth expectedPin={room?.host_pin || '1234'} roomCode={activeCode} onAuthenticated={handleAuth} />;
  if (room && room.is_approved === false && !isSuperAdmin) {
    return <HostPendingApprovalView roomCode={activeCode} businessName={room.business_name || room.name} ownerEmail={ownerEmail || 'No asignado'} onLoggedOut={handleLogout} />;
  }

  const handleToggleTheme = () => { const next = theme === 'dark' ? 'blue' : theme === 'blue' ? 'neon' : theme === 'neon' ? 'light' : 'dark'; setTheme(next); try { localStorage.setItem('host_theme', next); } catch {} };
  const handleToggleFontSize = () => { const next = fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'xl' : 'normal'; setFontSize(next); try { localStorage.setItem('host_font_size', next); } catch {} };

  return (
    <div className={`theme-${theme} font-scale-${fontSize} min-h-screen bg-zinc-950 text-zinc-100 flex flex-col max-w-lg mx-auto pb-32 pt-2 px-3 sm:px-4 select-none transition-colors duration-200`}>
      {ownerRooms.length > 1 && <HostMultiRoomBar rooms={ownerRooms} currentRoomId={room?.id || ''} onSelectRoom={(r) => setActiveCode(r.room_code)} onOpenMasterHub={() => setShowMasterHubModal(true)} onOpenCreateRoom={() => setShowCreateRoomModal(true)} />}
      <HostHeader roomCode={activeCode} zoneName={room?.zone_name} isOwner={isOwner} isSuperAdmin={isSuperAdmin} isQueueLocked={Boolean(room?.is_queue_locked)} isAutoDjActive={Boolean(room?.auto_dj_enabled)} userName={userName} ownerEmail={ownerEmail} currentTheme={theme} onToggleTheme={handleToggleTheme} currentFontSize={fontSize} onToggleFontSize={handleToggleFontSize} onLogout={handleLogout} onToggleQueueLock={async () => { if (room) { await toggleQueueLock(room.id, !room.is_queue_locked); refreshState(); } }} onOpenGuests={() => setShowGuestModal(true)} onOpenReset={() => setShowResetModal(true)} onOpenSettings={() => setShowSettingsModal(true)} onOpenSuperAdmin={() => setShowSuperAdminModal(true)} onOpenBanners={() => setShowBannersModal(true)} onOpenAutoDj={() => setShowAutoDjModal(true)} onOpenMasterHub={() => setShowMasterHubModal(true)} onSwitchToTv={onSwitchToTv} onSwitchToGuest={onSwitchToGuest} onOpenRental={() => setShowRentalModal(true)} isRentalActive={Boolean(rentalSession?.enabled)} />
      <section className="mb-4"><HostNowPlayingCard currentSong={currentSong} currentTime={room?.current_time_seconds || 0} onSkip={handleNextSong} /></section>
      <section className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1"><ListMusic className="w-4 h-4 text-purple-400" /><span>Cola ({nextSongs.length})</span></div>
        {nextSongs.length === 0 ? (
          <HostEmptyQueueCard room={room} onOpenAutoDj={() => setShowAutoDjModal(true)} onStartAutoDj={!currentSong ? handleStartAutoDj : undefined} isStartingAutoDj={isStartingAutoDj} />
        ) : nextSongs.map((item, idx) => (
          <HostQueueItem key={item.id} item={item} index={idx} totalItems={nextSongs.length} onMoveToNext={async (id) => { if (room) { await reorderQueueItem(room.id, id, 1); refreshState(); } }} onMoveUp={async (id, pos) => { if (room) { await reorderQueueItem(room.id, id, pos - 1); refreshState(); } }} onMoveDown={async (id, pos) => { if (room) { await reorderQueueItem(room.id, id, pos + 1); refreshState(); } }} onDelete={setSongToDelete} onDragStart={(_, i) => { draggedIndexRef.current = i; }} onDragOver={(e) => e.preventDefault()} onDrop={(_, tIdx) => handleDrop(tIdx)} />
        ))}
      </section>
      <HostModals showResetModal={showResetModal} isResetting={isResetting} onConfirmReset={async () => { if (room) { setIsResetting(true); await resetRoomQueue(room.id); setIsResetting(false); setShowResetModal(false); refreshState(); } }} onCloseReset={() => setShowResetModal(false)} showGuestModal={showGuestModal} nextSongs={nextSongs} onPurgeGuest={async (gid) => { if (room) await purgeGuestSongs(room.id, gid); refreshState(); setShowGuestModal(false); }} onCloseGuest={() => setShowGuestModal(false)} songToDelete={songToDelete} onConfirmDeleteSong={async () => { if (songToDelete) await deleteQueueItem(songToDelete.id); setSongToDelete(null); refreshState(); }} onCloseDeleteSong={() => setSongToDelete(null)} showSettingsModal={showSettingsModal} room={room} ownerEmail={ownerEmail} onCloseSettings={() => setShowSettingsModal(false)} onSavedSettings={refreshState} showSuperAdminModal={showSuperAdminModal} onCloseSuperAdmin={() => setShowSuperAdminModal(false)} onUpdatedSuperAdmin={refreshState} showBannersModal={showBannersModal} onCloseBanners={() => setShowBannersModal(false)} onSaveBanners={async (b) => { if (room) await updateRoomBanners(room.id, b); refreshState(); setShowBannersModal(false); }} showMasterHubModal={showMasterHubModal} ownerRooms={ownerRooms} onCloseMasterHub={() => setShowMasterHubModal(false)} onRefreshMasterHub={() => { refreshState(); if (ownerEmail) loadOwnerRooms(ownerEmail); }} onOpenTransfer={(r) => setRoomToTransfer(r)} onOpenCreateRoom={() => setShowCreateRoomModal(true)} showCreateRoomModal={showCreateRoomModal} onCloseCreateRoom={() => setShowCreateRoomModal(false)} onCreatedRoom={(newR) => { if (ownerEmail) loadOwnerRooms(ownerEmail); setActiveCode(newR.room_code); }} roomToTransfer={roomToTransfer} onCloseTransfer={() => setRoomToTransfer(null)} onTransferred={() => { refreshState(); if (ownerEmail) loadOwnerRooms(ownerEmail); }} showAutoDjModal={showAutoDjModal} onCloseAutoDj={() => setShowAutoDjModal(false)} onUpdatedAutoDj={refreshState} showPairTvModal={showPairTvModal} initialTvCode={pairCode} onOpenPairTv={() => setShowPairTvModal(true)} onClosePairTv={() => { setShowPairTvModal(false); if (window.location.search.includes('pair=')) window.history.replaceState({}, '', window.location.pathname); }} onPairedTv={(c) => { setActiveCode(c); refreshState(); if (window.location.search.includes('pair=')) window.history.replaceState({}, '', window.location.pathname); }} showRentalModal={showRentalModal} onCloseRental={() => setShowRentalModal(false)} onRentalUpdated={(s) => setRentalSession(s)} />
      <HostTransportBar isPlaying={isPlaying} volume={volume} onPlayPause={handleTogglePlayPause} onSkip={handleNextSong} onSeek={(sec) => handleCommand('seek', { seconds: (room?.current_time_seconds || 0) + sec })} onVolumeChange={(v) => { setVolume(v); handleCommand('volume', { volume: v }); }} />
    </div>
  );
};
