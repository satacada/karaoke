import { useState, useEffect, useCallback, useMemo, type FC } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { getRoomByCode, getQueueForRoom, addSongToQueue, deleteQueueItem, searchVideos, registerGuest } from '../../services/karaokeApi';
import { useGuestPresence } from '../../hooks/useGuestPresence';
import { GuestWelcomeModal } from './GuestWelcomeModal';
import { GuestHeader } from './GuestHeader';
import { GuestSearchBar } from './GuestSearchBar';
import { GuestSearchResultCard } from './GuestSearchResultCard';
import { GuestMyQueue } from './GuestMyQueue';
import { GuestPartyQueue } from './GuestPartyQueue';
import { GuestCancelSongModal } from './GuestCancelSongModal';
import { GuestGeoBlockedModal } from './GuestGeoBlockedModal';
import type { KaraokeRoom, QueueItem, SearchResultItem, SearchFilterType, GuestTurnStatus } from '../../types';

export const GuestView: FC<{ roomCode?: string }> = ({ roomCode = 'FIESTA' }) => {
  const [room, setRoom] = useState<KaraokeRoom | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'my-turn' | 'party-queue'>('search');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SearchFilterType>('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [songToCancel, setSongToCancel] = useState<QueueItem | null>(null);
  const [geoBlockedDist, setGeoBlockedDist] = useState<number | undefined>();
  const [lastReqTime, setLastReqTime] = useState(0);

  const { session, status: presenceStatus, saveSession, verifyPresence } = useGuestPresence();

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const refreshQueue = useCallback(async (roomId: string) => {
    const q = await getQueueForRoom(roomId);
    setQueue(q);
  }, []);

  useEffect(() => {
    getRoomByCode(roomCode).then((r) => {
      if (r) {
        setRoom(r);
        refreshQueue(r.id);
        const chan = supabase.channel(`guest-room-${r.id}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'karaoke_queue', filter: `room_id=eq.${r.id}` }, () => refreshQueue(r.id))
          .subscribe();
        return () => { supabase.removeChannel(chan); };
      }
    });
  }, [roomCode, refreshQueue]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setIsSearching(true);
    const timer = setTimeout(() => {
      searchVideos(query, filter).then((res) => { setResults(res); setIsSearching(false); });
    }, 350);
    return () => clearTimeout(timer);
  }, [query, filter]);

  const guestNameNorm = session?.guestName.trim().toLowerCase() || '';
  const currentSong = queue.find((q) => q.status === 'playing') || null;
  const queuedSongs = queue.filter((q) => q.status === 'queued');
  const mySongs = queuedSongs.filter((q) => (q.requested_by || '').trim().toLowerCase() === guestNameNorm);
  const isSingingNow = Boolean(currentSong && (currentSong.requested_by || '').trim().toLowerCase() === guestNameNorm);

  const turnStatus: GuestTurnStatus = useMemo(() => {
    const firstIdx = queuedSongs.findIndex((q) => (q.requested_by || '').trim().toLowerCase() === guestNameNorm);
    const pos = firstIdx >= 0 ? firstIdx + 1 : 0;
    const waitSecs = queuedSongs.slice(0, firstIdx >= 0 ? firstIdx : 0).reduce((acc, s) => acc + (s.duration_seconds || 180), 0);
    return { isSingingNow, hasSongsInQueue: mySongs.length > 0, queuePosition: pos, songsAhead: Math.max(0, pos - 1), estimatedWaitMinutes: Math.ceil(waitSecs / 60) || 3, userSongsCount: mySongs.length };
  }, [queuedSongs, guestNameNorm, isSingingNow, mySongs.length]);

  const handleSelectSong = async (item: SearchResultItem) => {
    if (!room || !session) return;
    if (mySongs.length >= 3) { showToast('Máximo 3 canciones por persona (Fair Play)'); return; }
    if (Date.now() - lastReqTime < 15000) { showToast('Espera 15 segundos entre pedidos'); return; }
    const check = await verifyPresence();
    if (!check.allowed && check.reason === 'distance') { setGeoBlockedDist(check.distanceMeters); return; }
    setLastReqTime(Date.now());
    await addSongToQueue({ roomId: room.id, videoId: item.videoId, title: item.title, author: item.author, thumbnailUrl: item.thumbnailUrl, durationSeconds: item.durationSeconds, durationText: item.durationText, requestedBy: session.guestName });
    showToast('¡Canción agregada a la fila! 🎤');
    setActiveTab('my-turn');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col max-w-md mx-auto relative pb-10">
      <GuestWelcomeModal isOpen={!session} roomCode={roomCode} onJoin={(name, coords) => {
        saveSession(name, undefined, coords);
        if (room) registerGuest(room.id, name, crypto.randomUUID());
      }} />
      {session && (
        <>
          <GuestHeader roomCode={roomCode} guestName={session.guestName} activeTab={activeTab} onSelectTab={setActiveTab} mySongsCount={mySongs.length} isSingingNow={isSingingNow} isWithinGracePeriod={presenceStatus.isWithinGracePeriod} remainingGraceMinutes={presenceStatus.remainingGraceMinutes} />
          <main className="flex-1 p-4">
            {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-zinc-950 px-4 py-2 rounded-full font-bold text-xs shadow-xl">{toast}</div>}
            {activeTab === 'search' && (
              <div className="space-y-4">
                <GuestSearchBar query={query} onQueryChange={setQuery} selectedFilter={filter} onFilterChange={setFilter} isLoading={isSearching} />
                <div className="space-y-2">{results.map((song) => <GuestSearchResultCard key={song.videoId} item={song} onSelectSong={handleSelectSong} />)}</div>
              </div>
            )}
            {activeTab === 'my-turn' && <GuestMyQueue mySongs={mySongs} currentSong={currentSong} guestName={session.guestName} turnStatus={turnStatus} onCancelSong={setSongToCancel} onGoToSearch={() => setActiveTab('search')} />}
            {activeTab === 'party-queue' && <GuestPartyQueue currentSong={currentSong} queuedSongs={queuedSongs} currentGuestName={session.guestName} />}
          </main>
          <GuestCancelSongModal isOpen={Boolean(songToCancel)} songTitle={songToCancel?.title || ''} onConfirm={async () => { if (songToCancel) { await deleteQueueItem(songToCancel.id); setSongToCancel(null); showToast('Canción cancelada'); } }} onCancel={() => setSongToCancel(null)} />
          <GuestGeoBlockedModal isOpen={geoBlockedDist !== undefined} distanceMeters={geoBlockedDist} onClose={() => setGeoBlockedDist(undefined)} />
        </>
      )}
    </div>
  );
};
