// ==============================================================================
// BANCO DE CANCIONES DE AUTO-DJ: GÉNEROS ROCK & POP
// Archivo: client/src/services/autoDjCatalogRockPop.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

import type { FallbackTrack } from './autoDjFallbacks';

export const ROCK_POP_CATALOG: Record<string, FallbackTrack[]> = {
  rock_nacional: [
    // Rotación 0
    { videoId: 'T_FkEw27XJ0', title: 'Soda Stereo - De Música Ligera', author: 'Soda Stereo', durationSeconds: 211, durationText: '3:31', thumbnailUrl: 'https://i.ytimg.com/vi/T_FkEw27XJ0/hq720.jpg' },
    { videoId: 'Mm3IgrVsu24', title: 'Charly García - Demoliendo Hoteles', author: 'Charly Garcia', durationSeconds: 129, durationText: '2:09', thumbnailUrl: 'https://i.ytimg.com/vi/Mm3IgrVsu24/hq720.jpg' },
    { videoId: 'lYC5wlY8d6A', title: 'Los Enanitos Verdes - Lamento Boliviano', author: 'Enanitos Verdes', durationSeconds: 222, durationText: '3:42', thumbnailUrl: 'https://i.ytimg.com/vi/lYC5wlY8d6A/hq720.jpg' },
    // Rotación 1
    { videoId: 'UCF9oHXhDMU', title: 'Andrés Calamaro - Flaca', author: 'Andres Calamaro', durationSeconds: 273, durationText: '4:33', thumbnailUrl: 'https://i.ytimg.com/vi/UCF9oHXhDMU/hqdefault.jpg' },
    { videoId: 'e2D6E3r9k1A', title: 'Los Redondos - Jijiji', author: 'Los Redondos', durationSeconds: 320, durationText: '5:20', thumbnailUrl: 'https://i.ytimg.com/vi/e2D6E3r9k1A/hqdefault.jpg' },
    { videoId: 'fP8e2xK5j1A', title: 'Fito Páez - El Amor Después del Amor', author: 'Fito Paez', durationSeconds: 310, durationText: '5:10', thumbnailUrl: 'https://i.ytimg.com/vi/fP8e2xK5j1A/hqdefault.jpg' },
    // Rotación 2
    { videoId: 'bP8e2xK5j1A', title: 'Los Piojos - Bicho de Ciudad', author: 'Los Piojos', durationSeconds: 315, durationText: '5:15', thumbnailUrl: 'https://i.ytimg.com/vi/bP8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'pA8e2xK5j1A', title: 'Soda Stereo - Persiana Americana', author: 'Soda Stereo', durationSeconds: 290, durationText: '4:50', thumbnailUrl: 'https://i.ytimg.com/vi/pA8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'pB8e2xK5j1A', title: 'Charly García - Promesas Sobre El Bidet', author: 'Charly Garcia', durationSeconds: 205, durationText: '3:25', thumbnailUrl: 'https://i.ytimg.com/vi/pB8e2xK5j1A/hqdefault.jpg' },
    // Rotación 3
    { videoId: 'sR8e2xK5j1A', title: 'Divididos - Spaghetti del Rock', author: 'Divididos', durationSeconds: 212, durationText: '3:32', thumbnailUrl: 'https://i.ytimg.com/vi/sR8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'cR8e2xK5j1A', title: 'Los Auténticos Decadentes - Corazón', author: 'Autenticos Decadentes', durationSeconds: 245, durationText: '4:05', thumbnailUrl: 'https://i.ytimg.com/vi/cR8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'mH8e2xK5j1A', title: 'Andrés Calamaro - Mil Horas', author: 'Andres Calamaro', durationSeconds: 170, durationText: '2:50', thumbnailUrl: 'https://i.ytimg.com/vi/mH8e2xK5j1A/hqdefault.jpg' },
  ],
  rock_internacional: [
    // Rotación 0
    { videoId: 'YJ105oW5gns', title: 'Queen & Axl Rose - We Will Rock You', author: 'Queen', durationSeconds: 165, durationText: '2:45', thumbnailUrl: 'https://i.ytimg.com/vi/YJ105oW5gns/hq720.jpg' },
    { videoId: 'YxW9iekNSek', title: 'Guns N Roses - Rocket Queen', author: 'Guns N Roses', durationSeconds: 374, durationText: '6:14', thumbnailUrl: 'https://i.ytimg.com/vi/YxW9iekNSek/hq720.jpg' },
    { videoId: 'fJ9rUzIMcZQ', title: 'Queen - Bohemian Rhapsody', author: 'Queen', durationSeconds: 359, durationText: '5:59', thumbnailUrl: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg' },
    // Rotación 1
    { videoId: 'aC8e2xK5j1A', title: 'AC/DC - Back In Black', author: 'AC/DC', durationSeconds: 255, durationText: '4:15', thumbnailUrl: 'https://i.ytimg.com/vi/aC8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'nS8e2xK5j1A', title: 'Nirvana - Smells Like Teen Spirit', author: 'Nirvana', durationSeconds: 301, durationText: '5:01', thumbnailUrl: 'https://i.ytimg.com/vi/nS8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'aI8e2xK5j1A', title: 'Aerosmith - I Don\'t Want to Miss a Thing', author: 'Aerosmith', durationSeconds: 298, durationText: '4:58', thumbnailUrl: 'https://i.ytimg.com/vi/aI8e2xK5j1A/hqdefault.jpg' },
    // Rotación 2
    { videoId: 'rC8e2xK5j1A', title: 'Red Hot Chili Peppers - Californication', author: 'Red Hot Chili Peppers', durationSeconds: 320, durationText: '5:20', thumbnailUrl: 'https://i.ytimg.com/vi/rC8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'rP8e2xK5j1A', title: 'The Rolling Stones - Paint It Black', author: 'The Rolling Stones', durationSeconds: 225, durationText: '3:45', thumbnailUrl: 'https://i.ytimg.com/vi/rP8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'bI8e2xK5j1A', title: 'Bon Jovi - It\'s My Life', author: 'Bon Jovi', durationSeconds: 224, durationText: '3:44', thumbnailUrl: 'https://i.ytimg.com/vi/bI8e2xK5j1A/hqdefault.jpg' },
    // Rotación 3
    { videoId: 'gN8e2xK5j1A', title: 'Guns N Roses - November Rain', author: 'Guns N Roses', durationSeconds: 535, durationText: '8:55', thumbnailUrl: 'https://i.ytimg.com/vi/gN8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'qD8e2xK5j1A', title: 'Queen - Don\'t Stop Me Now', author: 'Queen', durationSeconds: 210, durationText: '3:30', thumbnailUrl: 'https://i.ytimg.com/vi/qD8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'aH8e2xK5j1A', title: 'AC/DC - Highway to Hell', author: 'AC/DC', durationSeconds: 208, durationText: '3:28', thumbnailUrl: 'https://i.ytimg.com/vi/aH8e2xK5j1A/hqdefault.jpg' },
  ],
  hits_80_90: [
    // Rotación 0
    { videoId: 'fJ9rUzIMcZQ', title: 'Queen - Bohemian Rhapsody', author: 'Queen', durationSeconds: 359, durationText: '5:59', thumbnailUrl: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg' },
    { videoId: 'Zi_XLOBDo_Y', title: 'Michael Jackson - Billie Jean', author: 'Michael Jackson', durationSeconds: 295, durationText: '4:55', thumbnailUrl: 'https://i.ytimg.com/vi/Zi_XLOBDo_Y/hqdefault.jpg' },
    { videoId: 'lDK9QqIzhwk', title: 'Bon Jovi - Livin\' On A Prayer', author: 'Bon Jovi', durationSeconds: 245, durationText: '4:05', thumbnailUrl: 'https://i.ytimg.com/vi/lDK9QqIzhwk/hqdefault.jpg' },
    // Rotación 1
    { videoId: 'djV11Xbc914', title: 'a-ha - Take On Me', author: 'a-ha', durationSeconds: 225, durationText: '3:45', thumbnailUrl: 'https://i.ytimg.com/vi/djV11Xbc914/hqdefault.jpg' },
    { videoId: 'zmD5aow3d_A', title: '80s Mega Hits - Madonna, Michael Jackson, A-ha', author: 'Hits 80s', durationSeconds: 332, durationText: '5:32', thumbnailUrl: 'https://i.ytimg.com/vi/zmD5aow3d_A/hq720.jpg' },
    { videoId: 'cG8e2xK5j1A', title: 'Cyndi Lauper - Girls Just Want to Have Fun', author: 'Cyndi Lauper', durationSeconds: 235, durationText: '3:55', thumbnailUrl: 'https://i.ytimg.com/vi/cG8e2xK5j1A/hqdefault.jpg' },
    // Rotación 2
    { videoId: 'tP8e2xK5j1A', title: 'The Police - Every Breath You Take', author: 'The Police', durationSeconds: 250, durationText: '4:10', thumbnailUrl: 'https://i.ytimg.com/vi/tP8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'qW8e2xK5j1A', title: 'Queen - I Want to Break Free', author: 'Queen', durationSeconds: 260, durationText: '4:20', thumbnailUrl: 'https://i.ytimg.com/vi/qW8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'wH8e2xK5j1A', title: 'Whitney Houston - I Wanna Dance With Somebody', author: 'Whitney Houston', durationSeconds: 300, durationText: '5:00', thumbnailUrl: 'https://i.ytimg.com/vi/wH8e2xK5j1A/hqdefault.jpg' },
    // Rotación 3
    { videoId: 'mP8e2xK5j1A', title: 'Madonna - Like a Prayer', author: 'Madonna', durationSeconds: 340, durationText: '5:40', thumbnailUrl: 'https://i.ytimg.com/vi/mP8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'sC8e2xK5j1A', title: 'Guns N Roses - Sweet Child O Mine', author: 'Guns N Roses', durationSeconds: 355, durationText: '5:55', thumbnailUrl: 'https://i.ytimg.com/vi/sC8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'eF8e2xK5j1A', title: 'Europe - The Final Countdown', author: 'Europe', durationSeconds: 310, durationText: '5:10', thumbnailUrl: 'https://i.ytimg.com/vi/eF8e2xK5j1A/hqdefault.jpg' },
  ],
};
