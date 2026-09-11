# 📊 PLAN MAESTRO DEL PROYECTO: ROCKOLA DIGITAL LIVE (SISTEMA MULTI-TENANT EN TIEMPO REAL)

**Versión del Plan:** 2.38.0 (Ocultamiento QR Flotante en Reposo y Corrección de Arranque Auto-DJ)  
**Fecha de Emisión:** Septiembre 2026  
**Estado:** 🟢 Fase 2, Fase 3, Fase 4 y Fase 5 (Arranque Inmediato de Música y Pantalla Standby Limpia)  
**Metodología:** Agile / BDD / Clean Architecture con Compuertas de Control Formales  
**Alineación:** Estructura inspirada en `boot-ventas-saas` y `aplicacion para ofertas`  

---

## 1. RESUMEN EJECUTIVO Y VISIÓN DEL PRODUCTO

La **Rockola Digital Live** es una plataforma SaaS multi-tenant distribuida para locales comerciales, bares y fiestas que convierte cualquier pantalla en una rockola interactiva moderna donde los usuarios piden videoclips, temas en vivo y karaoke desde sus celulares.

### Pilares Fundamentales:
1. **Tríada de Dispositivos Desacoplada:**
   - **Nodo TV / Reproductor (Android TV o Navegador):** Reproduce videos de YouTube a pantalla completa, de forma continua y **sin cortes publicitarios**. Proyecta el estado en vivo y el Código QR de la sala. **No requiere usar el control remoto físico de la TV**.
   - **Nodo Celular del Anfitrión (Consola DJ Táctil y Administración del Dueño):** Acceso para administradores/dueños vía Google OAuth con potestad para cambiar el nombre comercial y el PIN de 4 dígitos. Consola operativa para DJs con drag-and-drop y control de volumen/saltos.
   - **Nodo Celulares de Invitados (PWA en Redes 4G/5G):** Los invitados escanean el QR y acceden al instante con su plan de datos móviles. Buscan en YouTube (videoclips, en vivo o karaoke), monitorean su posición en la fila, **reemplazan canciones sin perder su turno** e **intercambian el orden de sus propios temas** respetando las canciones de los demás.
2. **Infraestructura Cloud Realtime & Multi-Tenancy:**
   - Base de datos dedicada en **Supabase (PostgreSQL 16)** alojada en `pfhjrplnfuupftgzdnop.supabase.co` con partición por salas multi-tenant (`owner_id`, `owner_email`, `business_name`).
   - WebSockets bidireccionales con **Supabase Realtime** (< 50ms de latencia) que sincronizan TV, consola DJ y clientes móviles.

---

## 2. STACK TECNOLÓGICO COMPLETO

| Capa / Subsistema | Tecnología Seleccionada | Versión | Justificación Técnica | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Base de Datos** | PostgreSQL (Supabase) | 16 | Relacional ACID, funciones RPC transaccionales, soporte multi-tenant. | 🟢 Desplegado y Operativo |
| **Motor de Tiempo Real** | Supabase Realtime | Elixir WSS | Conecta redes disjuntas (4G invitados vs Wi-Fi TV) sin abrir puertos LAN. | 🟢 Activo con Full Replica |
| **Backend / Edge** | Node.js / Express | 22 LTS | Servidor de búsqueda de YouTube sin cuotas y proxy de metadatos. | 🟢 Operativo |
| **Frontend Framework** | React + Vite | 19 / 8.x | Single Page Application ultra-rápida con carga en < 1.5s en redes móviles. | 🟢 Compilado (código 0) |
| **Lenguaje** | TypeScript | 6.0+ | Modo estricto obligatorio (`noImplicitAny`, cero `any`, tipos nominales). | 🟢 Estandarizado 100% |
| **Estilos & UI** | Tailwind CSS + Lucide | 4.x | Design System Rockola Neon Dark con glassmorphism accesible. | 🟢 Estandarizado |
| **Motor de Búsqueda** | yt-search / Invidious | 2.12+ | Búsqueda directa de videos oficiales, karaoke y en vivo sin cuotas. | 🟢 Probado y Cacheado |
| **Reproductor Video** | YouTube IFrame API | v3 Embed | Reproductor embebido sin telemetría publicitaria ni pausas comerciales. | 🟢 Operativo y Verificado |
| **Testing** | Vitest + Node Suite | 5.x | Pruebas unitarias y de integración de reemplazo y swaps de cola. | 🟢 10/10 Vitest + 2 E2E OK |
| **Skills Importadas** | Supabase Best Practices, Dotenv | 1.1.1 | Buenas prácticas de PostgreSQL, índices FK, tipos y gestión de entorno. | 🟢 Importado |

