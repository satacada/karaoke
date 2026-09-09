# Registro de Cambios y Trazabilidad (CHANGELOG)

Todas las modificaciones, nuevas especificaciones, afinamientos y correcciones del proyecto se registran formalmente en este documento.

---

## [1.3.0] - 2026-09-09

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Nodo Celulares Invitados (PWA en Redes 4G/5G):**
  - Flujo de bienvenida express (`client/src/components/guest/GuestWelcomeModal.tsx`): ingreso de nombre/apodo en 1 toque, generación de token de sesión local y captura pasiva de coordenadas iniciales del establecimiento.
  - Hook de presencia híbrida y geocerca (`client/src/hooks/useGuestPresence.ts`): gestión de sesión persistente en `localStorage`, control de temporizador de 60 minutos de gracia (sin interrupciones) y validación pasiva por fórmula Haversine ($\le$ 200m) luego de la primera hora al solicitar una canción.
  - Buscador de YouTube híbrido Rockola + Karaoke (`client/src/components/guest/GuestSearchBar.tsx`, `GuestFilterChips.tsx`): selector de versiones interactivo:
    - `[ 🎵 Todo (Rockola) ]`: búsqueda abierta de cualquier canción o artista.
    - `[ 🎬 Video Oficial ]`: filtrado prioritario de videoclips musicales oficiales.
    - `[ 🎤 Solo Karaoke ]`: filtrado prioritario de pistas instrumentales con letra.
    - `[ 🎸 En Vivo ]`: recitales en vivo y sesiones acústicas.
  - Tarjeta interactiva de resultado de video (`client/src/components/guest/GuestSearchResultCard.tsx`): miniatura, título, autor, duración, etiqueta visual de versión y botón directo *"Pedir ➕"*.
  - Dashboard interactivo **"Mi Turno"** (`client/src/components/guest/GuestMyQueue.tsx`):
    - Banner animado con celebración cuando su tema está sonando en la pantalla gigante de la TV (*"¡Estás cantando ahora en la TV! 🎤✨"*).
    - Tarjeta de posición ordinal (`#1`, `#2` en la fila) y tiempo de espera estimado en minutos (`~6 min`).
    - Listado de temas solicitados por el invitado con botón de cancelación directa.
  - Modal accesible de confirmación para cancelar canciones (`client/src/components/guest/GuestCancelSongModal.tsx`) cumpliendo la directiva de cero `window.confirm`.
  - Modal accesible de bloqueo por distancia (`client/src/components/guest/GuestGeoBlockedModal.tsx`): notificación amigable cuando el invitado intenta pedir temas estando a más de 200m del local tras la hora de gracia.
  - Vista de la cola general de la sala (`client/src/components/guest/GuestPartyQueue.tsx`): visualización de la canción en TV y lista de espera en tiempo real.
  - Reglas de juego limpio (**Fair Play**): limitación de máximo 3 temas activos en cola por persona y período de enfriamiento de 15 segundos entre solicitudes.
  - Auto-arranque en TV (`client/src/components/tv/TvView.tsx`): transición automática de pantalla de espera a reproducción en cuanto entra la primera canción a la cola.
  - Pruebas E2E de integración (`server/testGuestFlow.js`): validado ciclo completo de búsqueda con filtros, registro de invitado, inserción a la cola, cálculo de turno y cancelación.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- Proxy inverso en Vite dev server (`client/vite.config.ts`): reenvío transparente de peticiones `/api/*` hacia el servidor Express en puerto 3001.
- Optimización de peso de la PWA: bundle final de producción de ~148 KB gzip (139 KB JS + 8.9 KB CSS), cumpliendo el requerimiento de carga ultrarrápida en redes celulares 4G/5G.
- Arquitectura Clean-by-Design: todos los 10 componentes atómicos de invitados (`GuestWelcomeModal`, `GuestHeader`, `GuestFilterChips`, `GuestSearchBar`, `GuestSearchResultCard`, `GuestMyQueue`, `GuestPartyQueue`, `GuestCancelSongModal`, `GuestGeoBlockedModal`, `GuestView`) se encuentran estrictamente por debajo del límite de 120 líneas de código.

---

