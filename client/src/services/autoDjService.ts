import { searchVideos, addSongToQueue } from './karaokeApi';
import { supabase } from '../lib/supabaseClient';
import type { SearchResultItem } from '../types';

export interface AutoDjStation {
  id: string;
  name: string;
  icon: string;
  query: string;
  description: string;
}

export const AUTO_DJ_STATIONS: AutoDjStation[] = [
  { id: 'rock_nacional', name: 'Rock Nacional', icon: '🎸', query: 'Rock Argentino Clasicos exitos oficiales', description: 'Soda, Charly, Redondos, Calamaro, Fito' },
  { id: 'cumbia_fiesta', name: 'Cumbia & Fiesta', icon: '🌴', query: 'Cumbia fiesta clasicos exitos oficiales', description: 'Palmeras, Damas Gratis, Ráfaga, Gilda' },
  { id: 'hits_80_90', name: 'Hits 80s y 90s', icon: '⚡', query: '80s 90s pop rock greatest hits official music video', description: 'Queen, Michael Jackson, Bon Jovi, Madonna' },
  { id: 'chill_lounge', name: 'Chill & Lounge', icon: '🍹', query: 'chill acoustic pop session lounge bar', description: 'Acústicos relajados y sesiones de bar' },
  { id: 'cuarteto_cordobes', name: 'Cuarteto & Fiesta', icon: '🎺', query: 'cuarteto cordobes grandes exitos fiesta', description: 'Rodrigo, La Mona, Walter Olmos, La Konga' },
  { id: 'karaoke_hits', name: 'Karaoke Éxitos', icon: '🎤', query: 'karaoke con letra grandes exitos espanol', description: 'Pistas listas para cantar en pantalla' },
];

const RECENT_KEY = 'karaoke_autodj_recent_ids';

export function parseAutoDjGenre(genre?: string): { isSeed: boolean; displayName: string; query: string } {
  if (!genre) return { isSeed: false, displayName: AUTO_DJ_STATIONS[0].name, query: AUTO_DJ_STATIONS[0].query };
  if (genre.startsWith('seed:')) {
    const seed = genre.slice(5).trim();
    return { isSeed: true, displayName: seed || 'Semilla Musical', query: `${seed} musica oficial video` };
  }
  const found = AUTO_DJ_STATIONS.find((s) => s.id === genre);
  if (found) return { isSeed: false, displayName: found.name, query: found.query };
  return { isSeed: false, displayName: genre, query: `${genre} exitos oficial` };
}

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

export async function fetchNextAutoDjTrack(genre?: string): Promise<SearchResultItem | null> {
  const { isSeed, query } = parseAutoDjGenre(genre);
  try {
    const results = await searchVideos(query, isSeed ? 'all' : 'official');
    if (!results || results.length === 0) return null;
    const recent = getRecentIds();
    const candidates = results.filter((v) => {
      const validDuration = v.durationSeconds >= 140 && v.durationSeconds <= 390;
      return validDuration && !recent.includes(v.videoId);
    });
    const pool = candidates.length > 0 ? candidates : results.filter((v) => v.durationSeconds >= 120 && v.durationSeconds <= 420);
    if (pool.length === 0) return results[0] || null;
    const chosen = pool[Math.floor(Math.random() * Math.min(pool.length, 5))];
    if (chosen) recordRecentId(chosen.videoId);
    return chosen;
  } catch (err) {
    console.error('Error fetching Auto-DJ track:', err);
    return null;
  }
}

export async function getSmartGenreForRoom(roomId: string, explicitGenre?: string): Promise<string> {
  if (explicitGenre) return explicitGenre;
  try {
    const { data: past } = await supabase
      .from('karaoke_queue')
      .select('title, author')
      .eq('room_id', roomId)
      .in('status', ['finished', 'playing'])
      .order('requested_at', { ascending: false })
      .limit(3);
    if (past && past.length > 0) {
      const top = past[0];
      const author = top.author && top.author !== 'Desconocido' ? top.author : '';
      if (author) return `seed:${author}`;
    }
  } catch {}
  const stations = ['hits_80_90', 'rock_nacional', 'cumbia_fiesta'];
  return stations[Math.floor(Math.random() * stations.length)];
}

export async function enqueueAutoDjSong(roomId: string, explicitGenre?: string): Promise<boolean> {
  const genre = await getSmartGenreForRoom(roomId, explicitGenre);
  const track = await fetchNextAutoDjTrack(genre);
  if (!track) return false;
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
