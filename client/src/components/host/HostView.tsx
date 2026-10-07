import { useState, useRef, useEffect, type FC } from 'react';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { useTvRealtime } from '../../hooks/useTvRealtime'; import { supabase } from '../../lib/supabaseClient';
import { HostAuth } from './HostAuth'; import { HostHeader } from './HostHeader'; import { HostNowPlayingCard } from './HostNowPlayingCard'; import { HostQueueSection } from './HostQueueSection'; import { HostTransportBar } from './HostTransportBar'; import { HostMultiRoomBar } from './multiroom/HostMultiRoomBar'; import { HostModals } from './HostModals'; import { HostPendingApprovalView } from './HostPendingApprovalView';
import { sendRemoteCommand, reorderQueueItem, purgeGuestSongs, deleteQueueItem, resetRoomQueue, updateRoomBanners, toggleQueueLock, getRoomsForOwner, updatePlaybackTick, updateRoomSettings, advanceNextSong } from '../../services/karaokeApi';
import { enqueueAutoDjSong, purgeAutoDjSongs } from '../../services/autoDjService';
import { setLocalAutoDjActive, saveRemoteAutoDjSettings, getLocalAutoDjGenre } from '../../services/autoDjStateService';
import { getLocalRentalSession } from '../../services/rentalService'; import { getRoomChannelName } from '../../utils/channelUtils'; import { logInfo, logError } from '../../services/loggerService';
import type { QueueItem, KaraokeRoom, RoomRentalSession } from '../../types';

const SUPER_ADMINS = (import.meta.env.VITE_SUPER_ADMIN_EMAILS || 'satacada@gmail.com,david@gmail.com,admin@karaoke.com').toLowerCase().split(',').map((s: string) => s.trim());