---

## 3. MATRIZ DE FASES DEL PROYECTO (ROADMAP)

| Fase | Denominación del Hito | Duración Estimada | Estado | Hito de Control / Aprobación |
| :---: | :--- | :---: | :---: | :--- |
| **0** | **Arquitectura, Seguridad, Skills y Setup DDL** | 1 semana | 🟢 **COMPLETA** | Aprobación formal de documentación y modelos. |
| **1** | **Motor de Nube, Supabase Realtime y Búsqueda** | 1 semana | 🟢 **COMPLETA** | Migración DDL aplicada, búsqueda y tests (10/10 OK). |
| **2** | **Nodo TV / Android TV (Reproductor Sin Anuncios)** | 1.5 semanas | 🟢 **COMPLETA** | Reproducción continua, HUD, QR y comandos verificados. |
| **3** | **Nodo Celular Anfitrión (Consola DJ Táctil)** | 1 semana | 🟢 **COMPLETA** | Drag-and-Drop, purga de ausentes y reset a cero verificados. |
| **4** | **PWA Invitados Rockola + Swaps + Google Auth** | 1.5 semanas | 🟢 **COMPLETA** | Reemplazo de temas, swap propio y admin Google verificados. |
| **5** | **Empaquetado APK Android TV y Generación Cloud en GitHub Actions** | 1 semana | 🟢 **ACTIVA** | Compilación automática de APK con ícono de Rockola Jukebox y calibración de escala TV. |

---

## 4. DESGLOSE DETALLADO DE CADA FASE (WBS)

### 🟢 FASE 0: ARQUITECTURA, SEGURIDAD, SKILLS Y MODELADO DDL (COMPLETA)
**Objetivo:** Establecer los cimientos formales de ingeniería, seguridad STRIDE, estándares de desarrollo, importación de habilidades y modelos de datos relacionales optimizados.

**Actividades Ejecutadas:**
1. [x] Importación de skills en `.agents/skills`: `supabase-postgres-best-practices` (de *aplicacion para ofertas*), `dotenv` y `dotenvx` (de *boot-ventas-saas*).
2. [x] Creación de `skills-lock.json` registrando las 3 habilidades.
3. [x] Configuración de seguridad perimetral: `.gitignore` estricto y plantilla `.env.example`.
4. [x] Configuración de credenciales de Supabase en `.env` enlazando al proyecto dedicado `pfhjrplnfuupftgzdnop`.
5. [x] Elaboración de `docs/security-standards.md` (Modelo STRIDE, RLS, Fair Play anti-spam, XSS/SQLi).
6. [x] Elaboración de `docs/git-workflow-and-versioning.md` (SemVer 2.0, Conventional Commits, ramas Git).
7. [x] Elaboración de `docs/development-standards.md` (Clean-by-Design, TypeScript estricto, SOLID).
8. [x] Rediseño del Diagrama ERD en `docs/architecture-diagrams.md` bajo lineamientos de Supabase (índices FK, constraints, tipos).
9. [x] Actualización del script DDL `supabase/migrations/01_initial_schema.sql` con triggers `updated_at`, índices en todas las FKs y `REPLICA IDENTITY FULL`.
10. [x] Redacción de Historias de Usuario formales en `docs/user-stories.md` (HU-01 a HU-08).

**Entregables:**
- Suite de 12 documentos técnicos en `docs/`.
- Script DDL idempotente listo para ejecución.
- Repositorio blindado contra filtraciones de credenciales.

---

### 🟢 FASE 1: MOTOR DE NUBE, SUPABASE REALTIME Y BÚSQUEDA YOUTUBE (COMPLETADA)
**Objetivo:** Desplegar el esquema en la base de datos de Supabase, habilitar los canales de WebSockets en tiempo real y poner a punto el motor de búsqueda sin cuotas.

