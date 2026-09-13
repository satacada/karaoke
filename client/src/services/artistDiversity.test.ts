import { describe, it, expect } from 'vitest';
import {
  normalizeArtist,
  extractArtistName,
  isArtistRecent,
  getNextDiverseSeed,
} from './artistDiversityService';
import { getStationArtistQuery, parseAutoDjGenre } from './autoDjStations';

describe('Auto-DJ Artist Diversity & Smart Rotation', () => {
  it('normaliza nombres de artistas eliminando acentos y mayúsculas', () => {
    expect(normalizeArtist('Charly García')).toBe('charly garcia');
    expect(normalizeArtist('Soda Stéreo!')).toBe('soda stereo');
    expect(normalizeArtist('Ráfaga')).toBe('rafaga');
  });

  it('extrae el artista correcto de títulos estándar Artista - Tema', () => {
    const artist = extractArtistName('Soda Stereo - De Música Ligera', 'Soda Stereo');
    expect(artist).toBe('soda stereo');
  });

  it('detecta el artista aun cuando el título del recital está invertido (Tema - Lugar - Artista)', () => {
    const artist = extractArtistName(
      'Ji Ji Ji - Estadio Único de La Plata - Indio en Concierto [2008] FullHD',
      'Indio Solari Oficial'
    );
    expect(artist).toBe('indio solari');
  });

  it('limpia sufijos de canales oficiales como VEVO, Oficial, - Topic', () => {
    const artist = extractArtistName('Bohemian Rhapsody', 'QueenVEVO');
    expect(artist).toBe('queen');
  });

  it('detecta si un artista fue reproducido recientemente', () => {
    const recent = ['charly garcia', 'soda stereo', 'fito paez'];
    expect(isArtistRecent('Soda Stereo', recent, 4)).toBe(true);
    expect(isArtistRecent('Charly Garcia', recent, 4)).toBe(true);
    expect(isArtistRecent('Los Piojos', recent, 4)).toBe(false);
  });

  it('ofrece artistas diversos de la constelación evitando los recientes', () => {
    const recent = ['queen', 'bon jovi', 'guns n roses'];
    const nextSeed = getNextDiverseSeed('Queen', recent);
    expect(nextSeed).toBeDefined();
    expect(recent.includes(normalizeArtist(nextSeed))).toBe(false);
  });

  it('genera búsquedas variadas por estación excluyendo los últimos artistas', () => {
    const recent = ['soda stereo', 'charly garcia', 'fito paez'];
    const query = getStationArtistQuery('rock_nacional', recent);
    expect(query).toContain('exitos oficial video');
    expect(query).not.toContain('soda stereo');
    expect(query).not.toContain('charly garcia');
  });

  it('parseAutoDjGenre usa la rotación inteligente de artistas por estación', () => {
    const recent = ['los palmeras', 'gilda'];
    const result = parseAutoDjGenre('cumbia_fiesta', recent);
    expect(result.displayName).toBe('Cumbia & Fiesta');
    expect(result.query).toContain('exitos oficial video');
    expect(result.query).not.toContain('los palmeras');
  });
});
