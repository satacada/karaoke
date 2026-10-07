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
  const effectiveGenre = genre || 'cumbia_fiesta';
  if (effectiveGenre.startsWith('seed:')) {
    const seed = effectiveGenre.slice(5).trim();
    return { isSeed: true, displayName: seed || 'Semilla Musical', query: `${seed} musica oficial video` };
  }
  const found = AUTO_DJ_STATIONS.find((s) => s.id === effectiveGenre);
  if (found) return { isSeed: false, displayName: found.name, query: getStationArtistQuery(found.id, recentArtists) };
  return { isSeed: false, displayName: effectiveGenre, query: `${effectiveGenre} exitos oficial` };
}

const EMERGENCY_FALLBACKS: Record<string, Array<{ videoId: string; title: string; author: string; durationSeconds: number; durationText: string; thumbnailUrl: string }>> = {
  rock_nacional: [
    { videoId: 'T_FkEw27XJ0', title: 'Soda Stereo - De Música Ligera', author: 'Soda Stereo', durationSeconds: 215, durationText: '3:35', thumbnailUrl: 'https://i.ytimg.com/vi/T_FkEw27XJ0/hqdefault.jpg' },
    { videoId: 'OX29Xv0i1h0', title: 'Charly García - Demoliendo Hoteles', author: 'Charly García', durationSeconds: 140, durationText: '2:20', thumbnailUrl: 'https://i.ytimg.com/vi/OX29Xv0i1h0/hqdefault.jpg' },
    { videoId: 'pjPA7CXutDw', title: 'Los Fabulosos Cadillacs - Matador', author: 'Los Fabulosos Cadillacs', durationSeconds: 305, durationText: '5:05', thumbnailUrl: 'https://i.ytimg.com/vi/pjPA7CXutDw/hqdefault.jpg' },
    { videoId: 'ID-iJOw9rLo', title: 'Auténticos Decadentes - La Guitarra', author: 'Auténticos Decadentes', durationSeconds: 207, durationText: '3:27', thumbnailUrl: 'https://i.ytimg.com/vi/ID-iJOw9rLo/hqdefault.jpg' },
  ],
  cumbia_fiesta: [
    { videoId: '3h_B9aU7cHQ', title: 'Los Palmeras - El Bombón', author: 'Los Palmeras', durationSeconds: 195, durationText: '3:15', thumbnailUrl: 'https://i.ytimg.com/vi/3h_B9aU7cHQ/hqdefault.jpg' },
    { videoId: '7XqO7K-gXW4', title: 'Gilda - No Me Arrepiento de Este Amor', author: 'Gilda', durationSeconds: 210, durationText: '3:30', thumbnailUrl: 'https://i.ytimg.com/vi/7XqO7K-gXW4/hqdefault.jpg' },
    { videoId: '6b4V7Qk81f0', title: 'Ráfaga - Una Cerveza', author: 'Ráfaga', durationSeconds: 190, durationText: '3:10', thumbnailUrl: 'https://i.ytimg.com/vi/6b4V7Qk81f0/hqdefault.jpg' },
    { videoId: '1e4E_kY3kLo', title: 'Amar Azul - Yo Me Enamoré', author: 'Amar Azul', durationSeconds: 205, durationText: '3:25', thumbnailUrl: 'https://i.ytimg.com/vi/1e4E_kY3kLo/hqdefault.jpg' },
  ],
  hits_80_90: [
    { videoId: 'f4Mc-NY53H8', title: 'Queen - I Want to Break Free', author: 'Queen', durationSeconds: 225, durationText: '3:45', thumbnailUrl: 'https://i.ytimg.com/vi/f4Mc-NY53H8/hqdefault.jpg' },
    { videoId: 'Zi_XLOBDo_Y', title: 'Michael Jackson - Billie Jean', author: 'Michael Jackson', durationSeconds: 295, durationText: '4:55', thumbnailUrl: 'https://i.ytimg.com/vi/Zi_XLOBDo_Y/hqdefault.jpg' },
    { videoId: 'lDK9QqIzhwk', title: 'Bon Jovi - Livin On A Prayer', author: 'Bon Jovi', durationSeconds: 245, durationText: '4:05', thumbnailUrl: 'https://i.ytimg.com/vi/lDK9QqIzhwk/hqdefault.jpg' },
    { videoId: 'EDwb9jOVRtU', title: 'a-ha - Take On Me', author: 'a-ha', durationSeconds: 228, durationText: '3:48', thumbnailUrl: 'https://i.ytimg.com/vi/EDwb9jOVRtU/hqdefault.jpg' },
  ],
  chill_lounge: [
    { videoId: 'tO4dxvguQDk', title: "Norah Jones - Don't Know Why", author: 'Norah Jones', durationSeconds: 185, durationText: '3:05', thumbnailUrl: 'https://i.ytimg.com/vi/tO4dxvguQDk/hqdefault.jpg' },
    { videoId: 'b_nlIaA5dJ8', title: 'Jack Johnson - Banana Pancakes', author: 'Jack Johnson', durationSeconds: 192, durationText: '3:12', thumbnailUrl: 'https://i.ytimg.com/vi/b_nlIaA5dJ8/hqdefault.jpg' },
  ],
  cuarteto_cordobes: [
    { videoId: '8gM3w3q_v8g', title: 'Rodrigo - Ocho Cuarenta', author: 'Rodrigo', durationSeconds: 210, durationText: '3:30', thumbnailUrl: 'https://i.ytimg.com/vi/8gM3w3q_v8g/hqdefault.jpg' },
    { videoId: '9G_Z4Q1Z_v0', title: 'La Mona Jiménez - Beso a Beso', author: 'La Mona Jiménez', durationSeconds: 220, durationText: '3:40', thumbnailUrl: 'https://i.ytimg.com/vi/9G_Z4Q1Z_v0/hqdefault.jpg' },
    { videoId: 'W8eGZ5lG5mI', title: 'La K\'onga - Universo Paralelo', author: 'La K\'onga', durationSeconds: 205, durationText: '3:25', thumbnailUrl: 'https://i.ytimg.com/vi/W8eGZ5lG5mI/hqdefault.jpg' },
  ],
  karaoke_hits: [
    { videoId: 'Vv6o-3uC6fA', title: 'Pimpinela - Olvídame y Pega la Vuelta', author: 'Pimpinela', durationSeconds: 200, durationText: '3:20', thumbnailUrl: 'https://i.ytimg.com/vi/Vv6o-3uC6fA/hqdefault.jpg' },
    { videoId: 'mC8mU_k3H8o', title: 'Luis Miguel - Ahora Te Puedes Marchar', author: 'Luis Miguel', durationSeconds: 195, durationText: '3:15', thumbnailUrl: 'https://i.ytimg.com/vi/mC8mU_k3H8o/hqdefault.jpg' },
  ],
};

export function getFallbackTrack(genre?: string, recentArtists: string[] = []): import('../types').SearchResultItem {
  const stationId = genre && EMERGENCY_FALLBACKS[genre] ? genre : 'cumbia_fiesta';
  const list = EMERGENCY_FALLBACKS[stationId] || EMERGENCY_FALLBACKS.cumbia_fiesta || EMERGENCY_FALLBACKS.rock_nacional;
  const filtered = list.filter((t) => !recentArtists.some((r) => r.toLowerCase().includes(t.author.toLowerCase())));
  const pool = filtered.length > 0 ? filtered : list;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return { ...picked, versionType: 'official' };
}

