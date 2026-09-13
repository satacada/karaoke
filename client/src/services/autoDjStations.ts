import { normalizeArtist } from './artistDiversityService';

export interface AutoDjStation {
  id: string;
  name: string;
  icon: string;
  description: string;
  artists: string[];
}

export const AUTO_DJ_STATIONS: AutoDjStation[] = [
  {
    id: 'rock_nacional', name: 'Rock Nacional', icon: '🎸', description: 'Soda, Charly, Redondos, Fito, Piojos, Calamaro',
    artists: ['Soda Stereo', 'Charly Garcia', 'Fito Paez', 'Los Redondos', 'Indio Solari', 'Andres Calamaro', 'Los Rodriguez', 'Babasonicos', 'Spinetta', 'Enanitos Verdes', 'La Renga', 'Los Piojos', 'Divididos', 'Virus', 'Las Pastillas del Abuelo', 'Los Fabulosos Cadillacs', 'Autenticos Decadentes', 'Guasones', 'Ratones Paranoicos', 'Attaque 77'],
  },
  {
    id: 'cumbia_fiesta', name: 'Cumbia & Fiesta', icon: '🌴', description: 'Palmeras, Gilda, Damas Gratis, Ráfaga, Amar Azul',
    artists: ['Los Palmeras', 'Gilda', 'Rafaga', 'Amar Azul', 'La Nueva Luna', 'Los Angeles Azules', 'Damas Gratis', 'Leo Mattioli', 'Sombras', 'Antonio Rios', 'Pibes Chorros', 'La Repandilla', 'El Polaco', 'Nestor en Bloque', 'Karicia'],
  },
  {
    id: 'hits_80_90', name: 'Hits 80s y 90s', icon: '⚡', description: 'Queen, Michael Jackson, Bon Jovi, Madonna, Guns',
    artists: ['Queen', 'Michael Jackson', 'Bon Jovi', 'Madonna', 'Guns N Roses', 'a-ha', 'The Police', 'Cyndi Lauper', 'Whitney Houston', 'George Michael', 'Aerosmith', 'AC/DC', 'Wham', 'Duran Duran', 'Phil Collins', 'Roxette'],
  },
  {
    id: 'chill_lounge', name: 'Chill & Lounge', icon: '🍹', description: 'Norah Jones, Jack Johnson, Amy Winehouse, John Mayer',
    artists: ['Norah Jones', 'Jack Johnson', 'Amy Winehouse', 'John Mayer', 'Sade', 'Katie Melua', 'Michael Buble', 'Corinne Bailey Rae', 'Jason Mraz', 'Leon Bridges'],
  },
  {
    id: 'cuarteto_cordobes', name: 'Cuarteto & Fiesta', icon: '🎺', description: 'Rodrigo, La Mona, La Konga, Walter Olmos, Ulises',
    artists: ['Rodrigo', 'La Mona Jimenez', 'La Konga', 'Walter Olmos', 'Ulises Bueno', 'Q Lokura', 'Luck Ra', 'Jean Carlos', 'Trulala', 'Banda XXI'],
  },
  {
    id: 'karaoke_hits', name: 'Karaoke Éxitos', icon: '🎤', description: 'Pimpinela, Luis Miguel, Cristian Castro, Montaner',
    artists: ['Pimpinela', 'Luis Miguel', 'Cristian Castro', 'Ricardo Montaner', 'Marco Antonio Solis', 'Camilo Sesto', 'Chayanne', 'Juan Gabriel', 'Rocio Durcal', 'Jose Jose'],
  },
];

export function getStationArtistQuery(stationId: string, recentArtists: string[] = []): string {
  const station = AUTO_DJ_STATIONS.find((s) => s.id === stationId) || AUTO_DJ_STATIONS[0];
  const normRecent = recentArtists.map((a) => normalizeArtist(a));
  const available = station.artists.filter((a) => !normRecent.slice(0, 5).some((r) => r === normalizeArtist(a) || r.includes(normalizeArtist(a))));
  const pool = available.length > 0 ? available : station.artists.filter((a) => !normRecent.slice(0, 2).some((r) => r === normalizeArtist(a)));
  const chosen = pool[Math.floor(Math.random() * pool.length)] || station.artists[0];
  return `${chosen} exitos oficial video`;
}

