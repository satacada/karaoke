import { searchVideos, addSongToQueue } from './karaokeApi';
import { supabase } from '../lib/supabaseClient';
import type { SearchResultItem } from '../types';
import { parseAutoDjGenre, AUTO_DJ_STATIONS, getAllStations, addCustomStation, getFallbackTrack, type AutoDjStation } from './autoDjStations';
import { extractArtistName, isArtistRecent, recordRecentArtist, getNextDiverseSeed } from './artistDiversityService';
import { isVideoRestricted, isVideoEmbeddable } from './videoRestrictionService';
import { logInfo, logError } from './loggerService';

export { parseAutoDjGenre, AUTO_DJ_STATIONS, getAllStations, addCustomStation, getFallbackTrack, type AutoDjStation };

const RECENT_KEY = 'karaoke_autodj_recent_ids';

function getRecentIds(): string[] {
  try { const raw = sessionStorage.getItem(RECENT_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}

function recordRecentId(videoId: string) {
  try {
    const recent = getRecentIds().filter((id) => id !== videoId);
    recent.unshift(videoId); sessionStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 50)));
  } catch {}
}

export async function getRecentQueueArtists(roomId: string): Promise<string[]> {
  try {
    const { data: past } = await supabase.from('karaoke_queue').select('title, author').eq('room_id', roomId).in('status', ['finished', 'playing', 'queued']).order('requested_at', { ascending: false }).limit(8);
    if (!past) return [];
    return past.map((p) => extractArtistName(p.title, p.author)).filter(Boolean);
  } catch { return []; }
}

export async function fetchNextAutoDjTrack(genre?: string, recentArtists: string[] = []): Promise<SearchResultItem> {
  const { isSeed, query } = parseAutoDjGenre(genre, recentArtists);
  try {
    const results = await searchVideos(query, isSeed ? 'all' : 'official');
    if (!results || results.length === 0) return getFallbackTrack(genre, recentArtists);
    const recent = getRecentIds();
    const candidates = results.filter((v) => {
      const valid = v.durationSeconds >= 120 && v.durationSeconds <= 420 && !recent.includes(v.videoId) && !isVideoRestricted(v.videoId);
      return valid && !isArtistRecent(extractArtistName(v.title, v.author), recentArtists, 4);
    });
    const pool = candidates.length > 0 ? candidates : results.filter((v) => v.durationSeconds >= 100 && v.durationSeconds <= 450 && !recent.includes(v.videoId) && !isVideoRestricted(v.videoId));
    if (pool.length === 0) return getFallbackTrack(genre, recentArtists);
    for (let i = 0; i < Math.min(pool.length, 5); i++) {
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      if (chosen && (await isVideoEmbeddable(chosen.videoId))) {
        recordRecentId(chosen.videoId); recordRecentArtist(extractArtistName(chosen.title, chosen.author));
        return chosen;
      }
    }
    return getFallbackTrack(genre, recentArtists);
  } catch (err) {
    console.error('Error fetching Auto-DJ track:', err);
    return getFallbackTrack(genre, recentArtists);
  }
}

export async function getSmartGenreForRoom(_roomId: string, explicitGenre?: string, recentArtists: string[] = []): Promise<string> {
  if (explicitGenre) {
    if (explicitGenre.startsWith('seed:')) {
      const seedName = explicitGenre.slice(5).trim();
      return `seed:${getNextDiverseSeed(seedName, recentArtists)}`;
    }
    return explicitGenre;
  }
  if (recentArtists.length > 0) {
    const nextArtist = getNextDiverseSeed(recentArtists[0], recentArtists);
    if (nextArtist && nextArtist !== recentArtists[0]) return `seed:${nextArtist}`;
  }
  const stations = ['rock_nacional', 'hits_80_90', 'cumbia_fiesta', 'cuarteto_cordobes'];
  return stations[Math.floor(Math.random() * stations.length)];
}

export async function enqueueAutoDjSong(roomId: string, explicitGenre?: string): Promise<boolean> {
  logInfo('AUTO_DJ', 'system', 'autodj_request', `Solicitud de Auto-DJ: ${explicitGenre || 'auto'}`);
  const recentArtists = await getRecentQueueArtists(roomId);
  const genre = await getSmartGenreForRoom(roomId, explicitGenre, recentArtists);
  const track = (await fetchNextAutoDjTrack(genre, recentArtists)) || getFallbackTrack(genre, recentArtists);
  logInfo('AUTO_DJ', 'system', 'autodj_track_selected', `Tema: ${track.title} (${track.videoId})`);
  const { isSeed, displayName } = parseAutoDjGenre(genre, recentArtists);
  const cleanAuthor = extractArtistName(track.title, track.author) || track.author;
  const queued = await addSongToQueue({
    roomId, videoId: track.videoId, title: track.title, author: cleanAuthor,
    thumbnailUrl: track.thumbnailUrl, durationSeconds: track.durationSeconds, durationText: track.durationText,
    requestedBy: 'Auto-DJ (Rockola)', dedication: isSeed ? `Estilo de: ${displayName}` : `Playlist: ${displayName}`,
  });
  if (queued) logInfo('AUTO_DJ', 'system', 'autodj_queued_ok', `Tema ${track.title} encolado`);
  else logError('AUTO_DJ', 'system', 'autodj_queued_err', `Error al encolar ${track.title}`);
  return Boolean(queued);
}

export async function purgeAutoDjSongs(roomId: string): Promise<void> {
  try {
    await supabase.from('karaoke_queue').delete().eq('room_id', roomId).eq('status', 'queued').ilike('requested_by', '%Auto-DJ%');
  } catch (err) { console.error('Error purging Auto-DJ songs:', err); }
}