export const HostView: FC<{ roomCode?: string; onSwitchToTv?: () => void; onSwitchToGuest?: () => void }> = ({ roomCode = 'FIESTA', onSwitchToTv, onSwitchToGuest }) => {
  const [activeCode, setActiveCode] = useState(roomCode);
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem(`host_auth_${roomCode}`) === 'true' || localStorage.getItem(`host_auth_${roomCode}`) === 'true' || localStorage.getItem('rockola_is_admin_device') === 'true');
  const [isOwner, setIsOwner] = useState(false); const [ownerEmail, setOwnerEmail] = useState<string | null>(null); const [userName, setUserName] = useState<string | null>(null); const [ownerRooms, setOwnerRooms] = useState<KaraokeRoom[]>([]);
  const [volume, setVolume] = useState(100); const [isPlaying, setIsPlaying] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'blue' | 'neon' | 'light'>(() => (localStorage.getItem('host_theme') as 'dark' | 'blue' | 'neon' | 'light') || 'dark');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>(() => (localStorage.getItem('host_font_size') as 'normal' | 'large' | 'xl') || 'normal');
  const [showResetModal, setShowResetModal] = useState(false); const [showGuestModal, setShowGuestModal] = useState(false); const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false); const [showBannersModal, setShowBannersModal] = useState(false); const [showMasterHubModal, setShowMasterHubModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false); const [roomToTransfer, setRoomToTransfer] = useState<KaraokeRoom | null>(null); const [songToDelete, setSongToDelete] = useState<QueueItem | null>(null);
  const [isResetting, setIsResetting] = useState(false); const [showAutoDjModal, setShowAutoDjModal] = useState(false); const [showRentalModal, setShowRentalModal] = useState(false);
  const [isStartingAutoDj, setIsStartingAutoDj] = useState(false); const [rentalSession, setRentalSession] = useState<RoomRentalSession | null>(() => getLocalRentalSession(activeCode));
  const [showPairTvModal, setShowPairTvModal] = useState(() => Boolean(new URLSearchParams(window.location.search).get('pair'))); const [pairCode] = useState(() => new URLSearchParams(window.location.search).get('pair') || '');
  const [systemNotice, setSystemNotice] = useState<{ text: string; type: 'info' | 'success' | 'error' | 'loading' } | null>(null);
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
    if (asOwner) { setIsOwner(true); if (email) { setOwnerEmail(email); setUserName(email.split('@')[0]); loadOwnerRooms(email); } } else { loadOwnerRooms('all'); }
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut(); sessionStorage.removeItem(`host_auth_${activeCode}`); localStorage.removeItem(`host_auth_${activeCode}`); localStorage.removeItem('rockola_is_admin_device');
    setIsAuthenticated(false); setIsOwner(false); setOwnerEmail(null); setUserName(null);
  };

  const handleCommand = (cmd: 'play' | 'pause' | 'skip' | 'volume' | 'seek', payload: Record<string, unknown> = {}) => {
    if (room) sendRemoteCommand(room.id, cmd, payload);
  };

  const handleStartAutoDj = async (chosenGenre?: string) => {
    if (!room || isStartingAutoDj) return;
    setIsStartingAutoDj(true);
    const targetGenre = chosenGenre || room.auto_dj_genre || getLocalAutoDjGenre(activeCode) || 'cumbia_fiesta';
    setSystemNotice({ text: 'Conectando con la TV y cargando música...', type: 'loading' });
    logInfo(activeCode, 'host', 'start_autodj_attempt', `Iniciando estación: ${targetGenre}`);
    try {
      await saveRemoteAutoDjSettings(room.id, activeCode, true, targetGenre);
      await purgeAutoDjSongs(room.id);
      const ok = await enqueueAutoDjSong(room.id, targetGenre);
      if (ok) {
        await advanceNextSong(room.id); handleCommand('play');
        await enqueueAutoDjSong(room.id, targetGenre);
        await enqueueAutoDjSong(room.id, targetGenre);
        setSystemNotice({ text: '¡Música iniciada exitosamente en la TV! 🎶', type: 'success' });
        logInfo(activeCode, 'host', 'start_autodj_success', 'Canción encolada y avanzada a playing');
      } else { setSystemNotice({ text: 'Reintentando con catálogo garantizado...', type: 'info' }); }
      await refreshState();
    } catch (err) {
      setSystemNotice({ text: 'Error al iniciar música. Reintenta.', type: 'error' });
      logError(activeCode, 'host', 'start_autodj_error', 'Error iniciando Auto-DJ', { err: String(err) });
    } finally { setIsStartingAutoDj(false); setTimeout(() => setSystemNotice(null), 5000); }
  };

  const handleTogglePlayPause = () => {
    if (!currentSong && nextSongs.length === 0) {
      setShowAutoDjModal(true); setSystemNotice({ text: 'Cola vacía: selecciona una estación para dar tu visto bueno.', type: 'info' }); return;
    }
    const nextPlaying = !isPlaying; setIsPlaying(nextPlaying); handleCommand(nextPlaying ? 'play' : 'pause');
    if (room) updatePlaybackTick(room.id, nextPlaying, room.current_time_seconds || 0).catch(() => {});
  };

  const handleDrop = async (tIdx: number) => {
    const src = draggedIndexRef.current;
    if (src !== null && src !== tIdx && room) { await reorderQueueItem(room.id, nextSongs[src].id, tIdx + 1); refreshState(); }
    draggedIndexRef.current = null;
  };

  if (!isAuthenticated) return <HostAuth expectedPin={room?.host_pin || '1234'} roomCode={activeCode} onAuthenticated={handleAuth} />;
  if (room && room.is_approved === false && !isSuperAdmin) {
    return <HostPendingApprovalView roomCode={activeCode} businessName={room.business_name || room.name} ownerEmail={ownerEmail || 'No asignado'} onLoggedOut={handleLogout} />;
  }

  return (
    <div className={`theme-${theme} font-scale-${fontSize} min-h-screen bg-zinc-950 text-zinc-100 flex flex-col max-w-lg mx-auto pb-32 pt-2 px-3 sm:px-4 select-none transition-colors duration-200`}>
      {ownerRooms.length > 1 && <HostMultiRoomBar rooms={ownerRooms} currentRoomId={room?.id || ''} onSelectRoom={(r) => setActiveCode(r.room_code)} onOpenMasterHub={() => setShowMasterHubModal(true)} onOpenCreateRoom={() => setShowCreateRoomModal(true)} />}
      <HostHeader roomCode={activeCode} zoneName={room?.zone_name} isOwner={isOwner} isSuperAdmin={isSuperAdmin} isQueueLocked={Boolean(room?.is_queue_locked)} isAutoDjActive={Boolean(room?.auto_dj_enabled)} userName={userName} ownerEmail={ownerEmail} currentTheme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'blue' : theme === 'blue' ? 'neon' : theme === 'neon' ? 'light' : 'dark')} currentFontSize={fontSize} onToggleFontSize={() => setFontSize(fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'xl' : 'normal')} onLogout={handleLogout} onToggleQueueLock={async () => { if (room) { await toggleQueueLock(room.id, !room.is_queue_locked); refreshState(); } }} onOpenGuests={() => setShowGuestModal(true)} onOpenReset={() => setShowResetModal(true)} onOpenSettings={() => setShowSettingsModal(true)} onOpenSuperAdmin={() => setShowSuperAdminModal(true)} onOpenBanners={() => setShowBannersModal(true)} onOpenAutoDj={() => setShowAutoDjModal(true)} onOpenMasterHub={() => setShowMasterHubModal(true)} onSwitchToTv={onSwitchToTv} onSwitchToGuest={onSwitchToGuest} onOpenRental={() => setShowRentalModal(true)} isRentalActive={Boolean(rentalSession?.enabled)} />
      {systemNotice && (
        <div className={`mb-3 p-2.5 rounded-2xl text-xs font-bold flex items-center justify-between border shadow-lg ${systemNotice.type === 'error' ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' : systemNotice.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' : systemNotice.type === 'loading' ? 'bg-purple-950/90 border-purple-500/50 text-purple-200 animate-pulse' : 'bg-amber-950/90 border-amber-500/50 text-amber-200'}`}>
          <div className="flex items-center gap-2">{systemNotice.type === 'loading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : systemNotice.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}<span>{systemNotice.text}</span></div>
          <button type="button" onClick={() => setSystemNotice(null)} className="p-1 text-zinc-400 hover:text-white"><X className="w-3 h-3" /></button>
        </div>
      )}
      <section className="mb-4"><HostNowPlayingCard currentSong={currentSong} currentTime={room?.current_time_seconds || 0} onSkip={handleNextSong} /></section>
      <HostQueueSection room={room} currentSong={currentSong} nextSongs={nextSongs} isStartingAutoDj={isStartingAutoDj} onOpenAutoDj={() => setShowAutoDjModal(true)} onStartAutoDj={!currentSong ? () => handleStartAutoDj() : undefined} onStartGenre={(g) => handleStartAutoDj(g)} onMoveToNext={async (id) => { if (room) { await reorderQueueItem(room.id, id, 1); refreshState(); } }} onMoveUp={async (id, pos) => { if (room) { await reorderQueueItem(room.id, id, pos - 1); refreshState(); } }} onMoveDown={async (id, pos) => { if (room) { await reorderQueueItem(room.id, id, pos + 1); refreshState(); } }} onDelete={setSongToDelete} onDragStart={(_, i) => { draggedIndexRef.current = i; }} onDrop={(tIdx) => handleDrop(tIdx)} />
      <HostModals showResetModal={showResetModal} isResetting={isResetting} onConfirmReset={async () => { if (room) { setIsResetting(true); await resetRoomQueue(room.id); setIsResetting(false); setShowResetModal(false); refreshState(); } }} onCloseReset={() => setShowResetModal(false)} showGuestModal={showGuestModal} nextSongs={nextSongs} onPurgeGuest={async (gid) => { if (room) await purgeGuestSongs(room.id, gid); refreshState(); setShowGuestModal(false); }} onCloseGuest={() => setShowGuestModal(false)} songToDelete={songToDelete} onConfirmDeleteSong={async () => { if (songToDelete) await deleteQueueItem(songToDelete.id); setSongToDelete(null); refreshState(); }} onCloseDeleteSong={() => setSongToDelete(null)} showSettingsModal={showSettingsModal} room={room} ownerEmail={ownerEmail} onCloseSettings={() => setShowSettingsModal(false)} onSavedSettings={refreshState} showSuperAdminModal={showSuperAdminModal} onCloseSuperAdmin={() => setShowSuperAdminModal(false)} onUpdatedSuperAdmin={refreshState} showBannersModal={showBannersModal} onCloseBanners={() => setShowBannersModal(false)} onSaveBanners={async (b) => { if (room) await updateRoomBanners(room.id, b); refreshState(); setShowBannersModal(false); }} showMasterHubModal={showMasterHubModal} ownerRooms={ownerRooms} onCloseMasterHub={() => setShowMasterHubModal(false)} onRefreshMasterHub={() => { refreshState(); if (ownerEmail) loadOwnerRooms(ownerEmail); }} onOpenTransfer={(r) => setRoomToTransfer(r)} onOpenCreateRoom={() => setShowCreateRoomModal(true)} showCreateRoomModal={showCreateRoomModal} onCloseCreateRoom={() => setShowCreateRoomModal(false)} onCreatedRoom={(newR) => { if (ownerEmail) loadOwnerRooms(ownerEmail); setActiveCode(newR.room_code); }} roomToTransfer={roomToTransfer} onCloseTransfer={() => setRoomToTransfer(null)} onTransferred={() => { refreshState(); if (ownerEmail) loadOwnerRooms(ownerEmail); }} showAutoDjModal={showAutoDjModal} onCloseAutoDj={() => setShowAutoDjModal(false)} onUpdatedAutoDj={refreshState} showPairTvModal={showPairTvModal} initialTvCode={pairCode} onOpenPairTv={() => setShowPairTvModal(true)} onClosePairTv={() => { setShowPairTvModal(false); if (window.location.search.includes('pair=')) window.history.replaceState({}, '', window.location.pathname); }} onPairedTv={(c) => { setActiveCode(c); refreshState(); if (window.location.search.includes('pair=')) window.history.replaceState({}, '', window.location.pathname); }} showRentalModal={showRentalModal} onCloseRental={() => setShowRentalModal(false)} onRentalUpdated={(s) => setRentalSession(s)} />
      <HostTransportBar isPlaying={isPlaying} volume={volume} onPlayPause={handleTogglePlayPause} onSkip={handleNextSong} onSeek={(sec) => handleCommand('seek', { seconds: (room?.current_time_seconds || 0) + sec })} onVolumeChange={(v) => { setVolume(v); handleCommand('volume', { volume: v }); }} />
    </div>
  );
};
