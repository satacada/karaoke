import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getInitialMode } from './App';

describe('App - getInitialMode', () => {
  beforeEach(() => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    });
  });

  it('routes /join to guest regardless of isTv flag', () => {
    vi.stubGlobal('window', {
      location: new URL('https://karaoke-tc-c9fb.vercel.app/join?room=FIESTA'),
    });
    expect(getInitialMode(true)).toBe('guest');
    expect(getInitialMode(false)).toBe('guest');
  });

  it('routes /host to host regardless of isTv flag', () => {
    vi.stubGlobal('window', {
      location: new URL('https://karaoke-tc-c9fb.vercel.app/host?pair=TV-1234'),
    });
    expect(getInitialMode(true)).toBe('host');
    expect(getInitialMode(false)).toBe('host');
  });

  it('routes ?pair=TV-1234 to host', () => {
    vi.stubGlobal('window', {
      location: new URL('https://karaoke-tc-c9fb.vercel.app/?pair=TV-1234'),
    });
    expect(getInitialMode(true)).toBe('host');
    expect(getInitialMode(false)).toBe('host');
  });

  it('routes /tv to tv', () => {
    vi.stubGlobal('window', {
      location: new URL('https://karaoke-tc-c9fb.vercel.app/tv?room=FIESTA'),
    });
    expect(getInitialMode(false)).toBe('tv');
  });

  it('defaults to tv if isTv is true and no URL override is provided', () => {
    vi.stubGlobal('window', {
      location: new URL('https://karaoke-tc-c9fb.vercel.app/'),
    });
    expect(getInitialMode(true)).toBe('tv');
  });

  it('defaults to host on mobile if no URL override is provided', () => {
    vi.stubGlobal('window', {
      location: new URL('https://karaoke-tc-c9fb.vercel.app/'),
    });
    expect(getInitialMode(false)).toBe('host');
  });
});
