import { AUTO_DJ_STATIONS } from './autoDjStations';

const DAILY_ARTISTS: Record<string, string[]> = {
  cumbia_fiesta: ['Los Palmeras', 'Gilda', 'Rafaga', 'Amar Azul', 'La Nueva Luna', 'Damas Gratis', 'Leo Mattioli'],
  rock_nacional: ['Soda Stereo', 'Charly Garcia', 'Fito Paez', 'Los Redondos', 'Andres Calamaro', 'Los Piojos', 'Enanitos Verdes'],
  cuarteto_cordobes: ['Rodrigo', 'La Mona Jimenez', 'La Konga', 'Walter Olmos', 'Ulises Bueno', 'Q Lokura', 'Luck Ra'],
  hits_80_90: ['Queen', 'Michael Jackson', 'Bon Jovi', 'Madonna', 'Guns N Roses', 'a-ha', 'The Police'],
  chill_lounge: ['Norah Jones', 'Jack Johnson', 'Amy Winehouse', 'John Mayer', 'Sade', 'Katie Melua', 'Michael Buble'],
  karaoke_hits: ['Pimpinela', 'Luis Miguel', 'Cristian Castro', 'Ricardo Montaner', 'Marco Antonio Solis', 'Camilo Sesto'],
  rock_internacional: ['AC/DC', 'Aerosmith', 'The Rolling Stones', 'Led Zeppelin', 'Nirvana', 'Red Hot Chili Peppers'],
  pop_latino: ['Shakira', 'Ricky Martin', 'Chayanne', 'Thalia', 'Paulina Rubio', 'Enrique Iglesias'],
  rkt_villera: ['L-Gante', 'Callejero Fino', 'Pablo Lescano', 'La Joaqui', 'Kaleb Di Masi', 'El Noba'],
  folclore_argentino: ['Los Nocheros', 'Soledad Pastorutti', 'Chaqueño Palavecino', 'Horacio Guarany', 'Mercedes Sosa'],
};

function getDayHash(seedStr: string): number {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getDailySeedForGenre(genreId: string, dateStr?: string): { artist: string; query: string } {
  const effectiveDate = dateStr || new Date().toISOString().slice(0, 10);
  const cleanGenre = genreId.startsWith('seed:') ? 'cumbia_fiesta' : genreId;
  const list = DAILY_ARTISTS[cleanGenre] || DAILY_ARTISTS.cumbia_fiesta;
  const hash = getDayHash(`${cleanGenre}_${effectiveDate}`);
  const index = hash % list.length;
  const artist = list[index] || list[0];

  return {
    artist,
    query: `${artist} exitos oficial video`,
  };
}

export function getDailySeedSongInfo(genreId: string): string {
  const seed = getDailySeedForGenre(genreId);
  const st = AUTO_DJ_STATIONS.find((s) => s.id === genreId);
  const genreName = st ? st.name : genreId;
  return `Semilla del día (${genreName}): ${seed.artist}`;
}
