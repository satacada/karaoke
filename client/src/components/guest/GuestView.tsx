import { useState, useEffect, useCallback, useMemo, useRef, type FC } from 'react';
import { Lock } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { getRoomByCode, getQueueForRoom, addSongToQueue, deleteQueueItem, replaceGuestSong, swapGuestSongs, searchVideos, registerGuest } from '../../services/karaokeApi';
import { useGuestPresence } from '../../hooks/useGuestPresence';
import { canRequestVip } from '../../utils/deviceId';
import { GuestWelcomeModal } from './GuestWelcomeModal'; import { GuestHeader } from './GuestHeader';
import { GuestSearchBar } from './GuestSearchBar';
import { GuestSearchResultCard } from './GuestSearchResultCard';
import { GuestMyQueue } from './GuestMyQueue';
import { GuestPartyQueue } from './GuestPartyQueue';
import { GuestLiveReactionsBar } from './GuestLiveReactionsBar';
import { GuestModals } from './GuestModals';
import type { KaraokeRoom, QueueItem, SearchResultItem, SearchFilterType, GuestTurnStatus } from '../../types';

export const GuestView: FC<{ roomCode?: string }> = ({ roomCode = 'FIESTA' }) => {
  const [room, setRoom] = useState<KaraokeRoom | null>(null); const [queue, setQueue] = useState<QueueItem[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'my-turn' | 'party-queue'>('search');
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState<SearchFilterType>('all');
  const [results, setResults] = useState<SearchResultItem[]>([]); const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState<string | null>(null); const [geoBlockedDist, setGeoBlockedDist] = useState<number | undefined>();
  const [songToCancel, setSongToCancel] = useState<QueueItem | null>(null); const [songToReplace, setSongToReplace] = useState<QueueItem | null>(null); const [songToConfirm, setSongToConfirm] = useState<SearchResultItem | null>(null); const [pendingVipItem, setPendingVipItem] = useState<{ item: SearchResultItem; dedication: string | null } | null>(null);
  const [lastReqTime, setLastReqTime] = useState(0); const isSwappingRef = useRef(false);
  const [theme, setTheme] = useState<'dark' | 'blue' | 'neon' | 'light'>(() => (localStorage.getItem('guest_theme') as 'dark' | 'blue' | 'neon' | 'light') || 'dark');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>(() => (localStorage.getItem('guest_font_size') as 'normal' | 'large' | 'xl') || 'normal');

  const { session, status: presenceStatus, saveSession, verifyPresence } = useGuestPresence();
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); }, []);
  const refreshQueue = useCallback(async (roomId: string) => { setQueue(await getQueueForRoom(roomId)); }, []);
  const handleSwap = useCallback(async (id1: string, id2: string) => {
    if (isSwappingRef.current) return; isSwappingRef.current = true;
    try { if (await swapGuestSongs(id1, id2)) { if (room) await refreshQueue(room.id); showToast('¡Orden invertido! ↕️'); } }
    finally { setTimeout(() => { isSwappingRef.current = false; }, 400); }
  }, [room, refreshQueue, showToast]);

  useEffect(() => {
    getRoomByCode(roomCode).then((r) => {
      if (!r) return; setRoom(r); refreshQueue(r.id);
      const ch = supabase.channel(`guest-room-${r.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'karaoke_queue', filter: `room_id=eq.${r.id}` }, () => refreshQueue(r.id)).subscribe();
      const rCh = supabase.channel(`guest-room-state-${r.id}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'karaoke_rooms', filter: `id=eq.${r.id}` }, (p) => setRoom(p.new as KaraokeRoom)).subscribe();
      return () => { supabase.removeChannel(ch); supabase.removeChannel(rCh); };
    });
  }, [roomCode, refreshQueue]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setIsSearching(true);
    const t = setTimeout(() => { searchVideos(query, filter).then((res) => { setResults(res); setIsSearching(false); }); }, 350);
    return () => clearTimeout(t);
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

  const vipAllowed = useMemo(() => canRequestVip(queue, session?.guestName || '').allowed, [queue, session?.guestName]);

  const handleSelectSong = async (item: SearchResultItem) => {
    if (!room || !session) return;
    if (room.is_queue_locked) { showToast('⏱️ ¡Última Ronda! Pedidos cerrados para terminar a horario.'); return; }
    if (mySongs.length >= 3) { showToast('Máximo 3 canciones por persona (Fair Play)'); return; }
    if (Date.now() - lastReqTime < 15000) { showToast('Espera 15 segundos entre pedidos'); return; }
    const check = await verifyPresence();
    if (!check.allowed && check.reason === 'distance') { setGeoBlockedDist(check.distanceMeters); return; }
    setSongToConfirm(item);
  };

  const executeAddSong = async (item: SearchResultItem, dedication: string | null, isVip: boolean) => {
    if (!room || !session) return;
    setLastReqTime(Date.now());
    await addSongToQueue({ roomId: room.id, videoId: item.videoId, title: item.title, author: item.author, thumbnailUrl: item.thumbnailUrl || (item as unknown as { thumbnail?: string }).thumbnail, durationSeconds: item.durationSeconds, durationText: item.durationText, requestedBy: session.guestName, dedication: dedication || undefined, isVip });
    showToast(isVip ? '¡Pase VIP confirmado! Tu tema es el siguiente ⚡' : '¡Canción agregada a la fila! 🎤'); setActiveTab('my-turn');
  };

  const handleConfirmSong = (dedication: string | null, isVip: boolean) => {
    if (!songToConfirm) return;
    const item = songToConfirm; setSongToConfirm(null);
    if (isVip) setPendingVipItem({ item, dedication }); else executeAddSong(item, dedication, false); };

  return (
    <div className={`theme-${theme} font-scale-${fontSize} min-h-screen bg-zinc-950 text-zinc-100 flex flex-col w-full max-w-md mx-auto relative pb-16 overflow-x-hidden transition-colors duration-200`}>
      <GuestWelcomeModal isOpen={!session} roomCode={roomCode} onJoin={(name, coords) => { saveSession(name, undefined, coords); if (room) registerGuest(room.id, name, crypto.randomUUID()); }} />
      {session && (
        <>
          <GuestHeader roomCode={roomCode} guestName={session.guestName} activeTab={activeTab} onSelectTab={setActiveTab} mySongsCount={mySongs.length} isSingingNow={isSingingNow} isWithinGracePeriod={presenceStatus.isWithinGracePeriod} remainingGraceMinutes={presenceStatus.remainingGraceMinutes} currentTheme={theme} onToggleTheme={() => { const n = theme === 'dark' ? 'blue' : theme === 'blue' ? 'neon' : theme === 'neon' ? 'light' : 'dark'; setTheme(n); try { localStorage.setItem('guest_theme', n); } catch {} }} currentFontSize={fontSize} onToggleFontSize={() => { const n = fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'xl' : 'normal'; setFontSize(n); try { localStorage.setItem('guest_font_size', n); } catch {} }} />
          <main className="flex-1 px-2.5 py-3 w-full min-w-0 overflow-x-hidden">
            {toast && <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-zinc-950 px-4 py-2 rounded-full font-bold text-xs shadow-xl">{toast}</div>}
            {activeTab === 'search' && (
              <div className="space-y-4">
                {room?.is_queue_locked && <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2 text-amber-300 text-xs"><Lock className="w-4 h-4 shrink-0" /><span><b>¡Última Ronda!</b> Pedidos cerrados para terminar a horario.</span></div>}
                <GuestSearchBar query={query} onQueryChange={setQuery} selectedFilter={filter} onFilterChange={setFilter} isLoading={isSearching} />
                <div className="space-y-2">{results.map((s) => <GuestSearchResultCard key={s.videoId} item={s} onSelectSong={handleSelectSong} />)}</div>
              </div>
            )}
            {activeTab === 'my-turn' && <GuestMyQueue mySongs={mySongs} currentSong={currentSong} guestName={session.guestName} turnStatus={turnStatus} onCancelSong={setSongToCancel} onReplaceSong={setSongToReplace} onSwapSongs={handleSwap} onGoToSearch={() => setActiveTab('search')} />}
            {activeTab === 'party-queue' && <GuestPartyQueue currentSong={currentSong} queuedSongs={queuedSongs} currentGuestName={session.guestName} />}
          </main>
          <GuestLiveReactionsBar roomCode={roomCode} guestName={session.guestName} />
          <GuestModals
            songToConfirm={songToConfirm} pendingVipItem={pendingVipItem} songToCancel={songToCancel} songToReplace={songToReplace} geoBlockedDist={geoBlockedDist} guestName={session.guestName} canRequestVip={vipAllowed} vipPriceArs={room?.vip_price_ars}
            onConfirmSong={handleConfirmSong} onConfirmVipPayment={() => { if (pendingVipItem) { executeAddSong(pendingVipItem.item, pendingVipItem.dedication, true); setPendingVipItem(null); } }}
            onCloseConfirm={() => setSongToConfirm(null)} onCloseMp={() => setPendingVipItem(null)} onConfirmCancel={async () => { if (songToCancel) { await deleteQueueItem(songToCancel.id); setSongToCancel(null); showToast('Canción cancelada'); } }} onCloseCancel={() => setSongToCancel(null)}
            onReplace={async (sid, item) => { if (await replaceGuestSong(sid, { videoId: item.videoId, title: item.title, author: item.author, thumbnailUrl: item.thumbnailUrl, durationSeconds: item.durationSeconds, durationText: item.durationText })) { if (room) refreshQueue(room.id); showToast('¡Canción cambiada en tu turno! 🔄'); } }}
            onCloseReplace={() => setSongToReplace(null)} onCloseGeoBlocked={() => setGeoBlockedDist(undefined)}
          />
        </>
      )}
    </div>
  );
};
