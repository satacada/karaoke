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