## [1.2.0] - 2026-09-09

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Nodo Celular Anfitrión (Consola DJ Táctil Móvil):**
  - Pantalla de autenticación táctil express con PIN (`client/src/components/host/HostAuth.tsx`): teclado numérico estilo POS/cajero con feedback táctil y visual para desbloquear la sala con el PIN del dueño de casa (`1234`).
  - Tarjeta de monitoreo en vivo de la TV (`client/src/components/host/HostNowPlayingCard.tsx`): visualización de la canción que suena en la pantalla central, chip del cantante, duración y barra de progreso continua sincronizada.
  - Reordenamiento táctil por Drag-and-Drop y botones rápidos (`client/src/components/host/HostQueueItem.tsx`): asa táctil `⠿` para arrastrar con el dedo, botones de ajuste fino (`▲` / `▼`), botón relámpago `⚡ Poner Siguiente` (sube al puesto #1 instantáneamente) y eliminación individual (`🗑️`).
  - Botonera flotante de transporte multimedia (`client/src/components/host/HostTransportBar.tsx`): control de Play/Pausa, Saltar canción (`skip`), Seek +/-10s y barra deslizante de volumen de la TV.
  - Función **"Reiniciar Fiesta a Cero" (Nueva Jornada)** (`client/src/components/host/HostResetQueueModal.tsx` y `resetRoomQueue`): modal accesible con confirmación para vaciar la cola acumulada de ayer y regresar la TV a pantalla de espera de bienvenida.
  - Modal de **"Gestión de Invitados Ausentes"** (`client/src/components/host/HostGuestManagerModal.tsx`): agrupa canciones por persona y permite purgar todas las solicitudes de quien se retiró del local con un solo toque (`fn_purge_guest_songs`).
  - Modal de confirmación accesible para eliminar canciones individuales (`client/src/components/host/HostDeleteSongModal.tsx`) cumpliendo la regla de cero `window.confirm`.
  - Prueba de integración automatizada end-to-end (`server/testHostFlow.js`): validado ciclo completo de PIN, inserción, drag-and-drop, purga de ausente y reset a cero.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- Cumplimiento de Clean-by-Design: todos los componentes atómicos (`HostAuth`, `HostHeader`, `HostNowPlayingCard`, `HostQueueItem`, `HostTransportBar`, `HostResetQueueModal`, `HostGuestManagerModal`, `HostDeleteSongModal`, `HostView`) se mantienen estrictamente por debajo de 120 líneas de código.
- Compilación de producción con Vite 8 y Tailwind CSS v4 verificada exitosamente en 751 milisegundos con cero errores de TypeScript.

---

## [1.1.0] - 2026-09-09

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Mecanismo Híbrido de Presencia Física (Anti-Trolleo Remoto en Redes Celulares 4G/5G):**
  - Incorporación en `docs/security-standards.md` del protocolo de 3 capas:
    1. Código QR rotativo diario para invalidar capturas de jornadas pasadas.
    2. Período de gracia inicial de 60 minutos desde el primer escaneo donde el cliente pide música con cero interrupciones ni solicitudes de ubicación redundantes mientras se guardan las coordenadas del establecimiento.
    3. Verificación de geocerca pasiva post-gracia (Haversine <= 200m) que valida silenciosamente al presionar "Pedir canción" si la persona sigue físicamente en el local sin obligarla a levantarse de su mesa.
- **Soporte Híbrido de Catálogo Musical (Rockola Digital + Karaoke):**
  - Flexibilización del motor para permitir la búsqueda y reproducción de cualquier video o música de YouTube (videoclips oficiales, recitales en vivo, acústicos, salsa, cumbia, pop, rock) con selector interactivo de versiones para el usuario final.
- **Nodo TV / Reproductor (Android TV / Monitor):**
  - Implementación de la vista 10-foot UI (`client/src/components/tv/TvView.tsx`) optimizada para visualización a 3-5 metros en 1080p y 4K con cero dependencia del control remoto físico para la música.
  - Reproductor YouTube IFrame API limpio (`client/src/components/tv/TvPlayer.tsx`) configurado sin anuncios, sin controles intrusivos (`controls: 0`, `rel: 0`, `modestbranding: 1`), y con detección automática de término de video (`YT.PlayerState.ENDED`) para avance inmediato mediante RPC `fn_advance_next_song`.
  - HUD inferior en tiempo real (`client/src/components/tv/TvNowPlayingHUD.tsx`): chip luminoso con animación *"🎤 Canta: [Nombre]"*, título, artista y barra de progreso sincronizada.
  - Ticker flotante de próximas canciones (`client/src/components/tv/TvNextQueueTicker.tsx`): proyección de los próximos 3 turnos con nombres de los invitados y duraciones estimadas.
  - Widget QR flotante y pantalla de espera animada (`client/src/components/tv/TvFloatingQr.tsx` y `TvIdleScreen.tsx`): código QR nítido con `qrcode.react`, código de sala en tipografía gigante monoespaciada e indicador explícito para usar datos móviles 4G/5G sin necesidad de Wi-Fi.
  - Hook de suscripción en tiempo real (`client/src/hooks/useTvRealtime.ts`): canal WebSocket multiplexado que escucha eventos de la sala, cola de canciones y comandos remotos del anfitrión (`play`, `pause`, `skip`, `seek`, `volume`).
  - Emisión de ticks de sincronización periódicos (`updatePlaybackTick`) hacia Supabase para reflejar el progreso de reproducción en los celulares de los anfitriones e invitados.
  - Router modular en `client/src/App.tsx` con soporte de parámetros de URL (`?mode=tv`, `?mode=host`, `?mode=guest`) y barra selectora de roles para desarrollo.
  - Prueba de integración automatizada end-to-end (`server/testTvFlow.js`): valida conexión con sala `FIESTA`, encolamiento de canción, avance a reproducción, emisión de comando remoto de volumen y retorno a estado Idle.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- Cumplimiento riguroso de Clean-by-Design: todos los componentes atómicos (`TvFloatingQr`, `TvNowPlayingHUD`, `TvNextQueueTicker`, `TvPlayer`, `TvIdleScreen`, `TvView`) se mantienen por debajo de 120 líneas de código.
- TypeScript estricto al 100% con cero uso de tipo `any`, incluyendo definición completa de tipos para el reproductor de YouTube (`client/src/types/youtube.d.ts`).
- Corrección de bucle de re-renderizado en React: estabilización de callbacks con `useRef` en `TvPlayer.tsx` y uso de `loadVideoById` para transiciones sin parpadeo ni reseteo al segundo 0.
- Compilación de producción con Vite 8 y Tailwind CSS v4 verificada exitosamente en 465 milisegundos.

---

## [1.0.0] - 2026-09-08

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Arquitectura Triádica Multidispositivo:** Definición formal de los 3 nodos desacoplados:
  1. **Nodo TV / Reproductor (Android TV):** Video de YouTube a pantalla completa sin anuncios, sonido directo y proyección de QR de sala.
  2. **Nodo Consola DJ (Celular del Anfitrión):** Control remoto táctil para reordenar la música con el dedo, saltar canciones y expulsar temas de invitados que se fueron.
  3. **Nodo Invitados (PWA 4G/5G):** Web App ultra-ligera que no requiere conectarse al Wi-Fi de la casa ni descargar APKs pesadas.
- **Modelo de Datos PostgreSQL / Supabase:** Creación de las tablas `karaoke_rooms`, `karaoke_guests`, `karaoke_queue`, `karaoke_commands` y `karaoke_history` en `docs/data-model.md` y script DDL `supabase/migrations/01_initial_schema.sql`.
- **Procedimientos Almacenados Transaccionales:**
  - `fn_purge_guest_songs`: Eliminación atómica de todas las canciones de un invitado ausente y recompactación de los turnos ordinales restantes.
  - `fn_reorder_queue`: Desplazamiento seguro de posiciones en cola por drag-and-drop.
  - `fn_advance_next_song`: Transición continua e instantánea al siguiente tema sin silencios.
- **Topología Supabase Realtime:** Canales WebSockets multiplexados (`room:{code}`) para sincronización inmediata (< 50ms) entre redes celulares 4G/5G y la TV doméstica.
- **Pipeline de YouTube Sin Anuncios:** Especificación del reproductor limpio sin telemetría comercial ni pausas pre-roll.
- **Contrato OpenAPI 3.1:** Especificación técnica completa en `docs/api-spec.yml`.
- **Importación de Habilidades:** Incorporación de la skill `supabase-postgres-best-practices` en `.agents/skills` y registro en `skills-lock.json`.
- **Estándares de Seguridad Integral y Modelo STRIDE:** Creación de `docs/security-standards.md` cubriendo mitigaciones contra suplantación de anfitrión, manipulación de cola, inyecciones XSS/SQLi y reglas anti-abuso (Fair Play).
- **Flujo Git y Versionamiento Semántico:** Creación de `docs/git-workflow-and-versioning.md` con especificación SemVer 2.0.0, Conventional Commits y estrategia de ramas.
- **Buenas Prácticas de Desarrollo y Clean Architecture:** Creación de `docs/development-standards.md` con metodología Clean-by-Design, TypeScript estricto (cero `any`) y manejo desacoplado de hooks.
- **Protección de Secretos y Configuración:** Creación de `.gitignore` exhaustivo y plantilla `.env.example`.
- **Despliegue de Base de Datos en Supabase:** Ejecución exitosa de `supabase/migrations/01_initial_schema.sql` en el proyecto dedicado `pfhjrplnfuupftgzdnop`. Creación y verificación de tablas (`karaoke_rooms`, `karaoke_queue`, `karaoke_guests`, `karaoke_commands`, `karaoke_history`) y procedimientos almacenados (`fn_purge_guest_songs`, `fn_reorder_queue`, `fn_advance_next_song`) con respuesta HTTP 200 OK.
- **Motor de Búsqueda de YouTube con Caché:** Implementación de `server/searchService.js` con priorización automática de versiones con letra/karaoke y memoria caché con TTL de 30 minutos (respuesta en caché: 0.027ms).
- **Suite de Pruebas Unitarias Automatizadas (Vitest):** Creación de `server/queueLogic.test.js` con 10 pruebas unitarias verificadas (cálculo de turnos, tiempos de espera en minutos, reordenamiento correlativo y purga de ausente sin huecos ordinales). Cierre oficial de la Fase 1.

---

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- Adopción de la regla de oro: Cero `window.alert()` o `window.confirm()`, utilizando exclusivamente componentes modales accesibles con Tailwind CSS.
- Priorización del uso de datos móviles de los invitados para no saturar ni compartir la clave del Wi-Fi de la casa.
- Documentación completa del modo Bluetooth para anfitriones que utilicen un celular Android conectado a torres de sonido.
