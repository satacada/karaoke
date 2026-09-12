import { searchVideos, addSongToQueue } from './karaokeApi';
import { supabase } from '../lib/supabaseClient';
import type { SearchResultItem } from '../types';
import { parseAutoDjGenre, AUTO_DJ_STATIONS, getFallbackTrack, type AutoDjStation } from './autoDjStations';
import { extractArtistName, isArtistRecent, recordRecentArtist, getNextDiverseSeed } from './artistDiversityService';

export { parseAutoDjGenre, AUTO_DJ_STATIONS, getFallbackTrack, type AutoDjStation };

const RECENT_KEY = 'karaoke_autodj_recent_ids';

function getRecentIds(): string[] {
  try {
    const raw = sessionStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function recordRecentId(videoId: string) {
  try {
    const recent = getRecentIds().filter((id) => id !== videoId);
    recent.unshift(videoId);
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 40)));
  } catch {}
}

export async function fetchNextAutoDjTrack(genre?: string): Promise<SearchResultItem> {
  const { isSeed, query } = parseAutoDjGenre(genre);
  try {
    const results = await searchVideos(query, isSeed ? 'all' : 'official');
    if (!results || results.length === 0) return getFallbackTrack(genre);
    const recent = getRecentIds();
    const candidates = results.filter((v) => {
      const valid = v.durationSeconds >= 140 && v.durationSeconds <= 390 && !recent.includes(v.videoId);
      return valid && !isArtistRecent(extractArtistName(v.title, v.author));
    });
    const pool = candidates.length > 0
      ? candidates
      : results.filter((v) => v.durationSeconds >= 120 && v.durationSeconds <= 420 && !recent.includes(v.videoId));
    if (pool.length === 0) return results[0] || getFallbackTrack(genre);
    const chosen = pool[Math.floor(Math.random() * Math.min(pool.length, 5))];
    if (chosen) {
      recordRecentId(chosen.videoId);
      recordRecentArtist(extractArtistName(chosen.title, chosen.author));
      return chosen;
    }
    return getFallbackTrack(genre);
  } catch (err) {
    console.error('Error fetching Auto-DJ track:', err);
    return getFallbackTrack(genre);
  }
}

export async function getSmartGenreForRoom(roomId: string, explicitGenre?: string): Promise<string> {
  if (explicitGenre) {
    if (explicitGenre.startsWith('seed:')) {
      return `seed:${getNextDiverseSeed(explicitGenre.slice(5).trim())}`;
    }
    return explicitGenre;
  }
  try {
    const { data: past } = await supabase
      .from('karaoke_queue')
      .select('title, author')
      .eq('room_id', roomId)
      .in('status', ['finished', 'playing'])
      .order('requested_at', { ascending: false })
      .limit(3);
    if (past && past.length > 0) {
      const author = past[0].author && past[0].author !== 'Desconocido' ? past[0].author : past[0].title;
      if (author) return `seed:${getNextDiverseSeed(author)}`;
    }
  } catch {}
  const stations = ['hits_80_90', 'rock_nacional', 'cumbia_fiesta'];
  return stations[Math.floor(Math.random() * stations.length)];
}

export async function enqueueAutoDjSong(roomId: string, explicitGenre?: string): Promise<boolean> {
  const genre = await getSmartGenreForRoom(roomId, explicitGenre);
  const track = (await fetchNextAutoDjTrack(genre)) || getFallbackTrack(genre);
  const { isSeed, displayName } = parseAutoDjGenre(genre);
  const queued = await addSongToQueue({
    roomId,
    videoId: track.videoId,
    title: track.title,
    author: track.author,
    thumbnailUrl: track.thumbnailUrl,
    durationSeconds: track.durationSeconds,
    durationText: track.durationText,
    requestedBy: 'Auto-DJ (Rockola)',
    dedication: isSeed ? `Estilo de: ${displayName}` : `Playlist: ${displayName}`,
  });
  return Boolean(queued);
}

export async function purgeAutoDjSongs(roomId: string): Promise<void> {
  try {
    await supabase.from('karaoke_queue').delete().eq('room_id', roomId).eq('status', 'queued').ilike('requested_by', '%Auto-DJ%');
  } catch (err) {
    console.error('Error purging Auto-DJ songs:', err);
  }
}