**Actividades Detalladas:**
1. [x] Ejecutar el script `supabase/migrations/01_initial_schema.sql` en la base de datos `pfhjrplnfuupftgzdnop`.
2. [x] Validar la creación de tablas: `karaoke_rooms`, `karaoke_guests`, `karaoke_queue`, `karaoke_commands`, `karaoke_history` (100% Verificado HTTP 200).
3. [x] Probar las funciones almacenadas transaccionales en PostgreSQL:
   - [x] `fn_reorder_queue(p_room_id, p_song_id, p_new_position)`.
   - [x] `fn_purge_guest_songs(p_room_id, p_guest_name)` (Verificado HTTP 200).
   - [x] `fn_advance_next_song(p_room_id)` (Verificado HTTP 200).
4. [x] Verificar la publicación activa en `supabase_realtime` con `REPLICA IDENTITY FULL`.
5. [x] Implementar el servicio de búsqueda de videos de YouTube con priorización Karaoke/Letra y caché en memoria (`server/searchService.js` con respuesta caché en 0.027ms).
6. [x] Implementar pruebas unitarias con Vitest para validación de lógica de turnos y tiempos de espera (10/10 tests pasando en `server/queueLogic.test.js`).

**Entregables:**
- Base de datos operativa en Supabase con RLS y RPCs verificadas. (✅ COMPLETADO)
- Canal Realtime `room:{code}` transmitiendo eventos a clientes conectados. (✅ COMPLETADO)
- Endpoint de búsqueda `/api/search` retornando resultados enriquecidos con caché. (✅ COMPLETADO)
- Suite de 10 pruebas unitarias automatizadas con Vitest pasando al 100%. (✅ COMPLETADO)

---

### 🟢 FASE 2: NODO TV / ANDROID TV (REPRODUCTOR SIN ANUNCIOS & DISPLAY) (COMPLETADA)
**Objetivo:** Desarrollar la aplicación de pantalla grande (10-foot UI) que reproducirá los videos sin interrupciones y proyectará el estado de la fiesta.

**Actividades Detalladas:**
1. [x] Maquetar la interfaz 10-foot UI optimizada para pantallas 1080p/4K con tipografía gigante de alto contraste (`client/src/components/tv/TvView.tsx`).
2. [x] Integrar el reproductor de YouTube optimizado (YouTube IFrame API con flags de supresión de anuncios y origen controlado: `client/src/components/tv/TvPlayer.tsx`).
3. [x] Implementar la transición automática continua: detección de `YT.PlayerState.ENDED` y llamada inmediata a `fn_advance_next_song` sin pausas publicitarias.
4. [x] Desarrollar el widget de Código QR dinámico de alta visibilidad (280x280px) con el código de sala alfanumérico legible a 4 metros (`client/src/components/tv/TvFloatingQr.tsx` y `TvIdleScreen.tsx`).
5. [x] Implementar el banner en vivo: *"Canta: [Nombre] con [Título]"* (`TvNowPlayingHUD.tsx`) y el ticker superior: *"A continuación: [Nombre]"* (`TvNextQueueTicker.tsx`).
6. [x] Conectar el receptor de comandos Realtime: escuchar `karaoke_commands` (`play`, `pause`, `skip`, `seek`, `volume`) emitidos por el celular del anfitrión (`client/src/hooks/useTvRealtime.ts`).
7. [x] Implementar el emisor de progreso `player_tick` para mantener sincronizados los celulares (`updatePlaybackTick` en `client/src/services/karaokeApi.ts`).

