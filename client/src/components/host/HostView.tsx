import { useState, useRef, useEffect, type FC } from 'react';
import { ListMusic } from 'lucide-react';
import { useTvRealtime } from '../../hooks/useTvRealtime';
import { supabase } from '../../lib/supabaseClient';
import { HostAuth } from './HostAuth';
import { HostHeader } from './HostHeader';
import { HostNowPlayingCard } from './HostNowPlayingCard';
import { HostQueueItem } from './HostQueueItem';
import { HostTransportBar } from './HostTransportBar';
import { HostResetQueueModal } from './HostResetQueueModal';
import { HostGuestManagerModal } from './HostGuestManagerModal';
import { HostDeleteSongModal } from './HostDeleteSongModal';
import { HostSettingsModal } from './HostSettingsModal';
import { sendRemoteCommand, reorderQueueItem, purgeGuestSongs, deleteQueueItem, resetRoomQueue } from '../../services/karaokeApi';
import type { QueueItem } from '../../types';

export const HostView: FC<{ roomCode?: string }> = ({ roomCode = 'FIESTA' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem(`host_auth_${roomCode}`) === 'true');
  const [isOwner, setIsOwner] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [volume, setVolume] = useState(100);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [songToDelete, setSongToDelete] = useState<QueueItem | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const draggedIndexRef = useRef<number | null>(null);

  const { room, currentSong, nextSongs, handleNextSong, refreshState } = useTvRealtime(roomCode);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setIsOwner(true); setOwnerEmail(data.user.email); setIsAuthenticated(true);
        sessionStorage.setItem(`host_auth_${roomCode}`, 'true');
      }
    });
  }, [roomCode]);

  const handleAuth = (asOwner = false, email?: string) => {
    sessionStorage.setItem(`host_auth_${roomCode}`, 'true');
    if (asOwner) { setIsOwner(true); if (email) setOwnerEmail(email); }
    setIsAuthenticated(true);
  };

  const handleCommand = (cmd: 'play' | 'pause' | 'skip' | 'volume' | 'seek', payload: Record<string, unknown> = {}) => {
    if (room) sendRemoteCommand(room.id, cmd, payload);
  };

  const handleDrop = async (targetIndex: number) => {
    const src = draggedIndexRef.current;
    if (src !== null && src !== targetIndex && room) {
      await reorderQueueItem(room.id, nextSongs[src].id, targetIndex + 1); refreshState();
    }
    draggedIndexRef.current = null;
  };

  if (!isAuthenticated) return <HostAuth expectedPin={room?.host_pin || '1234'} roomCode={roomCode} onAuthenticated={handleAuth} />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col max-w-lg mx-auto pb-28 pt-12 px-4 select-none">
      <HostHeader roomCode={roomCode} isOwner={isOwner} onOpenGuests={() => setShowGuestModal(true)} onOpenReset={() => setShowResetModal(true)} onOpenSettings={() => setShowSettingsModal(true)} />
      <section className="mb-4"><HostNowPlayingCard currentSong={currentSong} currentTime={room?.current_time_seconds || 0} onSkip={handleNextSong} /></section>
      <section className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">
          <ListMusic className="w-4 h-4 text-purple-400" /><span>Cola ({nextSongs.length})</span>
        </div>
        {nextSongs.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs bg-zinc-900/40 rounded-2xl border border-zinc-800/50">Cola vacía.</div>
        ) : (
          nextSongs.map((item, idx) => (
            <HostQueueItem
              key={item.id} item={item} index={idx} totalItems={nextSongs.length}
              onMoveToNext={async (id) => { if (room) { await reorderQueueItem(room.id, id, 1); refreshState(); } }}
              onMoveUp={async (id, pos) => { if (room) { await reorderQueueItem(room.id, id, pos - 1); refreshState(); } }}
              onMoveDown={async (id, pos) => { if (room) { await reorderQueueItem(room.id, id, pos + 1); refreshState(); } }}
              onDelete={setSongToDelete} onDragStart={(_, i) => { draggedIndexRef.current = i; }}
              onDragOver={(e) => e.preventDefault()} onDrop={(_, tIdx) => handleDrop(tIdx)}
            />
          ))
        )}
      </section>
      <HostResetQueueModal isOpen={showResetModal} isResetting={isResetting} onConfirm={async () => { if (room) { setIsResetting(true); await resetRoomQueue(room.id); setIsResetting(false); setShowResetModal(false); refreshState(); } }} onClose={() => setShowResetModal(false)} />
      <HostGuestManagerModal isOpen={showGuestModal} queue={nextSongs} onPurgeGuest={async (gid) => { if (room) await purgeGuestSongs(room.id, gid); refreshState(); setShowGuestModal(false); }} onClose={() => setShowGuestModal(false)} />
      <HostDeleteSongModal item={songToDelete} onConfirm={async () => { if (songToDelete) await deleteQueueItem(songToDelete.id); setSongToDelete(null); refreshState(); }} onClose={() => setSongToDelete(null)} />
      <HostSettingsModal isOpen={showSettingsModal} room={room} ownerEmail={ownerEmail} onClose={() => setShowSettingsModal(false)} onSaved={refreshState} />
      <HostTransportBar isPlaying={room?.is_playing || false} volume={volume} onPlayPause={() => handleCommand(room?.is_playing ? 'pause' : 'play')} onSkip={handleNextSong} onSeek={(sec) => handleCommand('seek', { seconds: (room?.current_time_seconds || 0) + sec })} onVolumeChange={(v) => { setVolume(v); handleCommand('volume', { volume: v }); }} />
    </div>
  );
};
