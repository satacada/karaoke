const RECENT_ARTISTS_KEY = 'karaoke_autodj_recent_artists';

export const ARTIST_CLUSTERS: string[][] = [
  ['stone temple pilots', 'pearl jam', 'nirvana', 'soundgarden', 'alice in chains', 'foo fighters', 'red hot chili peppers', 'smashing pumpkins', 'audioslave', 'bush', 'radiohead', 'oasis'],
  ['queen', 'bon jovi', 'guns n roses', 'aerosmith', 'acdc', 'led zeppelin', 'the police', 'kiss', 'def leppard', 'the rolling stones', 'the beatles'],
  ['soda stereo', 'charly garcia', 'fito paez', 'los redondos', 'indio solari', 'andres calamaro', 'los rodriguez', 'babasonicos', 'spinetta', 'enanitos verdes', 'la renga', 'los piojos', 'ciro y los persas', 'divididos', 'virus', 'las pastillas del abuelo', 'los fabulosos cadillacs', 'autenticos decadentes'],
  ['michael jackson', 'madonna', 'george michael', 'whitney houston', 'cyndi lauper', 'prince', 'aha', 'wham', 'duran duran', 'phil collins', 'roxette'],
  ['los palmeras', 'damas gratis', 'gilda', 'rafaga', 'amar azul', 'la nueva luna', 'los angeles azules', 'leo mattioli', 'sombras', 'antonio rios', 'el polaco', 'nestor en bloque'],
  ['rodrigo', 'la mona jimenez', 'la konga', 'walter olmos', 'ulises bueno', 'q lokura', 'luck ra', 'jean carlos'],
  ['hector lavoe', 'marc anthony', 'frankie ruiz', 'willie colon', 'grupo niche', 'ruben blades', 'gilberto santa rosa'],
  ['daddy yankee', 'don omar', 'wisin y yandel', 'bad bunny', 'j balvin', 'ozuna', 'nicky jam', 'maluma', 'rauw alejandro'],
  ['luis miguel', 'ricardo montaner', 'cristian castro', 'jose jose', 'marco antonio solis', 'camilo sesto', 'chayanne', 'juan gabriel', 'alejandro sanz']
];

export function normalizeArtist(name?: string): string {
  if (!name) return '';
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').trim();
}

export function isKnownArtist(artist: string): boolean {
  const norm = normalizeArtist(artist);
  if (!norm || norm.length < 2) return false;
  return ARTIST_CLUSTERS.some((c) => c.some((a) => a === norm || (norm.length >= 4 && (a.includes(norm) || norm.includes(a)))));
}

export function extractArtistName(title: string, author?: string): string {
  const cleanAuthor = normalizeArtist(
    (author || '').replace(/(vevo|official|channel|oficial|records|musica|music|\s*-\s*topic)/gi, '')
  );
  if (!title) return cleanAuthor;

  const cleanTitle = title
    .replace(/\s*(\(|\[)(official|oficial|video|letra|lyrics|audio|hd|4k|karaoke|remastered|en vivo|live).*?(\)|\])/gi, '')
    .trim();
  const normTitle = normalizeArtist(cleanTitle);

  if (cleanAuthor.length >= 3 && cleanAuthor !== 'desconocido') {
    if (isKnownArtist(cleanAuthor)) return cleanAuthor;
    if (cleanAuthor.split(' ').some((w) => w.length >= 3 && normTitle.includes(w))) {
      return cleanAuthor;
    }
  }

  if (cleanTitle.includes(' - ')) {
    const parts = cleanTitle.split(' - ').map((p) => p.trim());
    for (const part of parts) {
      const norm = normalizeArtist(part);
      if (isKnownArtist(norm)) return norm;
      if (cleanAuthor && (norm.includes(cleanAuthor) || cleanAuthor.includes(norm))) {
        return cleanAuthor;
      }
    }
    const c0 = normalizeArtist(parts[0]);
    const c1 = normalizeArtist(parts[1]);
    if (c0.length >= 2 && c0.length <= 35) return c0;
    if (c1.length >= 2 && c1.length <= 35) return c1;
  }

  return cleanAuthor || normalizeArtist(cleanTitle.slice(0, 30));
}

export function getRecentArtists(): string[] {
  try {
    const raw = sessionStorage.getItem(RECENT_ARTISTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function recordRecentArtist(artist: string): void {
  const norm = normalizeArtist(artist);
  if (!norm || norm.length < 2) return;
  try {
    const recent = getRecentArtists().filter((a) => a !== norm);
    recent.unshift(norm);
    sessionStorage.setItem(RECENT_ARTISTS_KEY, JSON.stringify(recent.slice(0, 20)));
  } catch {}
}

export function isArtistRecent(artist: string, recentList?: string[], windowSize = 4): boolean {
  const norm = normalizeArtist(artist);
  if (!norm || norm.length < 2) return false;
  const recent = (recentList && recentList.length > 0 ? recentList : getRecentArtists()).map((a) => normalizeArtist(a)).slice(0, windowSize);
  return recent.some((r) => r === norm || (r.length > 3 && norm.length > 3 && (r.includes(norm) || norm.includes(r))));
}

export function getNextDiverseSeed(currentSeed: string, recentList?: string[]): string {
  const norm = normalizeArtist(currentSeed);
  const cluster = ARTIST_CLUSTERS.find((c) => c.some((a) => a.includes(norm) || norm.includes(a)));
  if (cluster) {
    const recent = (recentList && recentList.length > 0 ? recentList : getRecentArtists()).map((a) => normalizeArtist(a));
    const seedRecent = recent.slice(0, 3).some((r) => r === norm || r.includes(norm) || norm.includes(r));
    if (!seedRecent && Math.random() < 0.35) {
      return currentSeed;
    }
    const available = cluster.filter((a) => !recent.slice(0, 5).some((r) => r === a || a.includes(r) || r.includes(a)));
    const pool = available.length > 0 ? available : cluster.filter((a) => !recent.slice(0, 2).some((r) => r === a || a.includes(r)));
    if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
  }
  return `${currentSeed} exitos`;
}