**Entregables:**
- Módulo TV (`/tv`) completamente funcional con reproducción continua sin anuncios. (✅ COMPLETADO)
- QR dinámico y recepción instantánea de órdenes del anfitrión. (✅ COMPLETADO)
- Modo Auto-DJ Ininterrumpido: Encadenamiento preventivo continuo tema tras tema sin silencios ni paradas involuntarias. (✅ COMPLETADO)
- Cronómetro de tiempo en pausa en tiempo real (`mm:ss`) al pausar la pantalla. (✅ COMPLETADO)
- Contador de tiempo de sala alquilada condicional (`TvPauseOverlay` y `TvRentalBadge`) visible únicamente cuando la sala opera bajo tiempo contratado por horas. (✅ COMPLETADO)
- Señalética D-Pad en pantalla para pausa de Auto-DJ con control remoto físico y poster imprimible para mesas (`docs/poster_karaoke_clientes.html`). (✅ COMPLETADO)
- Algoritmo Anti-Clustering y Rotación de Artistas en Auto-DJ: Intercalado round-robin y descarte en caliente de temas repetidos del mismo artista (`artistDiversityService.ts`). (✅ COMPLETADO)
- Control por Voz en Pantalla Smart TV y mandos compatibles (Web Speech API) con reconocimiento en español para pausa, play, skip y Auto-DJ (`TvVoiceHUD.tsx` y `useTvVoiceControl.ts`). (✅ COMPLETADO)
- Botón interactivo en pantalla para control con puntero (air mouse / mouse) y táctil en móviles sincronizado en tiempo real con consola host, control remoto físico y comandos de voz (`TvNowPlayingHUD.tsx` y `TvPauseOverlay.tsx`). (✅ COMPLETADO)
- Compilación de producción Vite 8 exitosa (código 0). (✅ COMPLETADO)
- Script de prueba end-to-end contra Supabase pasando al 100% (`server/testTvFlow.js`). (✅ COMPLETADO)

---

### 🟢 FASE 3: NODO CELULAR ANFITRIÓN (CONSOLA DJ TÁCTIL) (COMPLETADA)
**Objetivo:** Construir la consola de administración móvil táctil para que el anfitrión controle la fiesta con una sola mano sin usar el control remoto físico de la TV.

**Actividades Detalladas:**
1. [x] Crear la pantalla de login express con PIN de anfitrión (`/host?room=FIESTA`): teclado numérico táctil accesible (`HostAuth.tsx`).
2. [x] Desarrollar la lista interactiva de la cola con controles táctiles: botones rápidos `▲` / `▼`, botón relámpago `⚡ Poner Siguiente` y soporte de arrastre (Drag-and-Drop) (`HostQueueItem.tsx`).
3. [x] Implementar el panel **"Gestión de Invitados Ausentes"**:
   - Listado de personas con canciones en cola.
   - Botón *"🚪 Quitar canciones de [Nombre]"* con modal accesible Tailwind CSS (cero `window.confirm`) ejecutando `fn_purge_guest_songs` (`HostGuestManagerModal.tsx`).
4. [x] Desarrollar la barra de transporte multimedia flotante fija: Play/Pausa, Saltar canción (`skip`), Seek +/-10s, y control deslizante de volumen de la TV (`HostTransportBar.tsx`).
5. [x] Implementar la función **"Reiniciar Fiesta a Cero" (Nueva Jornada)**: modal accesible de confirmación para vaciar la cola de ayer y regresar la TV a pantalla de espera (`HostResetQueueModal.tsx` y `resetRoomQueue`).
6. [x] Implementar el gestor de **Tiempo de Sala Alquilada** para mozos y dueños (`HostRentalModal.tsx`): presets de 30m, 1h, 2h, 3h, extensiones rápidas (+15m, +30m) y liberación de sala.
7. [x] Pruebas de integración: validado ciclo completo de PIN, reordenamiento, purga de ausente y vaciado de sala al 100% (`server/testHostFlow.js`).

**Entregables:**
- Consola DJ (`/host`) operativa con gestión de cola táctil, control remoto y purga de invitados. (✅ COMPLETADO)
- Control de Alquiler de Sala por horas para locales multi-ambiente. (✅ COMPLETADO)
- Compilación de producción Vite 8 exitosa (código 0). (✅ COMPLETADO)
- Suite de 10 pruebas unitarias con Vitest pasando al 100%. (✅ COMPLETADO)

---

### 🟢 FASE 4: NODO CELULARES INVITADOS (PWA EN DATOS 4G/5G) (COMPLETADA)
**Objetivo:** Desarrollar la aplicación web progresiva ultra-ligera (< 150 KB) para que los invitados busquen canciones y sigan su turno desde sus datos móviles.

