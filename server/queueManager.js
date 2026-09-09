import crypto from 'crypto';

class QueueManager {
  constructor() {
    this.currentSong = null;
    this.queue = [];
    this.history = [];
    this.playerState = {
      isPlaying: false,
      currentTime: 0,
      duration: 0
    };
  }

  /**
   * Agrega una nueva canción a la cola
   */
  addToQueue(songData) {
    const song = {
      id: crypto.randomUUID(),
      videoId: songData.videoId,
      title: songData.title || 'Canción sin título',
      author: songData.author || 'Artista desconocido',
      thumbnail: songData.thumbnail || '',
      durationSeconds: Number(songData.durationSeconds) || 180,
      durationText: songData.durationText || '3:00',
      requestedBy: songData.requestedBy ? songData.requestedBy.trim() : 'Anónimo',
      clientId: songData.clientId || 'unknown',
      addedAt: Date.now()
    };

    // Si no hay nada reproduciéndose actualmente, esta canción pasa a ser la actual
    if (!this.currentSong) {
      this.currentSong = {
        ...song,
        startedAt: Date.now()
      };
      this.playerState.isPlaying = true;
      this.playerState.currentTime = 0;
      this.playerState.duration = song.durationSeconds;
      return { song, isPlayingNow: true, position: 0 };
    }

    this.queue.push(song);
    return { song, isPlayingNow: false, position: this.queue.length };
  }

  /**
   * Avanza a la siguiente canción en la cola
   */
  playNext() {
    if (this.currentSong) {
      this.history.unshift({
        ...this.currentSong,
        playedAt: Date.now()
      });
      if (this.history.length > 30) {
        this.history.pop();
      }
    }

    if (this.queue.length > 0) {
      const nextSong = this.queue.shift();
      this.currentSong = {
        ...nextSong,
        startedAt: Date.now()
      };
      this.playerState.isPlaying = true;
      this.playerState.currentTime = 0;
      this.playerState.duration = nextSong.durationSeconds;
    } else {
      this.currentSong = null;
      this.playerState.isPlaying = false;
      this.playerState.currentTime = 0;
      this.playerState.duration = 0;
    }

    return this.currentSong;
  }

  /**
   * Vuelve a la canción anterior si existe en el historial
   */
  playPrevious() {
    if (this.history.length === 0) return this.currentSong;

    if (this.currentSong) {
      // Devolver la canción actual al principio de la cola
      this.queue.unshift({
        ...this.currentSong,
        startedAt: null
      });
    }

    const prevSong = this.history.shift();
    this.currentSong = {
      ...prevSong,
      startedAt: Date.now()
    };
    this.playerState.isPlaying = true;
    this.playerState.currentTime = 0;
    this.playerState.duration = prevSong.durationSeconds;

    return this.currentSong;
  }

  /**
   * Elimina una canción específica de la cola por su ID
   */
  removeFromQueue(songId) {
    const index = this.queue.findIndex(s => s.id === songId);
    if (index !== -1) {
      const removed = this.queue.splice(index, 1)[0];
      return removed;
    }
    return null;
  }

  /**
   * Elimina todas las canciones de un invitado que se haya ido de la fiesta
   */
  removeSongsByGuest(guestName) {
    if (!guestName) return 0;
    const target = guestName.trim().toLowerCase();
    const initialCount = this.queue.length;
    this.queue = this.queue.filter(s => s.requestedBy.toLowerCase() !== target);
    return initialCount - this.queue.length;
  }

  /**
   * Mueve una canción hacia arriba o hacia abajo en la cola
   */
  moveSong(songId, direction) {
    const index = this.queue.findIndex(s => s.id === songId);
    if (index === -1) return false;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= this.queue.length) return false;

    const [item] = this.queue.splice(index, 1);
    this.queue.splice(targetIndex, 0, item);
    return true;
  }

  /**
   * Retorna la lista de invitados únicos que tienen canciones en cola
   */
  getGuestList() {
    const guestCounts = {};
    if (this.currentSong && this.currentSong.requestedBy) {
      guestCounts[this.currentSong.requestedBy] = 1;
    }
    for (const song of this.queue) {
      const name = song.requestedBy || 'Anónimo';
      guestCounts[name] = (guestCounts[name] || 0) + 1;
    }
    return Object.entries(guestCounts).map(([name, count]) => ({
      name,
      songsCount: count
    }));
  }

  /**
   * Cambia la posición de una canción dentro de la cola
   */
  reorderQueue(fromIndex, toIndex) {
    if (
      fromIndex < 0 || fromIndex >= this.queue.length ||
      toIndex < 0 || toIndex >= this.queue.length
    ) {
      return false;
    }
    const [movedItem] = this.queue.splice(fromIndex, 1);
    this.queue.splice(toIndex, 0, movedItem);
    return true;
  }

  /**
   * Actualiza el estado de reproducción reportado por el TV Player
   */
  updatePlayerState({ currentTime, duration, isPlaying }) {
    if (typeof currentTime === 'number') this.playerState.currentTime = currentTime;
    if (typeof duration === 'number' && duration > 0) this.playerState.duration = duration;
    if (typeof isPlaying === 'boolean') this.playerState.isPlaying = isPlaying;
  }

  /**
   * Limpia toda la cola
   */
  clearQueue() {
    this.queue = [];
  }

  /**
   * Calcula el estado de espera para un usuario específico (por clientId o nombre)
   */
  getUserStatus(clientId, userName) {
    // 1. ¿Está cantando ahora mismo?
    const isSingingNow = Boolean(
      this.currentSong && (
        (clientId && this.currentSong.clientId === clientId) ||
        (userName && this.currentSong.requestedBy.toLowerCase() === userName.toLowerCase())
      )
    );

    // 2. Buscar canciones del usuario en la cola
    const userSongsInQueue = [];
    let firstUserSongIndex = -1;

    this.queue.forEach((song, idx) => {
      const isMine = (clientId && song.clientId === clientId) ||
                     (userName && song.requestedBy.toLowerCase() === userName.toLowerCase());
      if (isMine) {
        userSongsInQueue.push({ ...song, queuePosition: idx + 1 });
        if (firstUserSongIndex === -1) {
          firstUserSongIndex = idx;
        }
      }
    });

    // 3. Estimar tiempo de espera hasta la primera canción del usuario
    let estimatedWaitSeconds = 0;
    let songsAhead = 0;

    if (firstUserSongIndex !== -1) {
      songsAhead = firstUserSongIndex;
      // Tiempo restante de la canción actual en TV
      if (this.currentSong && this.playerState.duration > 0) {
        const remainingCurrent = Math.max(0, this.playerState.duration - this.playerState.currentTime);
        estimatedWaitSeconds += remainingCurrent;
      }
      // Sumar duraciones de las canciones que están antes
      for (let i = 0; i < firstUserSongIndex; i++) {
        estimatedWaitSeconds += (this.queue[i].durationSeconds || 180);
      }
    }

    return {
      isSingingNow,
      currentSong: this.currentSong,
      songsAhead,
      firstUserSong: userSongsInQueue[0] || null,
      userSongsCount: userSongsInQueue.length,
      estimatedWaitSeconds: Math.round(estimatedWaitSeconds),
      estimatedWaitMinutes: Math.ceil(estimatedWaitSeconds / 60)
    };
  }

  /**
   * Retorna todo el estado sincronizado
   */
  getFullState() {
    return {
      currentSong: this.currentSong,
      queue: this.queue,
      history: this.history,
      playerState: this.playerState,
      totalInQueue: this.queue.length
    };
  }
}

export const queueManager = new QueueManager();
