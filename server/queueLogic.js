/**
 * Módulo de funciones puras para la lógica de cola de Karaoke
 */

/**
 * Convierte segundos a formato de texto legible "MM:SS"
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return '0:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calcula la posición en cola, canciones restantes y tiempo estimado de espera para un invitado
 * @param {Array} queue Lista de canciones en espera (ordenadas por priority_order)
 * @param {Object|null} currentSong Canción en reproducción actual
 * @param {Object} playerState { currentTime: number, duration: number, isPlaying: boolean }
 * @param {string} guestName Nombre del invitado
 * @param {string} sessionToken Token de sesión local
 * @returns {Object} Estado del turno del invitado
 */
export function calculateWaitTimeAndPosition(queue = [], currentSong = null, playerState = {}, guestName = '', sessionToken = '') {
  const normName = guestName ? guestName.trim().toLowerCase() : '';
  
  // 1. ¿Está cantando la canción actual?
  const isSingingNow = Boolean(
    currentSong && (
      (sessionToken && currentSong.sessionToken === sessionToken) ||
      (normName && currentSong.requestedBy && currentSong.requestedBy.toLowerCase() === normName)
    )
  );

  // 2. Buscar canciones del usuario en la cola
  const userSongs = [];
  let firstIndex = -1;

  queue.forEach((song, idx) => {
    const isUserSong = (
      (sessionToken && song.sessionToken === sessionToken) ||
      (normName && song.requestedBy && song.requestedBy.toLowerCase() === normName)
    );

    if (isUserSong) {
      userSongs.push({
        ...song,
        queuePosition: idx + 1
      });
      if (firstIndex === -1) {
        firstIndex = idx;
      }
    }
  });

  // Si no tiene canciones ni está cantando
  if (firstIndex === -1) {
    return {
      isSingingNow,
      currentSong,
      hasSongsInQueue: false,
      userSongsCount: 0,
      songsAhead: 0,
      estimatedWaitSeconds: 0,
      estimatedWaitMinutes: 0,
      isNext: false,
      userSongs: []
    };
  }

  // 3. Calcular tiempo restante
  let waitSeconds = 0;
  
  // Tiempo que le falta a la canción actual en TV
  if (currentSong && playerState.duration > 0) {
    const currentProgress = playerState.currentTime || 0;
    const remainingInCurrent = Math.max(0, playerState.duration - currentProgress);
    waitSeconds += remainingInCurrent;
  }

  // Sumar duraciones de las canciones que están antes de la primera del usuario
  for (let i = 0; i < firstIndex; i++) {
    waitSeconds += (queue[i].durationSeconds || 180);
  }

  return {
    isSingingNow,
    currentSong,
    hasSongsInQueue: true,
    userSongsCount: userSongs.length,
    firstSong: userSongs[0],
    songsAhead: firstIndex,
    isNext: firstIndex === 0 && Boolean(currentSong),
    estimatedWaitSeconds: Math.round(waitSeconds),
    estimatedWaitMinutes: Math.ceil(waitSeconds / 60),
    userSongs
  };
}

/**
 * Reordena una canción en la cola y renumera los ordinales
 * @param {Array} queue Lista actual
 * @param {number} fromIndex Índice origen (0-indexed)
 * @param {number} toIndex Índice destino (0-indexed)
 * @returns {Array} Nueva lista reordenada
 */
export function reorderQueueItems(queue, fromIndex, toIndex) {
  if (
    !Array.isArray(queue) ||
    fromIndex < 0 || fromIndex >= queue.length ||
    toIndex < 0 || toIndex >= queue.length
  ) {
    return [...queue];
  }

  const result = [...queue];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);

  // Recompactar priority_order (1, 2, 3...)
  return result.map((item, idx) => ({
    ...item,
    priority_order: idx + 1
  }));
}

/**
 * Elimina todas las canciones de un invitado y reordena correlativamente
 * @param {Array} queue Lista actual
 * @param {string} guestName Nombre del invitado ausente
 * @returns {{ newQueue: Array, purgedCount: number }}
 */
export function purgeGuestSongs(queue, guestName) {
  if (!Array.isArray(queue) || !guestName) {
    return { newQueue: [...(queue || [])], purgedCount: 0 };
  }

  const target = guestName.trim().toLowerCase();
  const filtered = queue.filter(item => (item.requestedBy || '').toLowerCase() !== target);
  const purgedCount = queue.length - filtered.length;

  const newQueue = filtered.map((item, idx) => ({
    ...item,
    priority_order: idx + 1
  }));

  return { newQueue, purgedCount };
}
