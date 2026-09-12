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