**Actividades Detalladas:**
1. [x] Crear el flujo de bienvenida express: escaneo de QR y registro de nombre/apodo en 1 toque (`GuestWelcomeModal.tsx`).
2. [x] Implementar la persistencia de sesión local (`GuestSession`) con token de sesión para recordar al invitado si se bloquea su pantalla (`useGuestPresence.ts`).
3. [x] Implementar el control de presencia antifraude híbrido: periodo de gracia inicial de 60 minutos sin interrupciones y geocerca pasiva (Haversine <= 200m) luego de la primera hora (`useGuestPresence.ts` y `GuestGeoBlockedModal.tsx`).
4. [x] Desarrollar el buscador de YouTube integrado Rockola + Karaoke con debounce (350ms) y chips de filtrado de versión: `[ 🎵 Todo (Rockola) ]`, `[ 🎬 Video Oficial ]`, `[ 🎤 Solo Karaoke ]`, `[ 🎸 En Vivo ]` (`GuestSearchBar.tsx`, `GuestFilterChips.tsx`, `GuestSearchResultCard.tsx`).
5. [x] Implementar la tarjeta dinámica destacada **"Mi Turno"** (`GuestMyQueue.tsx`):
   - Puesto en la fila (`#2`).
   - Canciones restantes y tiempo estimado de espera calculado en minutos (`calculateWaitTimeAndPosition`).
   - Alerta visual y celebración cuando está cantando en la TV (*"¡Estás cantando ahora en la TV! 🎤✨"*).
   - Cancelación de canciones propias con modal accesible Tailwind (`GuestCancelSongModal.tsx`).
6. [x] Implementar la vista de cola compartida de la sala para saber qué canciones vienen a continuación (`GuestPartyQueue.tsx`).
7. [x] Validar las reglas anti-spam (Fair Play): límite de 3 canciones activas en cola por invitado y cooldown de 15 segundos entre pedidos (`GuestView.tsx`).
8. [x] Conectar auto-arranque en la TV: reproducción instantánea cuando la TV está en espera y llega el primer pedido (`TvView.tsx`).
**Entregables:**
- PWA de invitados (`/join` o `?mode=guest`) operativa, ultra-ligera (139 KB JS gzip + 8.9 KB CSS gzip < 150 KB). (✅ COMPLETADO)
- Compilación de producción Vite 8 exitosa (764ms, 0 errores). (✅ COMPLETADO)
- Suite de pruebas E2E contra Supabase pasando al 100% (`server/testGuestFlow.js`). (✅ COMPLETADO)
- Todos los 10 componentes atómicos cumplen Clean-by-Design (< 120 líneas cada uno). (✅ COMPLETADO)

### 🟢 FASE 4.5: MÓDULO AVANZADO DE EXPERIENCIA ROCKOLA (COMPLETADA)
**Objetivo:** Potenciar la interacción social y monetización del local mediante Pases VIP con Mercado Pago, Reacciones en Vivo, Control de Horario, Auto-DJ y Votación Comunitaria.

