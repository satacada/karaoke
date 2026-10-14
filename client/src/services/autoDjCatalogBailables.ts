// ==============================================================================
// BANCO DE CANCIONES DE AUTO-DJ: GÉNEROS BAILABLES & FIESTA
// Archivo: client/src/services/autoDjCatalogBailables.ts
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

import type { FallbackTrack } from './autoDjFallbacks';

export const BAILABLES_CATALOG: Record<string, FallbackTrack[]> = {
  cumbia_fiesta: [
    // Rotación 0
    { videoId: 'UeFC_9oGqWg', title: 'Los Palmeras - El Bombón Asesino', author: 'Los Palmeras', durationSeconds: 205, durationText: '3:25', thumbnailUrl: 'https://i.ytimg.com/vi/UeFC_9oGqWg/hqdefault.jpg' },
    { videoId: '8iUkmnLc1ec', title: 'Gilda - No Me Arrepiento de Este Amor', author: 'Gilda', durationSeconds: 223, durationText: '3:43', thumbnailUrl: 'https://i.ytimg.com/vi/8iUkmnLc1ec/hq720.jpg' },
    { videoId: 'qW0bi_Uo6l4', title: 'Ráfaga - Una Cerveza', author: 'Rafaga', durationSeconds: 265, durationText: '4:25', thumbnailUrl: 'https://i.ytimg.com/vi/qW0bi_Uo6l4/hq720.jpg' },
    // Rotación 1
    { videoId: 'X48mxG8N6CM', title: 'Amar Azul - Yo Me Enamoré', author: 'Amar Azul', durationSeconds: 188, durationText: '3:08', thumbnailUrl: 'https://i.ytimg.com/vi/X48mxG8N6CM/hq720.jpg' },
    { videoId: 'YzY9BKxr23Y', title: 'Los Palmeras - Pura Infidelidad', author: 'Los Palmeras', durationSeconds: 188, durationText: '3:08', thumbnailUrl: 'https://i.ytimg.com/vi/YzY9BKxr23Y/hqdefault.jpg' },
    { videoId: 'i_yZf_Xk4w0', title: 'La Nueva Luna - Iluminará', author: 'La Nueva Luna', durationSeconds: 215, durationText: '3:35', thumbnailUrl: 'https://i.ytimg.com/vi/i_yZf_Xk4w0/hqdefault.jpg' },
    // Rotación 2
    { videoId: 'WkR4Q7G9j48', title: 'Damas Gratis - Me Vas a Extrañar', author: 'Damas Gratis', durationSeconds: 228, durationText: '3:48', thumbnailUrl: 'https://i.ytimg.com/vi/WkR4Q7G9j48/hqdefault.jpg' },
    { videoId: 'Z3q1dJzLg7M', title: 'Gilda - Se Me Ha Perdido Un Corazón', author: 'Gilda', durationSeconds: 210, durationText: '3:30', thumbnailUrl: 'https://i.ytimg.com/vi/Z3q1dJzLg7M/hqdefault.jpg' },
    { videoId: 'rD9k1eX8z2M', title: 'Los Palmeras - Olvídala', author: 'Los Palmeras', durationSeconds: 232, durationText: '3:52', thumbnailUrl: 'https://i.ytimg.com/vi/rD9k1eX8z2M/hqdefault.jpg' },
    // Rotación 3
    { videoId: 'lP7k1bK6j5A', title: 'Leo Mattioli - Le Pido a Dios', author: 'Leo Mattioli', durationSeconds: 240, durationText: '4:00', thumbnailUrl: 'https://i.ytimg.com/vi/lP7k1bK6j5A/hqdefault.jpg' },
    { videoId: 'kQ8d3xZ1v5E', title: 'Grupo Sombras - La Ventanita', author: 'Grupo Sombras', durationSeconds: 195, durationText: '3:15', thumbnailUrl: 'https://i.ytimg.com/vi/kQ8d3xZ1v5E/hqdefault.jpg' },
    { videoId: 'hJ4d1xK8e2A', title: 'Ráfaga - Mentirosa', author: 'Rafaga', durationSeconds: 204, durationText: '3:24', thumbnailUrl: 'https://i.ytimg.com/vi/hJ4d1xK8e2A/hqdefault.jpg' },
  ],
  cuarteto_cordobes: [
    // Rotación 0
    { videoId: 'w3OuRpcJ5iY', title: 'Rodrigo - Lo Mejor del Amor', author: 'Rodrigo', durationSeconds: 227, durationText: '3:47', thumbnailUrl: 'https://i.ytimg.com/vi/w3OuRpcJ5iY/hqdefault.jpg' },
    { videoId: 'To9hnuX_iQA', title: 'La Mona Jiménez - Beso a Beso (En Vivo)', author: 'La Mona Jimenez', durationSeconds: 304, durationText: '5:04', thumbnailUrl: 'https://i.ytimg.com/vi/To9hnuX_iQA/hqdefault.jpg' },
    { videoId: 'T6Es4yNHEIM', title: 'La Konga - Universo Paralelo', author: 'La Konga', durationSeconds: 217, durationText: '3:37', thumbnailUrl: 'https://i.ytimg.com/vi/T6Es4yNHEIM/hq720.jpg' },
    // Rotación 1
    { videoId: 'mo7MpQZRd5Q', title: 'Luck Ra - La Morocha', author: 'Luck Ra', durationSeconds: 141, durationText: '2:21', thumbnailUrl: 'https://i.ytimg.com/vi/mo7MpQZRd5Q/hq720.jpg' },
    { videoId: 'KlEP3x9EUcU', title: 'Ulises Bueno - Intento', author: 'Ulises Bueno', durationSeconds: 230, durationText: '3:50', thumbnailUrl: 'https://i.ytimg.com/vi/KlEP3x9EUcU/hq720.jpg' },
    { videoId: 'z7e8d2x9k1A', title: 'Walter Olmos - Por Lo Que Yo Te Quiero', author: 'Walter Olmos', durationSeconds: 210, durationText: '3:30', thumbnailUrl: 'https://i.ytimg.com/vi/z7e8d2x9k1A/hqdefault.jpg' },
    // Rotación 2
    { videoId: 'qL8e2xK5j1A', title: 'Q Lokura - 200 Copas', author: 'Q Lokura', durationSeconds: 198, durationText: '3:18', thumbnailUrl: 'https://i.ytimg.com/vi/qL8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'sC8d1xK9z2A', title: 'Rodrigo - Soy Cordobés', author: 'Rodrigo', durationSeconds: 225, durationText: '3:45', thumbnailUrl: 'https://i.ytimg.com/vi/sC8d1xK9z2A/hqdefault.jpg' },
    { videoId: 'lM4k1eX9z2A', title: 'La Mona Jiménez - Quién Se Ha Tomado Todo El Vino', author: 'La Mona Jimenez', durationSeconds: 245, durationText: '4:05', thumbnailUrl: 'https://i.ytimg.com/vi/lM4k1eX9z2A/hqdefault.jpg' },
    // Rotación 3
    { videoId: 'uP8k1eX9z2A', title: 'La Konga & Nahuel Pennisi - Universo Paralelo', author: 'La Konga', durationSeconds: 230, durationText: '3:50', thumbnailUrl: 'https://i.ytimg.com/vi/uP8k1eX9z2A/hqdefault.jpg' },
    { videoId: 'bM9k1eX8z2A', title: 'Luck Ra & BM - La Morocha', author: 'Luck Ra', durationSeconds: 155, durationText: '2:35', thumbnailUrl: 'https://i.ytimg.com/vi/bM9k1eX8z2A/hqdefault.jpg' },
    { videoId: 'uB4k1eX9z2A', title: 'Ulises Bueno - Dale Vieja Dale', author: 'Ulises Bueno', durationSeconds: 215, durationText: '3:35', thumbnailUrl: 'https://i.ytimg.com/vi/uB4k1eX9z2A/hqdefault.jpg' },
  ],
  rkt_villera: [
    // Rotación 0
    { videoId: 'UojlW95KkA0', title: 'Damas Gratis & La Joaqui - Te vas a arrepentir', author: 'Damas Gratis', durationSeconds: 222, durationText: '3:42', thumbnailUrl: 'https://i.ytimg.com/vi/UojlW95KkA0/hq720.jpg' },
    { videoId: 'jJMokpdzvAg', title: 'La Joaqui, Callejero Fino - Te Vi', author: 'La Joaqui', durationSeconds: 159, durationText: '2:39', thumbnailUrl: 'https://i.ytimg.com/vi/jJMokpdzvAg/hq720.jpg' },
    { videoId: 'PTfntSlhnwY', title: 'Callejero Fino, La Joaqui - M.A Remix', author: 'Callejero Fino', durationSeconds: 289, durationText: '4:49', thumbnailUrl: 'https://i.ytimg.com/vi/PTfntSlhnwY/hq720.jpg' },
    // Rotación 1
    { videoId: 'fUttLRvwAaE', title: 'Damas Gratis & Callejero Fino - Un Tin Tin', author: 'Damas Gratis', durationSeconds: 186, durationText: '3:06', thumbnailUrl: 'https://i.ytimg.com/vi/fUttLRvwAaE/hq720.jpg' },
    { videoId: 'lG8e2xK5j1A', title: 'L-Gante - Bzrp Music Sessions', author: 'L-Gante', durationSeconds: 185, durationText: '3:05', thumbnailUrl: 'https://i.ytimg.com/vi/lG8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'pC8e2xK5j1A', title: 'Pibes Chorros - Andrea', author: 'Pibes Chorros', durationSeconds: 190, durationText: '3:10', thumbnailUrl: 'https://i.ytimg.com/vi/pC8e2xK5j1A/hqdefault.jpg' },
    // Rotación 2
    { videoId: 'kD8e2xK5j1A', title: 'Kaleb Di Masi - Matatan', author: 'Kaleb Di Masi', durationSeconds: 165, durationText: '2:45', thumbnailUrl: 'https://i.ytimg.com/vi/kD8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'tC8e2xK5j1A', title: 'El Noba - Tamo Chelo', author: 'El Noba', durationSeconds: 155, durationText: '2:35', thumbnailUrl: 'https://i.ytimg.com/vi/tC8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'bU8e2xK5j1A', title: 'La Joaqui - Butakera', author: 'La Joaqui', durationSeconds: 175, durationText: '2:55', thumbnailUrl: 'https://i.ytimg.com/vi/bU8e2xK5j1A/hqdefault.jpg' },
    // Rotación 3
    { videoId: 'dG8e2xK5j1A', title: 'Damas Gratis - No Te Creas Tan Importante', author: 'Damas Gratis', durationSeconds: 210, durationText: '3:30', thumbnailUrl: 'https://i.ytimg.com/vi/dG8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'qC8e2xK5j1A', title: 'Pibes Chorros - Qué Calor', author: 'Pibes Chorros', durationSeconds: 180, durationText: '3:00', thumbnailUrl: 'https://i.ytimg.com/vi/qC8e2xK5j1A/hqdefault.jpg' },
    { videoId: 'tT8e2xK5j1A', title: 'Callejero Fino - Tu Turrito', author: 'Callejero Fino', durationSeconds: 192, durationText: '3:12', thumbnailUrl: 'https://i.ytimg.com/vi/tT8e2xK5j1A/hqdefault.jpg' },
  ],
};
