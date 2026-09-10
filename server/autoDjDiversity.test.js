import { describe, it, expect } from 'vitest';
import { findRelatedArtists, interleaveArtistResults } from './genreDefinitions.js';

describe('Auto-DJ & Búsqueda por Artistas y Diversidad', () => {
  it('detecta Stone Temple Pilots y retorna familia de grunge/rock alternativo de los 90', () => {
    const related = findRelatedArtists('Stone Temple Pilots');
    expect(related).toBeDefined();
    expect(related).toContain('Stone Temple Pilots');
    expect(related).toContain('Pearl Jam');
    expect(related).toContain('Nirvana');
    expect(related).toContain('Soundgarden');
    expect(related).toContain('Alice in Chains');
  });

  it('detecta busqueda por genero rock 80s y retorna artistas variados', () => {
    const artists = findRelatedArtists('rock de los 80');
    expect(artists).toBeDefined();
    expect(artists).toContain('Queen');
    expect(artists).toContain('Bon Jovi');
    expect(artists).toContain('Soda Stereo');
  });

  it('detecta busqueda de salsa y retorna artistas de salsa', () => {
    const artists = findRelatedArtists('salsa clasica');
    expect(artists).toBeDefined();
    expect(artists).toContain('Hector Lavoe');
    expect(artists).toContain('Marc Anthony');
  });

  it('intercala canciones de múltiples artistas para evitar repeticiones consecutivas (round-robin)', () => {
    const groupSTP = [
      { videoId: 'stp-1', title: 'Plush - Stone Temple Pilots' },
      { videoId: 'stp-2', title: 'Interstate Love Song - Stone Temple Pilots' },
    ];
    const groupPJ = [
      { videoId: 'pj-1', title: 'Alive - Pearl Jam' },
      { videoId: 'pj-2', title: 'Black - Pearl Jam' },
    ];
    const groupNirvana = [
      { videoId: 'nirv-1', title: 'Smells Like Teen Spirit - Nirvana' },
    ];

    const interleaved = interleaveArtistResults([groupSTP, groupPJ, groupNirvana]);

    // Debería ser: STP 1, Pearl Jam 1, Nirvana 1, STP 2, Pearl Jam 2
    expect(interleaved.length).toBe(5);
    expect(interleaved[0].videoId).toBe('stp-1');
    expect(interleaved[1].videoId).toBe('pj-1');
    expect(interleaved[2].videoId).toBe('nirv-1');
    expect(interleaved[3].videoId).toBe('stp-2');
    expect(interleaved[4].videoId).toBe('pj-2');

    // Comprobamos que dos canciones consecutivas no son del mismo artista inicial
    expect(interleaved[0].videoId).not.toBe(interleaved[1].videoId);
    expect(interleaved[1].videoId).not.toBe(interleaved[2].videoId);
  });
});
