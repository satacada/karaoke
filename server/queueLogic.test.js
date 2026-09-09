import { describe, it, expect } from 'vitest';
import {
  formatDuration,
  calculateWaitTimeAndPosition,
  reorderQueueItems,
  purgeGuestSongs
} from './queueLogic.js';

describe('formatDuration', () => {
  it('convierte segundos a formato MM:SS correctamente', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(45)).toBe('0:45');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(215)).toBe('3:35');
    expect(formatDuration(600)).toBe('10:00');
  });

  it('maneja valores inválidos o negativos con gracia', () => {
    expect(formatDuration(-10)).toBe('0:00');
    expect(formatDuration(null)).toBe('0:00');
    expect(formatDuration('invalido')).toBe('0:00');
  });
});

describe('calculateWaitTimeAndPosition', () => {
  const currentSong = {
    id: 'song-0',
    title: 'Canción Actual',
    requestedBy: 'Ana',
    sessionToken: 'token-ana',
    durationSeconds: 200
  };

  const playerState = {
    currentTime: 80, // Faltan 120s para que termine
    duration: 200,
    isPlaying: true
  };

  const queue = [
    { id: 'song-1', title: 'Tema 1', requestedBy: 'David', sessionToken: 'token-david', durationSeconds: 180, priority_order: 1 },
    { id: 'song-2', title: 'Tema 2', requestedBy: 'Lucas', sessionToken: 'token-lucas', durationSeconds: 240, priority_order: 2 },
    { id: 'song-3', title: 'Tema 3', requestedBy: 'María', sessionToken: 'token-maria', durationSeconds: 150, priority_order: 3 },
    { id: 'song-4', title: 'Tema 4', requestedBy: 'David', sessionToken: 'token-david', durationSeconds: 200, priority_order: 4 }
  ];

  it('identifica correctamente cuando el usuario está cantando ahora mismo', () => {
    const status = calculateWaitTimeAndPosition(queue, currentSong, playerState, 'Ana', 'token-ana');
    expect(status.isSingingNow).toBe(true);
  });

  it('calcula el tiempo de espera para el siguiente en cantar (puesto #1)', () => {
    const status = calculateWaitTimeAndPosition(queue, currentSong, playerState, 'David', 'token-david');
    expect(status.isSingingNow).toBe(false);
    expect(status.hasSongsInQueue).toBe(true);
    expect(status.userSongsCount).toBe(2);
    expect(status.songsAhead).toBe(0); // Es la primera en la cola
    expect(status.isNext).toBe(true);
    // Tiempo de espera: solo los 120s restantes de la canción actual
    expect(status.estimatedWaitSeconds).toBe(120);
    expect(status.estimatedWaitMinutes).toBe(2);
  });

  it('calcula el tiempo de espera sumando canciones previas para puestos intermedios', () => {
    const status = calculateWaitTimeAndPosition(queue, currentSong, playerState, 'María', 'token-maria');
    expect(status.songsAhead).toBe(2); // David y Lucas están antes
    expect(status.isNext).toBe(false);
    // Tiempo: 120s (restante actual) + 180s (David) + 240s (Lucas) = 540s
    expect(status.estimatedWaitSeconds).toBe(540);
    expect(status.estimatedWaitMinutes).toBe(9);
  });

  it('retorna 0 si el invitado no tiene canciones pedidas ni está cantando', () => {
    const status = calculateWaitTimeAndPosition(queue, currentSong, playerState, 'Pedro', 'token-pedro');
    expect(status.isSingingNow).toBe(false);
    expect(status.hasSongsInQueue).toBe(false);
    expect(status.estimatedWaitSeconds).toBe(0);
    expect(status.estimatedWaitMinutes).toBe(0);
  });
});

describe('reorderQueueItems', () => {
  const queue = [
    { id: '1', title: 'A', priority_order: 1 },
    { id: '2', title: 'B', priority_order: 2 },
    { id: '3', title: 'C', priority_order: 3 },
    { id: '4', title: 'D', priority_order: 4 }
  ];

  it('mueve un elemento a una nueva posición y renumera ordinales sin huecos', () => {
    // Mover 'D' (índice 3) al puesto #1 (índice 0)
    const reordered = reorderQueueItems(queue, 3, 0);
    expect(reordered.map(i => i.title)).toEqual(['D', 'A', 'B', 'C']);
    expect(reordered.map(i => i.priority_order)).toEqual([1, 2, 3, 4]);
  });

  it('mantiene la lista intacta ante índices fuera de rango', () => {
    const result = reorderQueueItems(queue, -1, 2);
    expect(result).toEqual(queue);
  });
});

describe('purgeGuestSongs', () => {
  const queue = [
    { id: '1', title: 'A', requestedBy: 'David', priority_order: 1 },
    { id: '2', title: 'B', requestedBy: 'Lucas', priority_order: 2 },
    { id: '3', title: 'C', requestedBy: 'María', priority_order: 3 },
    { id: '4', title: 'D', requestedBy: 'lucas', priority_order: 4 },
    { id: '5', title: 'E', requestedBy: 'Sofía', priority_order: 5 }
  ];

  it('elimina todas las canciones de un invitado ausente (case-insensitive) y reordena ordinales', () => {
    const { newQueue, purgedCount } = purgeGuestSongs(queue, 'Lucas');
    expect(purgedCount).toBe(2);
    expect(newQueue.length).toBe(3);
    expect(newQueue.map(i => i.title)).toEqual(['A', 'C', 'E']);
    expect(newQueue.map(i => i.priority_order)).toEqual([1, 2, 3]);
  });

  it('no altera la cola si el invitado no tiene canciones', () => {
    const { newQueue, purgedCount } = purgeGuestSongs(queue, 'Inexistente');
    expect(purgedCount).toBe(0);
    expect(newQueue.length).toBe(5);
  });
});
