// ==============================================================================
// BANCO DE CANCIONES DE EMERGENCIA FALLBACK AUTO-DJ (SIN DUPLICADOS Y 100% DISPONIBLES)
// Archivo: client/src/services/autoDjFallbacks.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

export interface FallbackTrack {
  videoId: string;
  title: string;
  author: string;
  durationSeconds: number;
  durationText: string;
  thumbnailUrl: string;
}

export const EMERGENCY_FALLBACKS: Record<string, FallbackTrack[]> = {
  cumbia_fiesta: [
    { videoId: 'UeFC_9oGqWg', title: 'Los Palmeras - El Bombón Asesino', author: 'Los Palmeras', durationSeconds: 205, durationText: '3:25', thumbnailUrl: 'https://i.ytimg.com/vi/UeFC_9oGqWg/hqdefault.jpg' },
    { videoId: '8iUkmnLc1ec', title: 'Gilda - No Me Arrepiento de Este Amor', author: 'Gilda', durationSeconds: 223, durationText: '3:43', thumbnailUrl: 'https://i.ytimg.com/vi/8iUkmnLc1ec/hq720.jpg' },
    { videoId: 'qW0bi_Uo6l4', title: 'Ráfaga - Una Cerveza', author: 'Rafaga', durationSeconds: 265, durationText: '4:25', thumbnailUrl: 'https://i.ytimg.com/vi/qW0bi_Uo6l4/hq720.jpg' },
    { videoId: 'X48mxG8N6CM', title: 'Amar Azul - Yo Me Enamoré', author: 'Amar Azul', durationSeconds: 188, durationText: '3:08', thumbnailUrl: 'https://i.ytimg.com/vi/X48mxG8N6CM/hq720.jpg' },
    { videoId: 'YzY9BKxr23Y', title: 'Los Palmeras - Pura Infidelidad', author: 'Los Palmeras', durationSeconds: 188, durationText: '3:08', thumbnailUrl: 'https://i.ytimg.com/vi/YzY9BKxr23Y/hqdefault.jpg' },
  ],
  cuarteto_cordobes: [
    { videoId: 'w3OuRpcJ5iY', title: 'Rodrigo - Lo Mejor del Amor', author: 'Rodrigo', durationSeconds: 227, durationText: '3:47', thumbnailUrl: 'https://i.ytimg.com/vi/w3OuRpcJ5iY/hqdefault.jpg' },
    { videoId: 'To9hnuX_iQA', title: 'La Mona Jiménez - Beso a Beso (En Vivo)', author: 'La Mona Jimenez', durationSeconds: 304, durationText: '5:04', thumbnailUrl: 'https://i.ytimg.com/vi/To9hnuX_iQA/hqdefault.jpg' },
    { videoId: 'T6Es4yNHEIM', title: 'La Konga - Universo Paralelo', author: 'La Konga', durationSeconds: 217, durationText: '3:37', thumbnailUrl: 'https://i.ytimg.com/vi/T6Es4yNHEIM/hq720.jpg' },
    { videoId: 'mo7MpQZRd5Q', title: 'Luck Ra - La Morocha', author: 'Luck Ra', durationSeconds: 141, durationText: '2:21', thumbnailUrl: 'https://i.ytimg.com/vi/mo7MpQZRd5Q/hq720.jpg' },
    { videoId: 'KlEP3x9EUcU', title: 'Ulises Bueno - Intento', author: 'Ulises Bueno', durationSeconds: 230, durationText: '3:50', thumbnailUrl: 'https://i.ytimg.com/vi/KlEP3x9EUcU/hq720.jpg' },
  ],
  rkt_villera: [
    { videoId: 'UojlW95KkA0', title: 'Damas Gratis & La Joaqui - Te vas a arrepentir', author: 'Damas Gratis', durationSeconds: 222, durationText: '3:42', thumbnailUrl: 'https://i.ytimg.com/vi/UojlW95KkA0/hq720.jpg' },
    { videoId: 'jJMokpdzvAg', title: 'La Joaqui, Callejero Fino - Te Vi', author: 'La Joaqui', durationSeconds: 159, durationText: '2:39', thumbnailUrl: 'https://i.ytimg.com/vi/jJMokpdzvAg/hq720.jpg' },
    { videoId: 'PTfntSlhnwY', title: 'Callejero Fino, La Joaqui - M.A Remix', author: 'Callejero Fino', durationSeconds: 289, durationText: '4:49', thumbnailUrl: 'https://i.ytimg.com/vi/PTfntSlhnwY/hq720.jpg' },
    { videoId: 'fUttLRvwAaE', title: 'Damas Gratis & Callejero Fino - Un Tin Tin', author: 'Damas Gratis', durationSeconds: 186, durationText: '3:06', thumbnailUrl: 'https://i.ytimg.com/vi/fUttLRvwAaE/hq720.jpg' },
  ],
  rock_nacional: [
    { videoId: 'T_FkEw27XJ0', title: 'Soda Stereo - De Música Ligera', author: 'Soda Stereo', durationSeconds: 211, durationText: '3:31', thumbnailUrl: 'https://i.ytimg.com/vi/T_FkEw27XJ0/hq720.jpg' },
    { videoId: 'Mm3IgrVsu24', title: 'Charly García - Demoliendo Hoteles', author: 'Charly Garcia', durationSeconds: 129, durationText: '2:09', thumbnailUrl: 'https://i.ytimg.com/vi/Mm3IgrVsu24/hq720.jpg' },
    { videoId: 'lYC5wlY8d6A', title: 'Los Enanitos Verdes - Lamento Boliviano', author: 'Enanitos Verdes', durationSeconds: 222, durationText: '3:42', thumbnailUrl: 'https://i.ytimg.com/vi/lYC5wlY8d6A/hq720.jpg' },
    { videoId: 'UCF9oHXhDMU', title: 'Andrés Calamaro - Flaca', author: 'Andres Calamaro', durationSeconds: 273, durationText: '4:33', thumbnailUrl: 'https://i.ytimg.com/vi/UCF9oHXhDMU/hqdefault.jpg' },
  ],
  rock_internacional: [
    { videoId: 'YJ105oW5gns', title: 'Queen & Axl Rose - We Will Rock You', author: 'Queen', durationSeconds: 165, durationText: '2:45', thumbnailUrl: 'https://i.ytimg.com/vi/YJ105oW5gns/hq720.jpg' },
    { videoId: 'YxW9iekNSek', title: 'Guns N Roses - Rocket Queen', author: 'Guns N Roses', durationSeconds: 374, durationText: '6:14', thumbnailUrl: 'https://i.ytimg.com/vi/YxW9iekNSek/hq720.jpg' },
    { videoId: 'fJ9rUzIMcZQ', title: 'Queen - Bohemian Rhapsody', author: 'Queen', durationSeconds: 359, durationText: '5:59', thumbnailUrl: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg' },
  ],
  hits_80_90: [
    { videoId: 'fJ9rUzIMcZQ', title: 'Queen - Bohemian Rhapsody', author: 'Queen', durationSeconds: 359, durationText: '5:59', thumbnailUrl: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg' },
    { videoId: 'Zi_XLOBDo_Y', title: 'Michael Jackson - Billie Jean', author: 'Michael Jackson', durationSeconds: 295, durationText: '4:55', thumbnailUrl: 'https://i.ytimg.com/vi/Zi_XLOBDo_Y/hqdefault.jpg' },
    { videoId: 'lDK9QqIzhwk', title: 'Bon Jovi - Livin\' On A Prayer', author: 'Bon Jovi', durationSeconds: 245, durationText: '4:05', thumbnailUrl: 'https://i.ytimg.com/vi/lDK9QqIzhwk/hqdefault.jpg' },
    { videoId: 'djV11Xbc914', title: 'a-ha - Take On Me', author: 'a-ha', durationSeconds: 225, durationText: '3:45', thumbnailUrl: 'https://i.ytimg.com/vi/djV11Xbc914/hqdefault.jpg' },
    { videoId: 'zmD5aow3d_A', title: '80s Mega Hits - Madonna, Michael Jackson, A-ha', author: 'Hits 80s', durationSeconds: 332, durationText: '5:32', thumbnailUrl: 'https://i.ytimg.com/vi/zmD5aow3d_A/hq720.jpg' },
  ],
  karaoke_hits: [
    { videoId: 'B9uFMPnjL3Y', title: 'Cristian Castro - No Podrás (Karaoke)', author: 'Cristian Castro', durationSeconds: 241, durationText: '4:01', thumbnailUrl: 'https://i.ytimg.com/vi/B9uFMPnjL3Y/hq720.jpg' },
    { videoId: 'L5_3e5Fqh0M', title: 'Luis Miguel - Culpable o No (Karaoke)', author: 'Luis Miguel', durationSeconds: 238, durationText: '3:58', thumbnailUrl: 'https://i.ytimg.com/vi/L5_3e5Fqh0M/hq720.jpg' },
    { videoId: 'Rqc08syXhmo', title: 'Cristian Castro - Volver a Amar (Karaoke)', author: 'Cristian Castro', durationSeconds: 282, durationText: '4:42', thumbnailUrl: 'https://i.ytimg.com/vi/Rqc08syXhmo/hq720.jpg' },
    { videoId: 'mb5_z3otK-E', title: 'Cristian Castro - Es Mejor Así (Karaoke)', author: 'Cristian Castro', durationSeconds: 232, durationText: '3:52', thumbnailUrl: 'https://i.ytimg.com/vi/mb5_z3otK-E/hq720.jpg' },
  ],
  folclore_argentino: [
    { videoId: 'dXIprdv9Rlg', title: 'Chaqueño Palavecino, Soledad y Nocheros - Amor Salvaje', author: 'Folclore', durationSeconds: 227, durationText: '3:47', thumbnailUrl: 'https://i.ytimg.com/vi/dXIprdv9Rlg/hqdefault.jpg' },
    { videoId: '2BOADJuWHWI', title: 'Soledad & Chaqueño - Que Hable con Ella', author: 'Soledad', durationSeconds: 243, durationText: '4:03', thumbnailUrl: 'https://i.ytimg.com/vi/2BOADJuWHWI/hqdefault.jpg' },
    { videoId: 'g7KfN21iaUc', title: 'Soledad - Amor Salvaje (En Vivo)', author: 'Soledad', durationSeconds: 221, durationText: '3:41', thumbnailUrl: 'https://i.ytimg.com/vi/g7KfN21iaUc/hq720.jpg' },
    { videoId: 'TW7zZTP9Kdc', title: 'Soledad - El Cosechero', author: 'Soledad', durationSeconds: 201, durationText: '3:21', thumbnailUrl: 'https://i.ytimg.com/vi/TW7zZTP9Kdc/hq720.jpg' },
  ],
  chill_lounge: [
    { videoId: 'm8uE6PV96rY', title: 'Jack Johnson - Sleep Through The Static', author: 'Jack Johnson', durationSeconds: 224, durationText: '3:44', thumbnailUrl: 'https://i.ytimg.com/vi/m8uE6PV96rY/hq720.jpg' },
    { videoId: '63XFJnk-Nzk', title: 'Jack Johnson - Gone', author: 'Jack Johnson', durationSeconds: 124, durationText: '2:04', thumbnailUrl: 'https://i.ytimg.com/vi/63XFJnk-Nzk/hqdefault.jpg' },
    { videoId: 'EGp43WJXBwk', title: 'Jack Johnson - Upside Down', author: 'Jack Johnson', durationSeconds: 180, durationText: '3:00', thumbnailUrl: 'https://i.ytimg.com/vi/EGp43WJXBwk/hq720.jpg' },
    { videoId: 'Pa6ikNrmpXM', title: 'Jack Johnson - Hope', author: 'Jack Johnson', durationSeconds: 223, durationText: '3:43', thumbnailUrl: 'https://i.ytimg.com/vi/Pa6ikNrmpXM/hq720.jpg' },
  ],
};
