// ==============================================================================
// UTILIDAD: DETECTOR DE DISPOSITIVO (TV vs CELULAR MÓVIL)
// Archivo: client/src/utils/deviceDetector.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

/**
 * Determina si el entorno actual corresponde a un Smart TV o Android TV,
 * o si por el contrario es un celular móvil / tablet táctil.
 */
export function isTvDevice(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const params = new URLSearchParams(window.location.search);
    const deviceParam = params.get('device')?.toLowerCase();
    if (deviceParam === 'tv') return true;
    if (deviceParam === 'mobile') return false;

    // Si viene explícitamente con mode=tv en la URL
    const modeParam = params.get('mode')?.toLowerCase();
    if (modeParam === 'tv') return true;

    const ua = (navigator.userAgent || navigator.vendor || '').toLowerCase();

    // Patrones característicos de Smart TVs y consolas de TV
    const tvPatterns = [
      'googletv',
      'androidtv',
      'smart-tv',
      'smarttv',
      'appletv',
      'hbbtv',
      'netcast',
      'viera',
      'bravia',
      'roku',
      'firetv',
      'aftb',
      'aftm',
      'afts',
      'boxee',
      'kylo',
      'webos',
      'tizen',
      'leanback',
      'large screen',
    ];

    if (tvPatterns.some((pattern) => ua.includes(pattern))) {
      return true;
    }

    // Estándar oficial Android:
    // Los teléfonos Android incluyen "Mobile" en su User-Agent.
    // Los Android TV incluyen "Android" pero NO incluyen "Mobile".
    const isAndroid = ua.includes('android');
    const isMobile = ua.includes('mobile');
    if (isAndroid && !isMobile) {
      return true;
    }

    // Detección por ausencia total de interfaz táctil en pantalla de TV
    const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
    const isLandscapeWide = window.innerWidth >= 1200 && window.innerWidth > window.innerHeight;

    // Si es pantalla amplia sin pantalla táctil y no es explícitamente escritorio móvil
    if (!hasTouch && isLandscapeWide && !isMobile) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
