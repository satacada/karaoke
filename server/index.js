import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import yts from 'yt-search';
import { queueManager } from './queueManager.js';
import { getLocalIpAddress, generateQrDataUrl } from './networkUtils.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Configurar CORS
app.use(cors({ origin: '*' }));
app.use(express.json());

// Configurar Socket.io con CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Cache de información de red y QR
let cachedNetworkInfo = null;

async function getNetworkInfo() {
  const ip = getLocalIpAddress();
  // El cliente web típicamente corre en el puerto 5173 en dev o 3001 si servimos estáticos
  const clientUrl = `http://${ip}:5173`;
  const qrCodeDataUrl = await generateQrDataUrl(clientUrl);
  return {
    ip,
    serverPort: PORT,
    clientUrl,
    qrCodeDataUrl
  };
}

// ----------------------------------------------------
// RUTAS DE LA API REST
// ----------------------------------------------------

/**
 * Obtener información de red y código QR para unirse
 */
app.get('/api/network-info', async (req, res) => {
  try {
    if (!cachedNetworkInfo) {
      cachedNetworkInfo = await getNetworkInfo();
    }
    res.json(cachedNetworkInfo);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo info de red', details: error.message });
  }
});

import { searchYouTubeVideos } from './searchService.js';

/**
 * Buscar canciones en YouTube (con opción de forzar versión Karaoke y caché en memoria)
 */
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  const filter = req.query.filter || (req.query.karaoke === 'false' ? 'all' : 'karaoke');

  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Debes proporcionar un término de búsqueda' });
  }

  try {
    const videos = await searchYouTubeVideos(query, filter);
    res.json({ results: videos });
  } catch (error) {
    console.error('Error buscando en YouTube:', error);
    res.status(500).json({ error: 'Error al buscar en YouTube', details: error.message });
  }
});

/**
 * Estado general de la cola y usuario
 */
app.get('/api/state', (req, res) => {
  const { clientId, userName } = req.query;
  const fullState = queueManager.getFullState();
  const userStatus = (clientId || userName) ? queueManager.getUserStatus(clientId, userName) : null;
  res.json({ ...fullState, userStatus });
});

// ----------------------------------------------------
// WEBSOCKETS (SOCKET.IO)
// ----------------------------------------------------

io.on('connection', (socket) => {
  // Enviar estado actual inmediato al conectarse
  socket.emit('sync_state', queueManager.getFullState());

  // Solicitar estado personalizado de un usuario
  socket.on('get_user_status', ({ clientId, userName }) => {
    const status = queueManager.getUserStatus(clientId, userName);
    socket.emit('user_status_update', status);
  });

  // Agregar canción a la cola
  socket.on('add_to_queue', (songData) => {
    const result = queueManager.addToQueue(songData);
    
    // Notificar a todos sobre la actualización de la cola
    io.emit('queue_updated', queueManager.getFullState());
    
    // Si la TV estaba vacía y esta canción empezó inmediatamente
    if (result.isPlayingNow) {
      io.emit('song_started', result.song);
    }

    // Confirmación al solicitante
    socket.emit('song_added_confirm', {
      success: true,
      song: result.song,
      position: result.position,
      isPlayingNow: result.isPlayingNow
    });
  });

  // Eliminar canción de la cola
  socket.on('remove_from_queue', ({ songId }) => {
    const removed = queueManager.removeFromQueue(songId);
    if (removed) {
      io.emit('queue_updated', queueManager.getFullState());
    }
  });

  // Reordenar canciones en la cola
  socket.on('reorder_queue', ({ fromIndex, toIndex }) => {
    const success = queueManager.reorderQueue(fromIndex, toIndex);
    if (success) {
      io.emit('queue_updated', queueManager.getFullState());
    }
  });

  // El reproductor de la TV envía ticks periódicos de tiempo de reproducción
  socket.on('tv_progress_tick', ({ currentTime, duration, isPlaying }) => {
    queueManager.updatePlayerState({ currentTime, duration, isPlaying });
    // Reenviar tick ligero a todos los clientes para mantener sincronizadas las barras de progreso
    io.emit('player_tick', { currentTime, duration, isPlaying });
  });

  // La TV notifica que terminó la canción actual
  socket.on('tv_song_ended', () => {
    const nextSong = queueManager.playNext();
    io.emit('queue_updated', queueManager.getFullState());
    if (nextSong) {
      io.emit('song_started', nextSong);
    } else {
      io.emit('queue_empty');
    }
  });

  // Acciones de control remoto (saltar, pausar, reproducir, anterior, limpiar)
  socket.on('host_control', ({ action, value }) => {
    if (action === 'next') {
      const next = queueManager.playNext();
      io.emit('queue_updated', queueManager.getFullState());
      if (next) io.emit('song_started', next);
    } else if (action === 'previous') {
      const prev = queueManager.playPrevious();
      io.emit('queue_updated', queueManager.getFullState());
      if (prev) io.emit('song_started', prev);
    } else if (action === 'clear') {
      queueManager.clearQueue();
      io.emit('queue_updated', queueManager.getFullState());
    } else if (action === 'play' || action === 'pause') {
      queueManager.updatePlayerState({ isPlaying: action === 'play' });
      // Notificar específicamente a la TV que pause o reproduzca
      io.emit('tv_playback_command', { action });
      io.emit('queue_updated', queueManager.getFullState());
    } else if (action === 'seek') {
      io.emit('tv_playback_command', { action: 'seek', value });
    }
  });

  socket.on('disconnect', () => {
    // Manejo de desconexión si fuese necesario
  });
});

// Iniciar servidor
server.listen(PORT, '0.0.0.0', async () => {
  const netInfo = await getNetworkInfo();
  console.log(`\n======================================================`);
  console.log(`🎤 SERVIDOR DE KARAOKE ACTIVO`);
  console.log(`📡 Red Local:   ${netInfo.ip}`);
  console.log(`📺 TV URL:      http://localhost:5173/tv  (o http://${netInfo.ip}:5173/tv)`);
  console.log(`📱 Móvil URL:   ${netInfo.clientUrl}`);
  console.log(`======================================================\n`);
});