export function parseAutoDjGenre(genre?: string, recentArtists: string[] = []): { isSeed: boolean; displayName: string; query: string } {
  if (!genre) return { isSeed: false, displayName: AUTO_DJ_STATIONS[0].name, query: getStationArtistQuery('rock_nacional', recentArtists) };
  if (genre.startsWith('seed:')) {
    const seed = genre.slice(5).trim();
    return { isSeed: true, displayName: seed || 'Semilla Musical', query: `${seed} musica oficial video` };
  }
  const found = AUTO_DJ_STATIONS.find((s) => s.id === genre);
  if (found) return { isSeed: false, displayName: found.name, query: getStationArtistQuery(found.id, recentArtists) };
  return { isSeed: false, displayName: genre, query: `${genre} exitos oficial` };
}

const EMERGENCY_FALLBACKS: Record<string, Array<{ videoId: string; title: string; author: string; durationSeconds: number; durationText: string; thumbnailUrl: string }>> = {
  rock_nacional: [
    { videoId: 'T_FkEw27XJ0', title: 'Soda Stereo - De Música Ligera', author: 'Soda Stereo', durationSeconds: 215, durationText: '3:35', thumbnailUrl: 'https://i.ytimg.com/vi/T_FkEw27XJ0/hqdefault.jpg' },
    { videoId: 'OX29Xv0i1h0', title: 'Charly García - Demoliendo Hoteles', author: 'Charly García', durationSeconds: 140, durationText: '2:20', thumbnailUrl: 'https://i.ytimg.com/vi/OX29Xv0i1h0/hqdefault.jpg' },
  ],
  cumbia_fiesta: [
    { videoId: '3h_B9aU7cHQ', title: 'Los Palmeras - El Bombón', author: 'Los Palmeras', durationSeconds: 195, durationText: '3:15', thumbnailUrl: 'https://i.ytimg.com/vi/3h_B9aU7cHQ/hqdefault.jpg' },
  ],
  hits_80_90: [
    { videoId: 'f4Mc-NY53H8', title: 'Queen - I Want to Break Free', author: 'Queen', durationSeconds: 225, durationText: '3:45', thumbnailUrl: 'https://i.ytimg.com/vi/f4Mc-NY53H8/hqdefault.jpg' },
  ],
  chill_lounge: [
    { videoId: 'tO4dxvguQDk', title: "Norah Jones - Don't Know Why", author: 'Norah Jones', durationSeconds: 185, durationText: '3:05', thumbnailUrl: 'https://i.ytimg.com/vi/tO4dxvguQDk/hqdefault.jpg' },
  ],
  cuarteto_cordobes: [
    { videoId: '8gM3w3q_v8g', title: 'Rodrigo - Ocho Cuarenta', author: 'Rodrigo', durationSeconds: 210, durationText: '3:30', thumbnailUrl: 'https://i.ytimg.com/vi/8gM3w3q_v8g/hqdefault.jpg' },
  ],
  karaoke_hits: [
    { videoId: 'Vv6o-3uC6fA', title: 'Pimpinela - Olvídame y Pega la Vuelta', author: 'Pimpinela', durationSeconds: 200, durationText: '3:20', thumbnailUrl: 'https://i.ytimg.com/vi/Vv6o-3uC6fA/hqdefault.jpg' },
  ],
};

export function getFallbackTrack(genre?: string): import('../types').SearchResultItem {
  const stationId = genre && EMERGENCY_FALLBACKS[genre] ? genre : 'rock_nacional';
  const list = EMERGENCY_FALLBACKS[stationId] || EMERGENCY_FALLBACKS.rock_nacional;
  const picked = list[Math.floor(Math.random() * list.length)];
  return { ...picked, versionType: 'official' };
}

