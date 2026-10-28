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

    // 3. User-Agent (incluyendo TV Boxes chinos AOSP como Openbox b12 plus, FlowBox, MXQ, TX, X96, H96)
    const ua = (navigator.userAgent || navigator.vendor || '').toLowerCase();
    const tvPatterns = [
      'googletv', 'androidtv', 'smart-tv', 'smarttv', 'appletv', 'hbbtv',
      'netcast', 'viera', 'bravia', 'roku', 'firetv', 'aftb', 'aftm', 'afts',
      'boxee', 'kylo', 'webos', 'tizen', 'leanback', 'large screen', 'crkey',
      'mibox', 'mitv', 'shield android tv', 'tv box', 'tvbox', 'atv',
      'b12 plus', 'openbox', 'flowbox', 'mxq', 'x96', 'h96', 'tx3', 'tx6', 'tx9', 'rk322', 'rk33',
    ];
    if (tvPatterns.some((pattern) => ua.includes(pattern))) return true;

    // 4. En Android, los teléfonos incluyen "Mobile" en el User-Agent; las cajas TV Box AOSP NO incluyen "Mobile"
    const isAndroid = ua.includes('android');
    const isMobileUa = /mobile|iphone|ipod|ipad|android.*mobile|windows phone|blackberry|iemobile/i.test(ua);
    if (isAndroid && !isMobileUa) return true;

    const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
    const isSmallScreen = Math.min(window.innerWidth, window.innerHeight) < 640;

    if (isMobileUa || (hasTouch && isSmallScreen)) return false;

    // 5. Pantalla Panorámica de TV (Landscape 16:9 sin multitouch de escritorio/tv)
    const isLandscape = window.innerWidth > window.innerHeight;
    const aspectRatio = window.innerWidth / Math.max(1, window.innerHeight);

    if (isLandscape && aspectRatio >= 1.5 && window.innerWidth >= 960 && !hasTouch) {
      return true;
    }

    // 6. Ruta explícita /tv o ?mode=tv en dispositivos no móviles
    if (!hasTouch && (params.get('mode')?.toLowerCase() === 'tv' || window.location.pathname.toLowerCase().startsWith('/tv'))) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