**Actividades Ejecutadas:**
1. [x] **Pase VIP con Mercado Pago:** tarifa de $500 ARS por tema prioritario, alias de cobro `david.taboa` con copia en 1 toque y enlace directo `mercadopago://` (`GuestMercadoPagoModal.tsx`).
2. [x] **Identificación de Dispositivo Antifraude:** persistencia de `deviceId` (UUID) en `localStorage` para garantizar un tope máximo de 3 temas VIP consecutivos por celular ($1.500 ARS) protegiendo el Fair Play (`client/src/utils/deviceId.ts`).
3. [x] **Dedicatorias de 40 Segundos en TV:** banner extendido de 12s a 40 segundos con tipografía visible de 10 pies para festejos y dedicatorias de amor/amistad (`TvDedicationBanner.tsx`).
4. [x] **Reacciones y Emojis en Vivo (👏, 🔥, ❤️, 🍻):** barra inferior de reacciones rápidas en la PWA de invitados que dispara partículas animadas ascendentes por la pantalla de la TV estilo TikTok/Twitch Live vía Supabase Broadcast (`GuestLiveReactionsBar.tsx`, `TvFloatingReactions.tsx`, `index.css`).
5. [x] **Control de Horario / "Última Ronda":** botón de bloqueo instantáneo en la cabecera de la Consola DJ (`HostHeader.tsx`, `HostView.tsx`) para congelar la cola 30 minutos antes del cierre impidiendo nuevos pedidos de los invitados con aviso visual.
6. [x] **Modo Auto-DJ Ambiente:** interruptor en la configuración del anfitrión (`HostSettingsModal.tsx`) e indicador animado en la TV (`TvIdleScreen.tsx`, `TvView.tsx`) para mantener música de fondo que se silencia inmediatamente cuando un invitado pide un tema.
7. [x] **Votación y Likes en Cola:** botón de corazón interactivo en la fila comunitaria (`GuestPartyQueue.tsx`) con contador optimista y condecoración automática **"🔥 Más Esperado"** para el tema más votado de la noche.
8. [x] **Búsqueda Móvil Táctil (Enter / Flecha ➔) y Auto-Restauración:** soporte nativo de `<form onSubmit>` con `enterKeyHint="search"`, botón lupa interactivo, cierre automático de teclado (`blur()`) y auto-restauración de resultados en segundo plano con persistencia en `sessionStorage` (`GuestSearchBar.tsx`, `GuestView.tsx`, `GuestReplaceSongModal.tsx`).
9. [x] **Sincronización Automática en Tiempo Real (Cliente y Administrador):** aislamiento de canales con UIDs únicos (`useGuestRealtime.ts` y `useTvRealtime.ts`), heartbeat polling de respaldo cada 3.5s (`!document.hidden`), re-sincronización instantánea por visibilidad/foco y refresco a 0ms en operaciones locales.
10. [x] **Pedidos en TV Translúcidos con Borde Negro:** sustitución del bloque negro opaco en `TvNextQueueTicker.tsx` por tarjetas translúcidas de cristal (`.tv-translucent-card`, 20% opacidad), contornos negros en las letras (`.tv-text-outline`) y filtros drop-shadow en íconos para visualización completa del video de YouTube sin pérdida de contraste.
11. [x] **Cumplimiento Clean-by-Design:** todos los nuevos componentes y utilidades (`TvNextQueueTicker.tsx`, `useGuestRealtime.ts`, `GuestModals.tsx`, `GuestMercadoPagoModal.tsx`, etc.) cumplen estrictamente con el tope de $\le 120$ líneas.
12. [x] **Auto-DJ Autónomo Contextual:** la TV nunca se queda congelada ni en silencio al vaciarse la cola; activa automáticamente temas inteligentes de fiesta o basados en el historial reciente de la sala (`autoDjService.ts`, `useTvAutoDj.ts`).
13. [x] **Búsqueda Inteligente por Género y Ritmos:** detección de épocas/géneros ("música de los 80", "rock 80s", "salsa", "reggaeton", "blues", etc.) con carrusel de chips rápidos en PWA de invitados y expansión multi-artista en paralelo para evitar mixes largos de YouTube (`genreDefinitions.js`, `searchService.js`, `GuestGenreChips.tsx`).
14. [x] **Control Humano Obligatorio y Señal de Inicio ("Dar el Click"):** la TV nunca arranca el sonido por sorpresa; requiere un click o señal expresa del usuario (botón en pantalla TV o botón en celular anfitrión) para iniciar la reproducción inteligente (`useTvAutoDj.ts`, `TvIdleScreen.tsx`, `HostEmptyQueueCard.tsx`).
15. [x] **Pausa y Reanudación Universal de Reproducción:** control total de pausa tanto para el anfitrión (botón en barra inferior móvil) como para el mozo o personal en la sala (click/toque en la pantalla TV o botón OK/Pausa del control remoto físico de Android TV), con cartel visual elegante de pausa (`TvPlayer.tsx`, `TvPauseOverlay.tsx`, `HostTransportBar.tsx`).
16. [x] **Modo Android Móvil (Celular Puente con Salida Bluetooth):** soporte para fiestas sin TV donde el celular anfitrión es el reproductor central; incluye doble pestaña conmutable (`Modo Android (QR)` y `Host DJ`), código QR visible para escaneo de invitados, y audio continuo por Bluetooth con pantalla apagada mediante Media Session API, Screen Wake Lock y Web Audio keep-alive (`App.tsx`, `HostHeader.tsx`, `useMediaSession.ts`, `useWakeLock.ts`, `backgroundAudio.ts`).

