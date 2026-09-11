import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isTvDevice } from './deviceDetector';

describe('deviceDetector - isTvDevice', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const fakeLocalStorage = {
      getItem: (k: string) => mockStorage[k] ?? null,
      setItem: (k: string, v: string) => { mockStorage[k] = v; },
      removeItem: (k: string) => { delete mockStorage[k]; },
      clear: () => { mockStorage = {}; },
    };
    vi.stubGlobal('localStorage', fakeLocalStorage);
    vi.stubGlobal('window', {
      location: new URL('https://karaoke-tc-c9fb.vercel.app/'),
      innerWidth: 390,
      innerHeight: 844,
    });
  });

  it('detects Android phone as mobile (not TV)', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
      maxTouchPoints: 5,
    });
    expect(isTvDevice()).toBe(false);
  });

  it('detects iPhone as mobile (not TV)', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
      maxTouchPoints: 5,
    });
    expect(isTvDevice()).toBe(false);
  });

  it('detects Android TV (Android without Mobile in UA)', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Linux; U; Android TV 11; BRAVIA 4K VH2 Build/PTM1.200817.001) AppleWebKit/537.36',
      maxTouchPoints: 0,
    });
    vi.stubGlobal('window', {
      location: new URL('https://karaoke-tc-c9fb.vercel.app/'),
      innerWidth: 1920,
      innerHeight: 1080,
    });
    expect(isTvDevice()).toBe(true);
  });

  it('detects FireTV / Tizen / WebOS as TV', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Web0S; SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36',
      maxTouchPoints: 0,
    });
    expect(isTvDevice()).toBe(true);
  });

  it('respects URL device=tv even on mobile', () => {
    vi.stubGlobal('window', {
      location: new URL('https://karaoke-tc-c9fb.vercel.app/?device=tv'),
      innerWidth: 390,
      innerHeight: 844,
    });
    expect(isTvDevice()).toBe(true);
  });

  it('respects URL device=mobile even on TV', () => {
    vi.stubGlobal('window', {
      location: new URL('https://karaoke-tc-c9fb.vercel.app/?device=mobile'),
      innerWidth: 1920,
      innerHeight: 1080,
    });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Linux; U; Android TV 11; BRAVIA 4K VH2)',
      maxTouchPoints: 0,
    });
    expect(isTvDevice()).toBe(false);
  });
});
