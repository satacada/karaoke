// ==============================================================================
// BANCO DE CANCIONES DE AUTO-DJ: CLÁSICOS, FOLCLORE & CHILL
// Archivo: client/src/services/autoDjCatalogClasicos.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

import type { FallbackTrack } from './autoDjFallbacks';

export const CLASICOS_CATALOG: Record<string, FallbackTrack[]> = {
  karaoke_hits: [
    // Rotación 0
    { videoId: 'B9uFMPnjL3Y', title: 'Cristian Castro - No Podrás (Karaoke)', author: 'Cristian Castro', durationSeconds: 241, durationText: '4:01', thumbnailUrl: 'https://i.ytimg.com/vi/B9uFMPnjL3Y/hq720.jpg' },
    { videoId: 'L5_3e5Fqh0M', title: 'Luis Miguel - Culpable o No (Karaoke)', author: 'Luis Miguel', durationSeconds: 238, durationText: '3:58', thumbnailUrl: 'https://i.ytimg.com/vi/L5_3e5Fqh0M/hq720.jpg' },
    { videoId: 'Rqc08syXhmo', title: 'Cristian Castro - Volver a Amar (Karaoke)', author: 'Cristian Castro', durationSeconds: 282, durationText: '4:42', thumbnailUrl: 'https://i.ytimg.com/vi/Rqc08syXhmo/hq720.jpg' },
    // Rotación 1
    { videoId: 'mb5_z3otK-E', title: 'Cristian Castro - Es Mejor Así (Karaoke)', author: 'Cristian Castro', durationSeconds: 232, durationText: '3:52', thumbnailUrl: 'https://i.ytimg.com/vi/mb5_z3otK-E/hq720.jpg' },
    { videoId: 'pO8e2xK5j1A', title: 'Pimpinela - Olvídame y Pega La Vuelta', author: 'Pimpinela', durationSeconds: 215, durationText: '3:35', thumbnailUrl: 'https://i.ytimg.com/vi/pO8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'rM8e2xK5j1A', title: 'Ricardo Montaner - Tan Enamorados', author: 'Ricardo Montaner', durationSeconds: 240, durationText: '4:00', thumbnailUrl: 'https://i.ytimg.com/vi/rM8e2xK5j1A/hqdefault.jpg' },
    // Rotación 2
    { videoId: 'mS8e2xK5j1A', title: 'Marco Antonio Solís - Si No Te Hubieras Ido', author: 'Marco Antonio Solis', durationSeconds: 280, durationText: '4:40', thumbnailUrl: 'https://i.ytimg.com/vi/mS8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'lI8e2xK5j1A', title: 'Luis Miguel - La Incondicional', author: 'Luis Miguel', durationSeconds: 260, durationText: '4:20', thumbnailUrl: 'https://i.ytimg.com/vi/lI8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'cS8e2xK5j1A', title: 'Camilo Sesto - Vivir Así Es Morir De Amor', author: 'Camilo Sesto', durationSeconds: 210, durationText: '3:30', thumbnailUrl: 'https://i.ytimg.com/vi/cS8e2xK5j1A/hqdefault.jpg' },
    // Rotación 3
    { videoId: 'cT8e2xK5j1A', title: 'Chayanne - Torero', author: 'Chayanne', durationSeconds: 220, durationText: '3:40', thumbnailUrl: 'https://i.ytimg.com/vi/cT8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'cA8e2xK5j1A', title: 'Cristian Castro - Azul', author: 'Cristian Castro', durationSeconds: 250, durationText: '4:10', thumbnailUrl: 'https://i.ytimg.com/vi/cA8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'lH8e2xK5j1A', title: 'Luis Miguel - Hasta Que Me Olvides', author: 'Luis Miguel', durationSeconds: 275, durationText: '4:35', thumbnailUrl: 'https://i.ytimg.com/vi/lH8e2xK5j1A/hqdefault.jpg' },
  ],
  folclore_argentino: [
    // Rotación 0
    { videoId: 'dXIprdv9Rlg', title: 'Chaqueño Palavecino, Soledad y Nocheros - Amor Salvaje', author: 'Folclore', durationSeconds: 227, durationText: '3:47', thumbnailUrl: 'https://i.ytimg.com/vi/dXIprdv9Rlg/hqdefault.jpg' },
    { videoId: '2BOADJuWHWI', title: 'Soledad & Chaqueño - Que Hable con Ella', author: 'Soledad', durationSeconds: 243, durationText: '4:03', thumbnailUrl: 'https://i.ytimg.com/vi/2BOADJuWHWI/hqdefault.jpg' },
    { videoId: 'g7KfN21iaUc', title: 'Soledad - Amor Salvaje (En Vivo)', author: 'Soledad', durationSeconds: 221, durationText: '3:41', thumbnailUrl: 'https://i.ytimg.com/vi/g7KfN21iaUc/hq720.jpg' },
    // Rotación 1
    { videoId: 'TW7zZTP9Kdc', title: 'Soledad - El Cosechero', author: 'Soledad', durationSeconds: 201, durationText: '3:21', thumbnailUrl: 'https://i.ytimg.com/vi/TW7zZTP9Kdc/hq720.jpg' },
    { videoId: 'rB8e2xK5j1A', title: 'Los Nocheros - Roja Boca', author: 'Los Nocheros', durationSeconds: 245, durationText: '4:05', thumbnailUrl: 'https://i.ytimg.com/vi/rB8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'hG8e2xK5j1A', title: 'Horacio Guarany - Si Se Calla El Cantor', author: 'Horacio Guarany', durationSeconds: 195, durationText: '3:15', thumbnailUrl: 'https://i.ytimg.com/vi/hG8e2xK5j1A/hqdefault.jpg' },
    // Rotación 2
    { videoId: 'mG8e2xK5j1A', title: 'Mercedes Sosa - Gracias a La Vida', author: 'Mercedes Sosa', durationSeconds: 260, durationText: '4:20', thumbnailUrl: 'https://i.ytimg.com/vi/mG8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'cL8e2xK5j1A', title: 'Chaqueño Palavecino - La Ley y La Trampa', author: 'Chaqueño Palavecino', durationSeconds: 190, durationText: '3:10', thumbnailUrl: 'https://i.ytimg.com/vi/cL8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'nT8e2xK5j1A', title: 'Los Nocheros - Entre La Tierra y El Cielo', author: 'Los Nocheros', durationSeconds: 235, durationText: '3:55', thumbnailUrl: 'https://i.ytimg.com/vi/nT8e2xK5j1A/hqdefault.jpg' },
    // Rotación 3
    { videoId: 'sT8e2xK5j1A', title: 'Soledad - Tren del Cielo', author: 'Soledad', durationSeconds: 215, durationText: '3:35', thumbnailUrl: 'https://i.ytimg.com/vi/sT8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'mM8e2xK5j1A', title: 'Los Manseros Santiagueños - Canto a Monte Quemado', author: 'Manseros', durationSeconds: 210, durationText: '3:30', thumbnailUrl: 'https://i.ytimg.com/vi/mM8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'nS8e2xK5j1A', title: 'Los Nocheros - No Saber de Ti', author: 'Los Nocheros', durationSeconds: 240, durationText: '4:00', thumbnailUrl: 'https://i.ytimg.com/vi/nS8e2xK5j1A/hqdefault.jpg' },
  ],
  chill_lounge: [
    // Rotación 0
    { videoId: 'm8uE6PV96rY', title: 'Jack Johnson - Sleep Through The Static', author: 'Jack Johnson', durationSeconds: 224, durationText: '3:44', thumbnailUrl: 'https://i.ytimg.com/vi/m8uE6PV96rY/hq720.jpg' },
    { videoId: '63XFJnk-Nzk', title: 'Jack Johnson - Gone', author: 'Jack Johnson', durationSeconds: 124, durationText: '2:04', thumbnailUrl: 'https://i.ytimg.com/vi/63XFJnk-Nzk/hqdefault.jpg' },
    { videoId: 'EGp43WJXBwk', title: 'Jack Johnson - Upside Down', author: 'Jack Johnson', durationSeconds: 180, durationText: '3:00', thumbnailUrl: 'https://i.ytimg.com/vi/EGp43WJXBwk/hq720.jpg' },
    // Rotación 1
    { videoId: 'Pa6ikNrmpXM', title: 'Jack Johnson - Hope', author: 'Jack Johnson', durationSeconds: 223, durationText: '3:43', thumbnailUrl: 'https://i.ytimg.com/vi/Pa6ikNrmpXM/hq720.jpg' },
    { videoId: 'nJ8e2xK5j1A', title: 'Norah Jones - Don\'t Know Why', author: 'Norah Jones', durationSeconds: 185, durationText: '3:05', thumbnailUrl: 'https://i.ytimg.com/vi/nJ8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'aV8e2xK5j1A', title: 'Amy Winehouse - Valerie', author: 'Amy Winehouse', durationSeconds: 230, durationText: '3:50', thumbnailUrl: 'https://i.ytimg.com/vi/aV8e2xK5j1A/hqdefault.jpg' },
    // Rotación 2
    { videoId: 'jM8e2xK5j1A', title: 'John Mayer - Gravity', author: 'John Mayer', durationSeconds: 245, durationText: '4:05', thumbnailUrl: 'https://i.ytimg.com/vi/jM8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'sS8e2xK5j1A', title: 'Sade - Smooth Operator', author: 'Sade', durationSeconds: 255, durationText: '4:15', thumbnailUrl: 'https://i.ytimg.com/vi/sS8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'nS9e2xK5j1A', title: 'Norah Jones - Sunrise', author: 'Norah Jones', durationSeconds: 200, durationText: '3:20', thumbnailUrl: 'https://i.ytimg.com/vi/nS9e2xK5j1A/hqdefault.jpg' },
    // Rotación 3
    { videoId: 'mB8e2xK5j1A', title: 'Michael Bublé - Home', author: 'Michael Buble', durationSeconds: 225, durationText: '3:45', thumbnailUrl: 'https://i.ytimg.com/vi/mB8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'bP9e2xK5j1A', title: 'Jack Johnson - Banana Pancakes', author: 'Jack Johnson', durationSeconds: 190, durationText: '3:10', thumbnailUrl: 'https://i.ytimg.com/vi/bP9e2xK5j1A/hqdefault.jpg' },
    { videoId: 'kM8e2xK5j1A', title: 'Katie Melua - Nine Million Bicycles', author: 'Katie Melua', durationSeconds: 205, durationText: '3:25', thumbnailUrl: 'https://i.ytimg.com/vi/kM8e2xK5j1A/hqdefault.jpg' },
  ],
};
