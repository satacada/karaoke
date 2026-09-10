const KEY_ENABLED = 'tv_auto_dj_active_';
const KEY_GENRE = 'tv_auto_dj_genre_';

export function isLocalAutoDjActive(roomCode: string): boolean {
  try {
    return localStorage.getItem(`${KEY_ENABLED}${roomCode}`) === 'true';
  } catch {
    return false;
  }
}

export function setLocalAutoDjActive(roomCode: string, active: boolean, genre?: string): void {
  try {
    localStorage.setItem(`${KEY_ENABLED}${roomCode}`, active ? 'true' : 'false');
    if (genre) {
      localStorage.setItem(`${KEY_GENRE}${roomCode}`, genre);
    }
  } catch {}
}

export function getLocalAutoDjGenre(roomCode: string): string {
  try {
    return localStorage.getItem(`${KEY_GENRE}${roomCode}`) || '';
  } catch {
    return '';
  }
}
