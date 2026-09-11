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
    if (params.get('mode')?.toLowerCase() === 'tv') return true;
    if (window.location.pathname.toLowerCase().startsWith('/tv')) return true;

    // 3. User-Agent
    const ua = (navigator.userAgent || navigator.vendor || '').toLowerCase();
    const tvPatterns = [
      'googletv', 'androidtv', 'smart-tv', 'smarttv', 'appletv', 'hbbtv',
      'netcast', 'viera', 'bravia', 'roku', 'firetv', 'aftb', 'aftm', 'afts',
      'boxee', 'kylo', 'webos', 'tizen', 'leanback', 'large screen', 'crkey',
      'mibox', 'mitv', 'shield android tv', 'tv box', 'atv',
    ];
    if (tvPatterns.some((pattern) => ua.includes(pattern))) return true;

    // 4. Si el User-Agent es claramente un celular / móvil -> NUNCA es TV
    const isMobile = /mobile|iphone|ipod|ipad|android.*mobile|windows phone|blackberry|iemobile/i.test(ua);
    if (isMobile) return false;

    // 5. Regla oficial Android TV: "Android" sin "Mobile"
    const isAndroid = ua.includes('android');
    if (isAndroid && !isMobile) return true;

    // 6. Pantalla Panorámica de TV (Landscape 16:9 sin multitouch)
    const isLandscape = window.innerWidth > window.innerHeight;
    const aspectRatio = window.innerWidth / Math.max(1, window.innerHeight);
    const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;

    if (isLandscape && aspectRatio >= 1.5 && window.innerWidth >= 960 && !hasTouch) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
