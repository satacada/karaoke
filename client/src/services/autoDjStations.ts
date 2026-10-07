import { normalizeArtist } from './artistDiversityService';

export interface AutoDjStation {
  id: string; name: string; icon: string; description: string;
  category: 'Bailables & Fiesta' | 'Rock & Pop' | 'Clásicos & Retro' | 'Tropical & Folclore' | 'Chill & Acústico' | 'Personalizados';
  artists: string[];
}

export const AUTO_DJ_STATIONS: AutoDjStation[] = [
  { id: 'cumbia_fiesta', name: 'Cumbia & Fiesta', icon: '🌴', description: 'Palmeras, Gilda, Damas Gratis, Ráfaga, Amar Azul', category: 'Bailables & Fiesta', artists: ['Los Palmeras', 'Gilda', 'Rafaga', 'Amar Azul', 'La Nueva Luna', 'Damas Gratis', 'Leo Mattioli', 'Sombras'] },
  { id: 'cuarteto_cordobes', name: 'Cuarteto & Fiesta', icon: '🎺', description: 'Rodrigo, La Mona, La Konga, Walter Olmos, Ulises', category: 'Bailables & Fiesta', artists: ['Rodrigo', 'La Mona Jimenez', 'La Konga', 'Walter Olmos', 'Ulises Bueno', 'Q Lokura', 'Luck Ra'] },
  { id: 'rkt_villera', name: 'RKT & Cumbia Villera', icon: '🔥', description: 'L-Gante, Callejero Fino, Pibes Chorros, La Joaqui', category: 'Bailables & Fiesta', artists: ['L-Gante', 'Callejero Fino', 'Pablo Lescano', 'La Joaqui', 'Pibes Chorros'] },
  { id: 'rock_nacional', name: 'Rock Nacional', icon: '🎸', description: 'Soda, Charly, Redondos, Fito, Piojos, Calamaro', category: 'Rock & Pop', artists: ['Soda Stereo', 'Charly Garcia', 'Fito Paez', 'Los Redondos', 'Andres Calamaro', 'Los Piojos', 'Enanitos Verdes'] },
  { id: 'rock_internacional', name: 'Rock Internacional', icon: '⚡', description: 'AC/DC, Aerosmith, Guns N Roses, Nirvana, Queen', category: 'Rock & Pop', artists: ['AC/DC', 'Aerosmith', 'Guns N Roses', 'Nirvana', 'Red Hot Chili Peppers', 'The Rolling Stones'] },
  { id: 'hits_80_90', name: 'Hits 80s y 90s', icon: '📻', description: 'Queen, Michael Jackson, Bon Jovi, Madonna, a-ha', category: 'Clásicos & Retro', artists: ['Queen', 'Michael Jackson', 'Bon Jovi', 'Madonna', 'a-ha', 'The Police', 'Cyndi Lauper'] },
  { id: 'karaoke_hits', name: 'Karaoke Clásicos', icon: '🎤', description: 'Pimpinela, Luis Miguel, Cristian Castro, Montaner', category: 'Clásicos & Retro', artists: ['Pimpinela', 'Luis Miguel', 'Cristian Castro', 'Ricardo Montaner', 'Marco Antonio Solis'] },
  { id: 'folclore_argentino', name: 'Folclore & Tradición', icon: '🪕', description: 'Los Nocheros, Soledad, Chaqueño, Mercedes Sosa', category: 'Tropical & Folclore', artists: ['Los Nocheros', 'Soledad Pastorutti', 'Chaqueño Palavecino', 'Horacio Guarany'] },
  { id: 'chill_lounge', name: 'Chill & Lounge', icon: '🍹', description: 'Norah Jones, Jack Johnson, Amy Winehouse, Mayer', category: 'Chill & Acústico', artists: ['Norah Jones', 'Jack Johnson', 'Amy Winehouse', 'John Mayer', 'Sade'] },
];

export function getCustomStations(): AutoDjStation[] {
  try { const raw = localStorage.getItem('karaoke_custom_stations'); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}

export function addCustomStation(name: string, queryArtist: string, icon = '✨'): AutoDjStation {
  const id = `custom_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const st: AutoDjStation = { id, name, icon, description: `Estilo: ${queryArtist}`, category: 'Personalizados', artists: [queryArtist] };
  const all = getCustomStations().filter((s) => s.id !== id); all.unshift(st);
  try { localStorage.setItem('karaoke_custom_stations', JSON.stringify(all)); } catch {}
  return st;
}

export function getAllStations(): AutoDjStation[] {
  return [...AUTO_DJ_STATIONS, ...getCustomStations()];
}

export function getStationArtistQuery(stationId: string, recentArtists: string[] = []): string {
  const station = getAllStations().find((s) => s.id === stationId) || AUTO_DJ_STATIONS[0];
  const normRecent = recentArtists.map((a) => normalizeArtist(a));
  const pool = station.artists.filter((a) => !normRecent.slice(0, 4).some((r) => r === normalizeArtist(a) || r.includes(normalizeArtist(a))));
  const chosen = (pool.length > 0 ? pool : station.artists)[Math.floor(Math.random() * (pool.length || station.artists.length))] || station.artists[0];
  return `${chosen} exitos oficial video`;
}

export function parseAutoDjGenre(genre?: string, recentArtists: string[] = []): { isSeed: boolean; displayName: string; query: string } {
  const effectiveGenre = genre || 'cumbia_fiesta';
  if (effectiveGenre.startsWith('seed:')) {
    const seed = effectiveGenre.slice(5).trim();
    return { isSeed: true, displayName: seed || 'Semilla Musical', query: `${seed} musica oficial video` };
  }
  const found = getAllStations().find((s) => s.id === effectiveGenre);
  if (found) return { isSeed: false, displayName: found.name, query: getStationArtistQuery(found.id, recentArtists) };
  return { isSeed: false, displayName: effectiveGenre, query: `${effectiveGenre} exitos oficial` };
}

const EMERGENCY_FALLBACKS: Record<string, Array<{ videoId: string; title: string; author: string; durationSeconds: number; durationText: string; thumbnailUrl: string }>> = {
  cumbia_fiesta: [
    { videoId: 'GMbn2yVTak4', title: 'Los Palmeras - El Bombón Asesino', author: 'Los Palmeras', durationSeconds: 200, durationText: '3:20', thumbnailUrl: 'https://i.ytimg.com/vi/GMbn2yVTak4/hqdefault.jpg' },
    { videoId: 'O3cWvhw1jK8', title: 'Gilda - No Me Arrepiento de Este Amor', author: 'Gilda', durationSeconds: 215, durationText: '3:35', thumbnailUrl: 'https://i.ytimg.com/vi/O3cWvhw1jK8/hqdefault.jpg' },
  ],
  rock_nacional: [
    { videoId: 'T_FkEw27XJ0', title: 'Soda Stereo - De Música Ligera', author: 'Soda Stereo', durationSeconds: 215, durationText: '3:35', thumbnailUrl: 'https://i.ytimg.com/vi/T_FkEw27XJ0/hqdefault.jpg' },
  ],
};

export function getFallbackTrack(genre?: string, recentArtists: string[] = []): import('../types').SearchResultItem {
  const list = EMERGENCY_FALLBACKS[genre || 'cumbia_fiesta'] || EMERGENCY_FALLBACKS.cumbia_fiesta;
  const filtered = list.filter((t) => !recentArtists.some((r) => r.toLowerCase().includes(t.author.toLowerCase())));
  const pool = filtered.length > 0 ? filtered : list;
  return { ...pool[Math.floor(Math.random() * pool.length)], versionType: 'official' };
}