---

### ⚪ FASE 5: EMPAQUETADO APK ANDROID TV Y PRUEBAS E2E (1 semana)
**Objetivo:** Empaquetar la aplicación en formato APK para Android TV y validar la estabilidad bajo condiciones de fiesta real.

**Actividades Detalladas:**
1. [x] **Compilación en la Nube con GitHub Actions (`.github/workflows/build-apk.yml`):** Pipeline automatizado en servidores virtuales de GitHub con Android SDK, Java 17 y Gradle para empaquetar y generar el binario APK de forma 100% remota sin compilar en el entorno local del desarrollador.
2. [x] **Detección Inteligente de Dispositivo (`deviceDetector.ts`):** Ocultamiento automático de la barra superior `[ Modo Android (QR) ]` y `[ Host DJ ]` cuando la aplicación se ejecuta en Smart TV / Android TV para mantener la pantalla 100% limpia de proyección, preservando el selector únicamente en celulares táctiles.
3. [x] **Web App Manifest PWA (`manifest.json` y recursos SVG):** Soporte PWA nativo y compatibilidad para generadores de APK (PWABuilder / TWA) e instalación directa en navegadores de Android TV.
4. [ ] Ejecutar pruebas de estrés concurrentes simulando 15 invitados en redes móviles 4G solicitando temas en simultáneo.
5. [ ] Validar la tolerancia a micro-cortes de red 4G con reconexión automática en background.
6. [x] Compilación final de producción verificada (`npm run build` código 0).
7. [ ] Redacción del manual de operaciones para el anfitrión.

**Entregables:**
- Archivo `.apk` instalable para Android TV / TV Box generado en la nube de GitHub Actions.
- Reporte final de pruebas de estrés y latencia.

---

## 5. MATRIZ DE GESTIÓN DE RIESGOS Y MITIGACIONES

| Identificador | Riesgo Técnico / Operativo | Impacto | Probabilidad | Plan de Mitigación Implementado |
| :---: | :--- | :---: | :---: | :--- |
| **R-01** | Micro-cortes en la señal 4G/5G de los invitados en interiores. | Medio | Alta | Mecanismo de reconexión automática con **Backoff Exponencial** en Supabase Realtime; almacenamiento en caché local del estado de la cola. |
| **R-02** | YouTube bloquea o interrumpe un video con anuncios publicitarios. | Alto | Baja | Pipeline de streaming desacoplado (`enablejsapi=1`, origen controlado, supresión de telemetría de ads) y fallback a stream directo en caso de error. |
| **R-03** | Un invitado pide 20 temas de golpe monopolizando la fiesta. | Alto | Media | Regla de juego limpio (**Fair Play**) en base de datos: máximo 3 temas activos por invitado y cooldown de 15s. |
| **R-04** | Invitados se retiran del evento dejando canciones huérfanas. | Medio | Alta | Función RPC `fn_purge_guest_songs`: el anfitrión elimina todos los temas del ausente con un solo toque desde su celular. |
| **R-05** | Colisión de turnos por solicitudes concurrentes en el mismo segundo. | Crítico | Media | Transacciones atómicas en PostgreSQL con bloqueo ordenado que serializa la asignación de números de turno. |

---

## 6. DEFINICIÓN DE HECHO (DEFINITION OF DONE - DoD)

Una actividad o fase se considera completada **únicamente** cuando cumple:
1. **Compilación Limpia:** `npm run build` ejecuta con código de salida 0 sin advertencias críticas.
2. **TypeScript Estricto:** Cero uso de `any`; todos los tipos declarados en `src/types/`.
3. **Cero Alertas Nativas:** Todas las confirmaciones usan componentes modales Tailwind accesibles.
4. **Pruebas Automatizadas:** Tests unitarios y de integración pasando al 100% en Vitest.
5. **Aislamiento de Datos:** Cero afectación a otras bases de datos; esquema ejecutado exclusivamente en `pfhjrplnfuupftgzdnop`.
6. **Trazabilidad:** Entrada correspondiente registrada en `docs/CHANGELOG.md` y casilla marcada en `PROGRESS.md`.
7. **Aprobación del Usuario:** Visto bueno formal del usuario antes de iniciar la siguiente fase.
