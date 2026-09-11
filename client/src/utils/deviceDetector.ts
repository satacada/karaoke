// ==============================================================================
// UTILIDAD: DETECTOR DE DISPOSITIVO (TV vs CELULAR MÓVIL)
// Archivo: client/src/utils/deviceDetector.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

export function isTvDevice(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Anulación manual explícita
    const force = localStorage.getItem('rockola_force_device')?.toLowerCase();
    if (force === 'tv') return true;
    if (force === 'mobile') return false;

    // 2. Parámetros de URL
    const params = new URLSearchParams(window.location.search);
    const deviceParam = params.get('device')?.toLowerCase();
    if (deviceParam === 'tv') return true;
    if (deviceParam === 'mobile') return false;

    // 3. User-Agent
    const ua = (navigator.userAgent || navigator.vendor || '').toLowerCase();
    const tvPatterns = [
      'googletv', 'androidtv', 'smart-tv', 'smarttv', 'appletv', 'hbbtv',
      'netcast', 'viera', 'bravia', 'roku', 'firetv', 'aftb', 'aftm', 'afts',
      'boxee', 'kylo', 'webos', 'tizen', 'leanback', 'large screen', 'crkey',
      'mibox', 'mitv', 'shield android tv', 'tv box', 'atv',
    ];
    if (tvPatterns.some((pattern) => ua.includes(pattern))) return true;

    // 4. Si el User-Agent o pantalla táctil es de celular / móvil -> NUNCA es TV
    const isMobileUa = /mobile|iphone|ipod|ipad|android.*mobile|windows phone|blackberry|iemobile/i.test(ua);
    const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
    const isSmallScreen = Math.min(window.innerWidth, window.innerHeight) < 640;

    if (isMobileUa || (hasTouch && isSmallScreen)) return false;

    // 5. Android TV oficial: "Android" sin "Mobile" y pantalla amplia sin touch
    const isAndroid = ua.includes('android');
    if (isAndroid && !isMobileUa && !hasTouch) return true;

    // 6. Pantalla Panorámica de TV (Landscape 16:9 sin multitouch de escritorio/tv)
    const isLandscape = window.innerWidth > window.innerHeight;
    const aspectRatio = window.innerWidth / Math.max(1, window.innerHeight);

    if (isLandscape && aspectRatio >= 1.5 && window.innerWidth >= 960 && !hasTouch) {
      return true;
    }

    // 7. Ruta explícita /tv o ?mode=tv en dispositivos no móviles
    if (!hasTouch && (params.get('mode')?.toLowerCase() === 'tv' || window.location.pathname.toLowerCase().startsWith('/tv'))) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
