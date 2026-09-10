const RECENT_ARTISTS_KEY = 'karaoke_autodj_recent_artists';

const ARTIST_CLUSTERS: string[][] = [
  ['stone temple pilots', 'pearl jam', 'nirvana', 'soundgarden', 'alice in chains', 'foo fighters', 'red hot chili peppers', 'smashing pumpkins', 'audioslave', 'bush'],
  ['queen', 'bon jovi', 'guns n roses', 'aerosmith', 'acdc', 'led zeppelin', 'the police', 'kiss', 'def leppard'],
  ['soda stereo', 'charly garcia', 'fito paez', 'los redondos', 'andres calamaro', 'babasonicos', 'spinetta', 'enanitos verdes', 'la renga', 'los piojos'],
  ['michael jackson', 'madonna', 'george michael', 'whitney houston', 'cyndi lauper', 'prince', 'aha', 'wham', 'duran duran'],
  ['los palmeras', 'damas gratis', 'gilda', 'rafaga', 'rodrigo', 'la mona jimenez', 'la konga', 'los angeles azules', 'amar azul'],
  ['hector lavoe', 'marc anthony', 'frankie ruiz', 'willie colon', 'grupo niche', 'ruben blades', 'gilberto santa rosa'],
  ['daddy yankee', 'don omar', 'wisin y yandel', 'bad bunny', 'j balvin', 'ozuna', 'nicky jam', 'maluma'],
  ['luis miguel', 'ricardo montaner', 'cristian castro', 'jose jose', 'marco antonio solis', 'camilo sesto', 'chayanne']
];

export function normalizeArtist(name?: string): string {
  if (!name) return '';
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').trim();
}

export function extractArtistName(title: string, author?: string): string {
  if (!title) return normalizeArtist(author);
  const cleanTitle = title.replace(/\s*(\(|\[)(official|oficial|video|letra|lyrics|audio|hd|4k|karaoke|remastered|en vivo|live).*?(\)|\])/gi, '').trim();
  if (cleanTitle.includes(' - ')) {
    const candidate = cleanTitle.split(' - ')[0].trim();
    if (candidate.length >= 2 && candidate.length <= 35) return normalizeArtist(candidate);
  }
  const cleanAuthor = (author || '').replace(/(vevo|official|channel|oficial|records|\s*-\s*topic)/gi, '').trim();
  return normalizeArtist(cleanAuthor || cleanTitle.slice(0, 30));
}

export function getRecentArtists(): string[] {
  try {
    const raw = sessionStorage.getItem(RECENT_ARTISTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
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

export function isArtistRecent(artist: string, windowSize = 4): boolean {
  const norm = normalizeArtist(artist);
  if (!norm || norm.length < 2) return false;
  const recent = getRecentArtists().slice(0, windowSize);
  return recent.some((r) => r === norm || (r.length > 3 && norm.length > 3 && (r.includes(norm) || norm.includes(r))));
}

export function getNextDiverseSeed(currentSeed: string): string {
  const norm = normalizeArtist(currentSeed);
  const cluster = ARTIST_CLUSTERS.find((c) => c.some((a) => a.includes(norm) || norm.includes(a)));
  if (cluster) {
    const recent = getRecentArtists();
    const available = cluster.filter((a) => !recent.slice(0, 5).some((r) => r === a || a.includes(r)));
    const pool = available.length > 0 ? available : cluster.filter((a) => !recent.slice(0, 2).includes(a));
    if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
  }
  return `${currentSeed} varios artistas grandes exitos`;
}
