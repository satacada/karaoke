import { useState, useEffect, useCallback, useMemo, type FC } from 'react';
import { Lock, Music } from 'lucide-react';
import { addSongToQueue, deleteQueueItem, replaceGuestSong, searchVideos, registerGuest, boostSongToVip } from '../../services/karaokeApi';
import { parseSongMeta } from '../../utils/songMeta';
import { useGuestPresence } from '../../hooks/useGuestPresence';
import { useGuestRealtime } from '../../hooks/useGuestRealtime';
import { canRequestVip } from '../../utils/deviceId';
import { GuestWelcomeModal } from './GuestWelcomeModal'; import { GuestHeader } from './GuestHeader'; import { GuestSearchBar } from './GuestSearchBar'; import { GuestSearchResultCard } from './GuestSearchResultCard'; import { GuestMyQueue } from './GuestMyQueue'; import { GuestPartyQueue } from './GuestPartyQueue'; import { GuestLiveReactionsBar } from './GuestLiveReactionsBar'; import { GuestModals } from './GuestModals';
import type { QueueItem, SearchResultItem, SearchFilterType, GuestTurnStatus } from '../../types';

export const GuestView: FC<{ roomCode?: string; onSwitchToHost?: () => void }> = ({ roomCode = 'FIESTA', onSwitchToHost }) => {
  const { room, queue, tvCurrentSong, tvNextSongs, refreshQueue } = useGuestRealtime(roomCode);
  const [activeTab, setActiveTab] = useState<'party-queue' | 'search' | 'my-turn'>('party-queue');
  const [query, setQuery] = useState(() => { try { return sessionStorage.getItem('guest_last_query') || ''; } catch { return ''; } });
  const [filter, setFilter] = useState<SearchFilterType>('all'); const [results, setResults] = useState<SearchResultItem[]>([]); const [isSearching, setIsSearching] = useState(false); const [toast, setToast] = useState<string | null>(null); const [geoBlockedDist, setGeoBlockedDist] = useState<number | undefined>();
  const [songToCancel, setSongToCancel] = useState<QueueItem | null>(null); const [songToReplace, setSongToReplace] = useState<QueueItem | null>(null); const [songToConfirm, setSongToConfirm] = useState<SearchResultItem | null>(null); const [songToBoost, setSongToBoost] = useState<QueueItem | null>(null);
  const [pendingVipItem, setPendingVipItem] = useState<{ item: SearchResultItem; dedication: string | null; amount?: number; isBoost?: boolean; boostSongId?: string } | null>(null);
  const [lastReqTime, setLastReqTime] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'blue' | 'neon' | 'light'>(() => (localStorage.getItem('guest_theme') as 'dark' | 'blue' | 'neon' | 'light') || 'blue'); const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>(() => (localStorage.getItem('guest_font_size') as 'normal' | 'large' | 'xl') || 'normal');

  const { session, status: presenceStatus, saveSession, verifyPresence } = useGuestPresence();
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); }, []);

  const executeSearch = useCallback((searchTerm?: string, activeFilter?: SearchFilterType) => {
    const q = (searchTerm !== undefined ? searchTerm : query).trim();
    if (!q) { setResults([]); return; }
    setIsSearching(true);
    searchVideos(q, activeFilter || filter).then((res) => { setResults(res); setIsSearching(false); });
  }, [query, filter]);

  const handleQueryChange = (q: string) => { setQuery(q); try { sessionStorage.setItem('guest_last_query', q); } catch {} };

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(() => executeSearch(query, filter), 350);
    return () => clearTimeout(t);
  }, [query, filter, executeSearch]);

  const guestNameNorm = session?.guestName.trim().toLowerCase() || '';
  const currentSong = queue.find((q) => q.status === 'playing') || tvCurrentSong || null;
  const queuedSongs = queue.filter((q) => q.status === 'queued');
  const mySongs = queuedSongs.filter((q) => (q.requested_by || '').trim().toLowerCase() === guestNameNorm);
  const isSingingNow = Boolean(currentSong && (currentSong.requested_by || '').trim().toLowerCase() === guestNameNorm);
  const turnStatus: GuestTurnStatus = useMemo(() => {
    const idx = queuedSongs.findIndex((q) => (q.requested_by || '').trim().toLowerCase() === guestNameNorm);
    const pos = idx >= 0 ? idx + 1 : 0;
    const waitSecs = queuedSongs.slice(0, idx >= 0 ? idx : 0).reduce((acc, s) => acc + (s.duration_seconds || 180), 0);
    return { isSingingNow, hasSongsInQueue: mySongs.length > 0, queuePosition: pos, songsAhead: Math.max(0, pos - 1), estimatedWaitMinutes: Math.ceil(waitSecs / 60) || 3, userSongsCount: mySongs.length };
  }, [queuedSongs, guestNameNorm, isSingingNow, mySongs.length]);

  const vipAllowed = useMemo(() => canRequestVip(queue, session?.guestName || '').allowed, [queue, session?.guestName]);
  const highestVipAmount = useMemo(() => Math.max(0, ...queuedSongs.map((s) => parseSongMeta(s).vipAmount)), [queuedSongs]);

  const handleSelectSong = async (item: SearchResultItem) => {
    if (!room || !session) return;
    if (room.is_queue_locked) return showToast('⏱️ ¡Última Ronda! Pedidos cerrados.');
    if (mySongs.length >= 3) return showToast('Máximo 3 canciones por persona');
    if (Date.now() - lastReqTime < 15000) return showToast('Espera 15 segundos entre pedidos');
    const check = await verifyPresence();
    if (!check.allowed && check.reason === 'distance') return setGeoBlockedDist(check.distanceMeters);
    setSongToConfirm(item);
  };

  const executeAddSong = async (item: SearchResultItem, dedication: string | null, isVip: boolean, vipAmount?: number) => {
    if (!room || !session) return; setLastReqTime(Date.now());
    await addSongToQueue({ roomId: room.id, videoId: item.videoId, title: item.title, author: item.author, thumbnailUrl: item.thumbnailUrl || (item as unknown as { thumbnail?: string }).thumbnail, durationSeconds: item.durationSeconds, durationText: item.durationText, requestedBy: session.guestName, dedication: dedication || undefined, isVip, vipAmount });
    await refreshQueue(room.id); showToast(isVip ? '¡Pase VIP confirmado! Tu tema es prioritario ⚡' : '¡Canción agregada a la fila! 🎤'); setActiveTab('my-turn');
  };

  const handleConfirmSong = (dedication: string | null, isVip: boolean, vipAmount?: number) => {
    if (!songToConfirm) return; const item = songToConfirm; setSongToConfirm(null);
    if (isVip) setPendingVipItem({ item, dedication, amount: vipAmount }); else executeAddSong(item, dedication, false);
  };

  const handleTabChange = (tab: 'search' | 'my-turn' | 'party-queue') => { setActiveTab(tab); if (room && (tab === 'my-turn' || tab === 'party-queue')) refreshQueue(room.id); };

  return (
    <div className={`theme-${theme} font-scale-${fontSize} min-h-screen bg-zinc-950 text-zinc-100 flex flex-col w-full max-w-md mx-auto relative pb-16 overflow-x-hidden transition-colors duration-200`}>
      <GuestWelcomeModal isOpen={!session} roomCode={roomCode} onJoin={(name, coords) => { saveSession(name, undefined, coords); if (room) registerGuest(room.id, name, crypto.randomUUID()); }} />
      {session && (
        <>
          <GuestHeader roomCode={roomCode} guestName={session.guestName} activeTab={activeTab} onSelectTab={handleTabChange} mySongsCount={mySongs.length} isSingingNow={isSingingNow} isWithinGracePeriod={presenceStatus.isWithinGracePeriod} remainingGraceMinutes={presenceStatus.remainingGraceMinutes} currentTheme={theme} onToggleTheme={() => { const n = theme === 'dark' ? 'blue' : theme === 'blue' ? 'neon' : theme === 'neon' ? 'light' : 'dark'; setTheme(n); try { localStorage.setItem('guest_theme', n); } catch {} }} currentFontSize={fontSize} onToggleFontSize={() => { const n = fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'xl' : 'normal'; setFontSize(n); try { localStorage.setItem('guest_font_size', n); } catch {} }} onSwitchToHost={onSwitchToHost} />
          <main className="flex-1 px-2.5 py-3 w-full min-w-0 overflow-x-hidden">
            {toast && <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-zinc-950 px-4 py-2 rounded-full font-bold text-xs shadow-xl">{toast}</div>}
            {activeTab === 'search' && (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-emerald-950/70 via-zinc-900 to-zinc-900 border border-emerald-500/30 rounded-2xl p-2.5 flex items-center gap-2.5 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0"><Music className="w-4 h-4 text-emerald-400" /></div>
                  <div className="min-w-0 flex-1"><h2 className="text-xs font-black text-white leading-tight">Pide tu tema</h2><p className="text-[11px] text-zinc-300 leading-snug">Busca el tema o artista que vas a cantar y pídelo a la fila.</p></div>
                </div>
                {room?.is_queue_locked && <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2 text-amber-300 text-xs"><Lock className="w-4 h-4 shrink-0" /><span><b>¡Última Ronda!</b> Pedidos cerrados para terminar a horario.</span></div>}
                <GuestSearchBar query={query} onQueryChange={handleQueryChange} onSearch={() => executeSearch(query, filter)} selectedFilter={filter} onFilterChange={(f) => { setFilter(f); executeSearch(query, f); }} isLoading={isSearching} />
                <div className="space-y-2">{results.map((s) => <GuestSearchResultCard key={s.videoId} item={s} onSelectSong={handleSelectSong} />)}</div>
              </div>
            )}
            {activeTab === 'my-turn' && <GuestMyQueue mySongs={mySongs} allQueuedSongs={queuedSongs} currentSong={currentSong} guestName={session.guestName} turnStatus={turnStatus} highestVipAmount={highestVipAmount} onCancelSong={setSongToCancel} onReplaceSong={setSongToReplace} onBoostSong={setSongToBoost} onGoToSearch={() => setActiveTab('search')} />}
            {activeTab === 'party-queue' && <GuestPartyQueue currentSong={currentSong} queuedSongs={queuedSongs} nextAutoDjSongs={tvNextSongs} turnStatus={turnStatus} currentGuestName={session.guestName} />}
          </main>
          <GuestLiveReactionsBar roomCode={roomCode} guestName={session.guestName} />
          <GuestModals songToConfirm={songToConfirm} pendingVipItem={pendingVipItem} songToCancel={songToCancel} songToReplace={songToReplace} songToBoost={songToBoost} geoBlockedDist={geoBlockedDist} guestName={session.guestName} canRequestVip={vipAllowed} highestVipAmount={highestVipAmount} vipPriceArs={room?.vip_price_ars} onConfirmSong={handleConfirmSong} onConfirmVipPayment={async () => { if (pendingVipItem?.isBoost && pendingVipItem.boostSongId) { await boostSongToVip(pendingVipItem.boostSongId, pendingVipItem.amount || 500); if (room) await refreshQueue(room.id); showToast('¡Tu canción subió a la Cola Prioritaria! ⚡'); setPendingVipItem(null); } else if (pendingVipItem) { executeAddSong(pendingVipItem.item, pendingVipItem.dedication, true, pendingVipItem.amount); setPendingVipItem(null); } }} onProceedBoostPayment={(amt) => { if (songToBoost) { setPendingVipItem({ item: { videoId: songToBoost.video_id, title: songToBoost.title, author: songToBoost.author, durationSeconds: songToBoost.duration_seconds, durationText: songToBoost.duration_text, thumbnailUrl: songToBoost.thumbnail_url || '' }, dedication: null, amount: amt, isBoost: true, boostSongId: songToBoost.id }); setSongToBoost(null); } }} onCloseConfirm={() => setSongToConfirm(null)} onCloseMp={() => setPendingVipItem(null)} onCloseBoost={() => setSongToBoost(null)} onConfirmCancel={async () => { if (songToCancel) { await deleteQueueItem(songToCancel.id); setSongToCancel(null); if (room) await refreshQueue(room.id); showToast('Canción cancelada'); } }} onCloseCancel={() => setSongToCancel(null)} onReplace={async (sid, item) => { if (await replaceGuestSong(sid, { videoId: item.videoId, title: item.title, author: item.author, thumbnailUrl: item.thumbnailUrl, durationSeconds: item.durationSeconds, durationText: item.durationText })) { if (room) await refreshQueue(room.id); showToast('¡Canción cambiada en tu turno! 🔄'); } }} onCloseReplace={() => setSongToReplace(null)} onCloseGeoBlocked={() => setGeoBlockedDist(undefined)} />
        </>
      )}
    </div>
  );
};
