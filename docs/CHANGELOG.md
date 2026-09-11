# Registro de Cambios y Trazabilidad (CHANGELOG)

Todas las modificaciones, nuevas especificaciones, afinamientos y correcciones del proyecto se registran formalmente en este documento.

---

## [1.36.0] - 2026-09-11

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Selector Dual QR Interactivo durante Reproducción (`TvFloatingQr.tsx`, `TvSidebarOverlay.tsx`, `TvViewOverlays.tsx`):**
  - Se implementó en el QR flotante de reproducción las pestañas interactivas `[📱 Pedidos]` y `[🎧 Admin]`, permitiendo en cualquier momento ver y escanear el QR de Administrador (`/host?room=...`) sin detener la música.
  - Se agregó en la barra lateral el botón directo `[🎧 Admin]` y en el QR de Admin el botón `"Abrir en TV"` para conmutar inmediatamente a la Consola de Administrador en la misma pantalla.
- **Zona Permanente de Reacciones en Vivo Bajo el Código QR (`TvLiveReactionsZone.tsx`):**
  - Se integró un indicador visual con los 4 emojis de fiesta (`👏 🔥 ❤️ 🍻`) ubicado directamente debajo del código QR de clientes en la TV.
  - Reacciona en tiempo real con animación de pulso y nombre del invitado cuando los clientes envían aplausos, fuego o corazones desde su celular.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Blindaje Total de Detección de Dispositivos y Caché Web (`deviceDetector.ts`, `App.tsx`, `index.html`):**
  - **Meta-tags no-cache y Unregister de SW:** Se añadieron directivas HTTP `no-cache`, `no-store` y script de desregistro automático de Service Workers antiguos para evitar que los celulares ejecuten versiones obsoletas en caché.
  - **Saneamiento de almacenamiento heredado:** Se limpian claves viejas como `rockola_hide_mode_nav` y se previene que dispositivos móviles queden atascados en `tv` por `sessionStorage`.
  - **Regla Estricta de Móvil:** Dispositivos táctiles o con User-Agent móvil nunca se clasifican como TV, garantizando que el escaneo de QR abra siempre la vista correspondiente (`Cliente` o `Administrador`).
- **Eliminación de Superposición en Lista de Espera (`TvNextQueueTicker.tsx`):**
  - Se le asignó fondo oscuro sólido con glassmorphism opaco (`bg-zinc-950/90`), mayor ancho (`19rem`) y espaciado limpio, impidiendo que el título del video de YouTube se transparente por detrás y garantizando que los nombres de canciones se lean con total nitidez.
- **Firma Oficial Despejada y con Espacio Inferior (`TvNowPlayingHUD.tsx`):**
  - Se amplió el padding inferior a `pb-3 sm:pb-5`, logrando que `powered : David Taboada` y `Rockola Digital Live` tengan espacio visual suficiente y no se corten en bordes de pantallas panorámicas.

---

## [1.35.0] - 2026-09-11

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Selector Dual de Códigos QR en Pantalla Central TV (`TvIdleScreen.tsx`, `TvActivationScreen.tsx`, `TvUnlinkModal.tsx`):**
  - **QR para Clientes vs QR para Administrador:** En la pantalla central de espera se incorporaron pestañas conmutables para proyectar el código de clientes (`/join?room=...`) o el código de control del anfitrión (`/host?room=...`).
  - **Lanzamiento Directo de Consola en Pantalla:** Se añadió en la pantalla de espera, en la pantalla de activación y en el modal de configuración de TV el botón directo **"Abrir Consola Administrador en esta pantalla"**, permitiendo operar como DJ directamente en la pantalla de la TV o computadora sin requerir otro dispositivo.
- **Modo Administrador con Pestaña de Pruebas de Cliente (`App.tsx`, `HostView.tsx`):**
  - Al identificarse como Administrador, la credencial se resguarda en `localStorage`. Si el administrador escanea el QR de pedidos o presiona "Pedir Música", la app activa la pestaña `Cliente` (`GuestView`), pero **mantiene visibles y habilitadas las pestañas superiores de Administrador y el botón Admin**, permitiendo alternar y probar pedidos libremente.

### 🐛 [CORRECCIÓN / FIX]
- **Silencio Absoluto en Celulares de Administrador y Clientes (`App.tsx`):**
  - Se desmontó completamente el nodo `TvView` del DOM cuando la aplicación está en modo `Administrador` o `Cliente`.
  - El celular del dueño y los teléfonos de los invitados **no tocan ningún tema ni emiten sonido alguno**; el audio y video de YouTube se reproducen exclusiva y únicamente en la pantalla central de la TV (`currentMode === 'tv'`).

---

## [1.34.0] - 2026-09-11

### 🐛 [CORRECCIÓN / FIX]
- **Enrutamiento Inmediato y Corrección de Detección de Dispositivos (`deviceDetector.ts`, `App.tsx`):**
  - **Causa Raíz Resuelta:** Se eliminó la verificación de `rockola_hide_mode_nav` en `deviceDetector.ts`, la cual marcaba permanentemente un celular como TV si el usuario había cerrado la barra de modos. Además, se añadió filtro estricto de User-Agent móvil para nunca clasificar teléfonos como TV.
  - **Prioridad Absoluta de URL (`getInitialMode`):** Las rutas explícitas `/join` y parámetros `?mode=guest` fuerzan de inmediato la vista de Cliente (`GuestView`). Las rutas `/host` y `?pair=` abren directamente la consola de Administrador (`HostView`). La detección de TV solo opera si no existe una ruta explícita en la URL.
  - **Aislamiento Seguro de Invitados (`App.tsx`):** Si `isGuestOnly` es verdadero, `TvView` ni `TvActivationScreen` se montan en el DOM, impidiendo cualquier salto accidental a la pantalla de TV en celulares de clientes.
- **Eliminación de Marca de Agua Duplicada en TV (`TvView.tsx`):**
  - Eliminado el contenedor redundante en la esquina inferior izquierda de `TvView.tsx`. La firma oficial `powered : David Taboada` ahora se proyecta exactamente una vez en la esquina inferior derecha (tanto en el HUD de reproducción como en la pantalla de espera).
- **Restauración de Reacciones en Vivo Bajo el Código QR (`TvFloatingReactions.tsx`, `TvView.tsx`, `TvViewOverlays.tsx`):**
  - Desacoplado `<TvFloatingReactions>` del contenedor de overlays con `transform: scale` que alteraba las coordenadas de posición fija y enviaba las reacciones fuera de la pantalla.
  - Reubicado en la raíz de `TvView.tsx` en el lateral derecho (`absolute inset-y-0 right-3 sm:right-6 w-44`), flotando suavemente desde `bottom-20` hacia arriba justo por debajo del código QR de pedidos sin conflictos de transformación CSS.
- **Verificación de Proyección de Video 16:9 Completa:**
  - Verificado que en el tema `modern` predeterminado de `TvPlayer`, el iframe de YouTube ocupa el 100% de la superficie panorámica sin márgenes negativos, marcos decorativos ni recortes de bordes, coincidiendo con la relación de aspecto 16:9 oficial de YouTube.

---

## [1.33.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Arquitectura Rockola Portátil Bluetooth y Pestañas Duales en Celular (`App.tsx`, `HostHeader.tsx`, `HostView.tsx`):**
  - **Celular como Rockola Central:** La aplicación instalada en un smartphone Android ahora actúa como reproductor de sonido central conectado a parlante Bluetooth.
  - **Pestañas de Navegación para el Administrador:** El anfitrión puede alternar fluidamente entre `🎧 Administrador` (consola DJ con drag-and-drop, volumen, pausas y saltos), `🎵 Cliente` (buscador de YouTube para pedir temas él mismo) y `📲 Código QR` (pantalla con el QR visible para que sus amigos lo escaneen).
  - **Reproducción Continua Bluetooth sin Cortes:** El reproductor se mantiene montado en segundo plano en el DOM mientras el anfitrión navega entre la consola DJ y el catálogo de temas, asegurando que la música nunca se detenga.
  - **Audio con Pantalla Apagada en Android (`configure-tv-manifest.js`, `MainActivity.java`):** Incorporados permisos `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, `BLUETOOTH`, `BLUETOOTH_CONNECT` y `resumeTimers()` en el ciclo de vida `onPause()` de Android para que la música continúe sonando por Bluetooth aunque el teléfono se bloquee o apague la pantalla.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Código QR y Cola en TV Ultra-Compactos y No Invasivos (`TvFloatingQr.tsx`, `TvNextQueueTicker.tsx`, `TvSidebarOverlay.tsx`):**
  - El recuadro del QR se redujo a formato micro-card con fondo translúcido (`bg-black/35 backdrop-blur-sm`), dejando despejado el video musical.
  - La lista de espera lateral muestra únicamente hasta 2 canciones en píldoras compactas translúcidas.
  - La leyenda `powered : David Taboada` se reubicó en la esquina inferior izquierda, eliminando cualquier superposición con el reloj `1:21 / 4:00` y el botón de pausa.
- **Aislamiento 100% de la Interfaz de Invitados:** Los clientes que escanean el QR desde sus mesas entran exclusivamente en modo invitado (`GuestView`) sin acceso ni visibilidad alguna a botones o pestañas de administrador ("Soy DJ" eliminado para invitados).

### 🐛 [CORRECCIÓN / FIX]
- **Restauración de Visibilidad del QR y Reacciones en TV (`TvView.tsx`):** Asignada posición `absolute` a los contenedores transformacionales superiores (`top-0 left-0` y `top-0 right-0`), corrigiendo el desplazamiento que empujaba los elementos fuera de la pantalla visible.

---

## [1.32.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Calibrador Remoto de Escala de Pantalla TV en Tiempo Real (`HostTvScaleSelector.tsx`, `TvView.tsx`, `useTvRealtime.ts`):**
  - **Problema Abordado:** En locales con salones de diferentes dimensiones o televisores de distintas pulgadas (32", 50", 75", 85"+), las letras o íconos podían percibirse demasiado grandes o pequeños según la distancia de los clientes.
  - **Solución con Escalado Geométrico Transformacional:** Se implementó un control unificado en la consola del administrador con 4 niveles de calibración:
    1. `85% (Compacta)`: Para pantallas de 32"-43" o cuando se busca maximizar la superficie del video musical.
    2. `100% (Estándar)`: La escala equilibrada de referencia.
    3. `115% (Grande)`: Para pantallas de 50"-55" o salones con clientes a distancia media.
    4. `130% (Salón KTV)`: Para pantallas de 65"-85"+ o salones amplios donde el QR y los títulos deben verse a muchos metros.
  - **Cero Descuadre ni Deformación:** Al aplicar `transform: scale(factor)` con anclajes fijos (`transform-origin: top left` para cola y alquiler, `top right` para QR/sidebar y `bottom center` para el HUD), todos los elementos (letras, íconos, botones, códigos QR y badges) escalan matemáticamente juntos sin desbordes ni superposiciones.
  - **Sincronización Inmediata en Caliente:** El administrador toca la escala en su teléfono y la TV se ajusta en menos de 50ms sin interrumpir la reproducción.
- **Ícono Oficial de la Aplicación Rockola Jukebox y Banner de Android TV (`configure-tv-manifest.js`, `assets/`):**
  - **Diseño Personalizado:** Creado el ícono oficial basado en la rockola retro enviada por el usuario: ocupa el 100% del marco sin espacios negros ni bordes muertos, con tubos de neón siguiendo el contorno y el letrero central en relieve brillante **`JUKEBOX`**.
  - **Incrustación en Recursos APK de Android:** Generadas todas las densidades mipmap (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`) para `ic_launcher.png` e `ic_launcher_round.png`.
  - **Banner 16:9 para Android TV:** Incorporado `banner.png` (320x180 px) y asociado en `AndroidManifest.xml` con `android:banner="@drawable/banner"`, asegurando una carátula apaisada en la cuadrícula de apps de Android TV.
  - **Web / PWA:** Actualizados `manifest.json`, `icon-192.png`, `icon-512.png` y `favicon.png`.

---

## [1.31.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Galería de Máscaras Visuales Temáticas (Skins) para Pantalla TV (`HostTvMaskSelector.tsx`, `TvThemeFrame.tsx`):**
  - Creado un repertorio de 6 máscaras visuales profesionales seleccionables por el administrador desde su teléfono:
    1. 📺 **`modern` (Pantalla Completa):** Cinematográfica, limpia, sin bordes y con HUD flotante en glassmorphism.
    2. 📻 **`vintage` (Wurlitzer Retro 1950):** Arco retro clásico con disco de vinilo, tubos de neón con burbujas animados y parrilla cromada.
    3. ⚡ **`neon_club` (Cyber Club Neón):** Iluminación cian & fucsia fosforescente, ecualizador gráfico visual animado y vibras nocturnas.
    4. 🎤 **`karaoke_party` (Fiesta Glow KTV):** Gradientes rosa neón y púrpura festivo con insignias de micrófono y destellos.
    5. 🍸 **`dark_lounge` (Velvet Gold Lounge):** Elegante marco de oro viejo y obsidiana con acentos de latón para bares y pubs acústicos.
    6. 🕹️ **`synthwave_80s` (Retro Wave 80s):** Estética arcade retro-futurista con paleta naranja y violeta outrun.
  - **Sincronización en Caliente vía WebSockets:** Al tocar cualquier máscara en la consola del celular, se transmite la señal `set_tv_theme` en tiempo real y la TV cambia de piel instantáneamente.
- **Firma Oficial de Autoría (`TvNowPlayingHUD.tsx`, `TvIdleScreen.tsx`, `TvView.tsx`):**
  - Se incorporó la leyenda `powered : David Taboada` en la pantalla de la TV (tanto en reproducción activa como en pantalla de reposo) con escala tipográfica diminuta (`text-[clamp(8px,0.65vw,10px)]`), contorno protector (`tv-text-outline-sm`) y posicionamiento no invasivo.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Escalado Matemático y Proporcional Universal para TVs de Cualquier Pulgada (32" a 85"+):**
  - **Código QR Dinámico (`TvFloatingQr.tsx`):** Reemplazadas medidas en píxeles fijos por `clamp(76px, 7.5vw, 115px)` con contenedor SVG responsivo. Ocupa invariablemente entre el 6% y 8% del ancho de pantalla en cualquier TV o proyector.
  - **Sidebar de Pantalla (`TvSidebarOverlay.tsx`):** Ancho fluido `w-[clamp(115px,11vw,175px)]` y márgenes proporcionales con el viewport.
  - **HUD Inferior Cinematográfico (`TvNowPlayingHUD.tsx`):** Tipografía fluida con funciones `clamp()` en títulos, autores, tiempos y barra de reproducción.
  - **Cintillo Superior de Cola (`TvNextQueueTicker.tsx`):** Ancho relativo `max-w-[clamp(13rem,24vw,22rem)]` y tarjetas proporcionadas.
- **Cumplimiento Estricto Clean-by-Design ($\le 120$ líneas por archivo):**
  - `TvFloatingQr.tsx`: 39 líneas.
  - `TvSidebarOverlay.tsx`: 37 líneas.
  - `TvNowPlayingHUD.tsx`: 98 líneas.
  - `TvNextQueueTicker.tsx`: 67 líneas.
  - `TvIdleScreen.tsx`: 105 líneas.
  - `TvNeonClubFrame.tsx`: 46 líneas.
  - `TvPartyFrame.tsx`: 44 líneas.
  - `TvLoungeFrame.tsx`: 44 líneas.
  - `TvSynthwaveFrame.tsx`: 44 líneas.
  - `TvThemeFrame.tsx`: 30 líneas.
  - `TvView.tsx`: 109 líneas.
  - `HostTvMaskSelector.tsx`: 63 líneas.
  - `HostSettingsModal.tsx`: 93 líneas.
  - `client/src/types/index.ts`: 93 líneas.

---

## [1.30.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Retorno Directo a Modo Administrador / Consola DJ desde Celular (`GuestHeader.tsx`, `GuestView.tsx`, `App.tsx`):**
  - **Problema Solucionado:** Cuando el dueño o anfitrión escaneaba el código QR de cliente con su propio celular, la interfaz cambiaba a modo invitado (`GuestView`) sin opción para regresar al panel de DJ.
  - **Solución:** Incorporado el botón interactivo accesible `[ 🎛️ Soy DJ ]` en la barra superior de `GuestHeader`. Al ser presionado, invoca `onSwitchToHost()` en `App.tsx`, solicitando la verificación de credenciales/PIN de seguridad (`1234`) y restituyendo el control total de la Rockola al anfitrión sin necesidad de limpiar cookies ni reinstalar la app.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Código QR Compacto y Glassmorphism Translúcido en TV de 50" (`TvFloatingQr.tsx`, `TvSidebarOverlay.tsx`):**
  - Reducido el tamaño del código QR proyectado en pantalla de `140px` a `96px` con nivel de corrección `M` (alta legibilidad a distancia).
  - Reducción del ancho del sidebar de `w-64` a `w-36 sm:w-40` y ubicación discreta en `top-4 right-4`.
  - Tarjeta estilizada con `bg-black/40 backdrop-blur-md` (ultra-translúcida): el video musical y los videoclips se aprecian a través de ella sin oclusión de pantalla.
  - Removido el bloque redundante de botones de reacciones estáticos en la TV (las reacciones de los invitados ya flotan dinámicamente con animaciones en `TvFloatingReactions`).
- **HUD Inferior Cinematográfico y Tipografía Adaptada (`TvNowPlayingHUD.tsx`):**
  - Se redujo el gradiente oscuro inferior a `pt-8 px-5 py-2.5` (cubre solo el 10-12% inferior de la pantalla en vez del 30%), liberando el área visual del video musical.
  - Jerarquía tipográfica adaptada para pantallas de 50" y monitores: título `text-sm md:text-base lg:text-lg font-bold`, autor `text-[11px] md:text-xs`, badge "Pidió" `text-xs md:text-sm`, botón de pausa compacto `px-2.5 py-1 text-[11px]` y barra de progreso fina de `h-1.5`.
- **Cintillo de Próximas Canciones Compacto (`TvNextQueueTicker.tsx`):**
  - Ajustado de `max-w-md` a `max-w-xs sm:max-w-sm` en `top-4 left-4`, con tarjetas y textos compactos para evitar distracciones durante la reproducción.
- **Cumplimiento Clean-by-Design ($\le 120$ líneas):**
  - `TvFloatingQr.tsx`: 41 líneas.
  - `TvSidebarOverlay.tsx`: 37 líneas.
  - `TvNowPlayingHUD.tsx`: 94 líneas.
  - `TvNextQueueTicker.tsx`: 67 líneas.
  - `GuestHeader.tsx`: 117 líneas.
  - `GuestView.tsx`: 115 líneas.
  - `App.tsx`: 105 líneas.

---

## [1.29.0] - 2026-09-10

### 🐛 [CORRECCIÓN / FIX]
- **Resolución de Código QR en APK (`appUrl.ts`):**
  - **Problema:** Dentro del empaquetado APK de Android (Capacitor), `window.location.origin` resolvía a `http://localhost`, haciendo que el código QR generado para los invitados apuntara a `http://localhost/join?room=...` en lugar de la nube pública.
  - **Solución:** Implementada la utilidad `getPublicBaseUrl()`, `getJoinUrl()` y `getPairUrl()` en `client/src/utils/appUrl.ts`. Detecta si el origen es local, Capacitor o archivo y garantiza que el código QR proyectado en la TV apunte siempre al dominio oficial en producción: `https://karaoke-tc-c9fb.vercel.app/join?room=${roomCode}`.
- **Ocultamiento Confiable de Barra Superior en Android TV:**
  - **Detección Nativa en `MainActivity.java`:** `configure-tv-manifest.js` inyecta en el código Java nativo de Android la consulta a `UiModeManager.getCurrentModeType() == Configuration.UI_MODE_TYPE_TELEVISION` y `PackageManager.FEATURE_LEANBACK`, anexando `AndroidTV SmartTV Leanback` al User-Agent del WebView.
  - **Detección Web Heurística Mejorada (`deviceDetector.ts`):** Se amplió la detección de televisores mediante relación de aspecto panorámica 16:9 ($\ge 850$px de ancho) sin multitáctil, permitiendo identificar TVs aunque el WebView reporte `Mobile Safari`.
  - **Botón de Cierre Manual `✕` en `App.tsx`:** Permite ocultar la barra superior en 1 clic y guarda la preferencia en `localStorage.setItem('rockola_hide_mode_nav', 'true')` de forma persistente.
  - **Launcher de Android TV (`LEANBACK_LAUNCHER`):** Incorporada la categoría de intent `LEANBACK_LAUNCHER` en `AndroidManifest.xml` para que el APK figure directamente en la cuadrícula de apps de Android TV.
- **Limpieza de Advertencias en CI/CD:**
  - Actualizado `actions/setup-java` a `@v5` en `.github/workflows/build-apk.yml`.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Clean-by-Design Compliance:**
  - `client/src/utils/appUrl.ts`: 46 líneas ($\le 120$).
  - `client/src/utils/deviceDetector.ts`: 54 líneas ($\le 120$).
  - `client/src/App.tsx`: 105 líneas ($\le 120$).
  - `client/src/components/tv/TvView.tsx`: 119 líneas ($\le 120$).
  - `client/src/components/tv/TvActivationScreen.tsx`: 97 líneas ($\le 120$).

---

## [1.28.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Detección Automática de Dispositivo TV vs Celular Móvil (`deviceDetector.ts` & `App.tsx`):**
  - **Ocultamiento en Android TV:** Al instalarse o ejecutarse en un Smart TV / Android TV / TV Box, la barra de navegación superior flotante (`Modo Android (QR)` y `Host DJ`) se oculta automáticamente. La pantalla permanece 100% limpia y dedicada exclusivamente a la proyección del karaoke y el código QR para los invitados.
  - **Visualización en Celulares Móviles:** Cuando la aplicación se ejecuta en un smartphone con pantalla táctil, la barra superior permanece activa, permitiendo alternar con un toque entre el reproductor puente Bluetooth (`Modo Android (QR)`) y la consola DJ del anfitrión (`Host DJ`).
  - **Detección Multi-Parámetro Robusta:** Evalúa patrones de Smart TV (GoogleTV, AndroidTV, Tizen, WebOS, Leanback, Large Screen), la convención oficial de Google (`Android` sin `Mobile` = TV), y ausencia de pantalla táctil en monitores panorámicos, con soporte para anulaciones explícitas (`?device=tv` o `?device=mobile`).
- **Web App Manifest PWA (`manifest.json` y recursos SVG):**
  - Configurado `client/public/manifest.json` con iconos vectoriales dinámicos `icon-192.svg` y `icon-512.svg`, habilitando instalación nativa PWA en Smart TVs y celulares Android.
- **Compilación Automatizada de APK en la Nube (`.github/workflows/build-apk.yml`):**
  - Flujo de GitHub Actions con Android SDK, Java 17 y Gradle que compila en la nube el archivo binario `Karaoke-Party-Android-APK` y lo deja disponible para descarga directa en GitHub sin requerir instalaciones locales en la computadora.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Clean-by-Design Compliance:**
  - `client/src/utils/deviceDetector.ts`: 76 líneas ($\le 120$).
  - `client/src/App.tsx`: 96 líneas ($\le 120$).
- **Validación Automatizada:**
  - Suite de pruebas de detección de dispositivos (`scratch/test_device_detector.js`): 10/10 casos superados.
  - Compilación Vite 8 exitosa sin advertencias de tipos (código 0).

---

## [1.27.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Botón en Pantalla para Control de Puntero y Pantalla Táctil (TV & Celular Móvil):**
  - **Botón Interactivo en HUD (`TvNowPlayingHUD.tsx`):** Implementado botón táctil y de puntero de alta visibilidad `[ ⏸ Pausar Música ]` / `[ ▶ Continuar Música ]` en la barra inferior de reproducción. Permite pausar o continuar con un solo click usando el puntero del control remoto de TV (air-mouse), ratón convencional o mediante pulsación táctil con el dedo en la pantalla cuando la aplicación se ejecuta en un celular móvil conectado por Bluetooth.
  - **Botón de Reanudación en Overlay de Pausa (`TvPauseOverlay.tsx`):** Añadido botón interactivo `[ ▶ Continuar Música ]` en el modal de pausa que responde de inmediato al puntero o toque en pantalla.
  - **Sincronización Multidispositivo Total:**
    - Consola móvil del anfitrión (`/host`): Play / Pausa reflejados al instante en la TV.
    - Encargado de sala con control remoto físico: botones de Pausa, Play, Enter y OK sincronizados.
    - Control por voz: comandos *"Pausa"* y *"Continuar"* actualizan el estado del botón en pantalla.
    - Control de puntero / táctil: click en pantalla emite el tick de estado y sincroniza a todos los dispositivos.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Clean-by-Design Compliance:**
  - `client/src/components/tv/TvNowPlayingHUD.tsx`: 94 líneas ($\le 120$).
  - `client/src/components/tv/TvPauseOverlay.tsx`: 92 líneas ($\le 120$).
  - `client/src/components/tv/TvPlayer.tsx`: 116 líneas ($\le 120$).
  - `client/src/components/tv/TvView.tsx`: 119 líneas ($\le 120$).
- **Validación Automatizada:**
  - Compilación Vite 8 exitosa (código 0).
  - 14/14 tests unitarios de Vitest pasando al 100%.

---

## [1.26.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Auto-DJ Ininterrumpido y Cadena Continua Sin Silencios:**
  - **Persistencia Local y Sincronización Realtime (`autoDjStateService.ts`):** Resuelve el problema donde la música inteligente se detenía tras un solo tema. La TV ahora retiene y sincroniza `auto_dj_enabled` y la semilla musical tanto en almacenamiento local como a través del canal Realtime de Supabase, sin depender de DDL en la base de datos remota.
  - **Corrección de Cancelación de Temporizador (`useTvAutoDj.ts`):** Estabilización de referencias con `useRef` para evitar que las actualizaciones periódicas de tiempo (`currentTime`) aborten la preparación en segundo plano del siguiente tema.
  - **Encolado Preventivo Permanente:** Mientras suena una canción, el sistema asegura que siempre haya un tema preparado en la cola (`nextSongs.length > 0`). Si una canción finaliza sin cola previa, el sistema arranca automáticamente la siguiente sin regresar a la pantalla de espera (`TvIdleScreen`).
- **Control por Voz Integrado en Pantalla Smart TV (`useTvVoiceControl.ts` & `TvVoiceHUD.tsx`):**
  - Integración nativa con Web Speech API para mandos a distancia con micrófono o televisores Smart TV compatibles.
  - Reconocimiento de comandos por voz en español:
    - *"Pausa"*, *"Parar"*, *"Detener"* -> Pausa inmediata y despliegue del cronómetro de pausa.
    - *"Continuar"*, *"Reanudar"*, *"Play"*, *"Reproducir"* -> Reanudación fluida.
    - *"Siguiente"*, *"Saltar"*, *"Pasar"* -> Salto a la próxima pista.
    - *"DJ Automático"*, *"Música Inteligente"*, *"Activar DJ"* -> Activación de música continua sin fin.
    - *"Apagar DJ"*, *"Quitar DJ"*, *"Detener DJ"* -> Apagado de Auto-DJ y purga de cola automática.
  - **HUD Visual en TV (`TvVoiceHUD.tsx`):** Distintivo en esquina superior y notificación emergente (*toast*) con confirmación del comando de voz interpretado.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Clean-by-Design Compliance:**
  - `client/src/services/autoDjStateService.ts`: 27 líneas ($\le 120$).
  - `client/src/components/tv/TvVoiceHUD.tsx`: 63 líneas ($\le 120$).
  - `client/src/components/tv/TvViewOverlays.tsx`: 51 líneas ($\le 120$).
  - `client/src/hooks/useTvVoiceControl.ts`: 81 líneas ($\le 120$).
  - `client/src/hooks/useTvAutoDj.ts`: 60 líneas ($\le 120$).
  - `client/src/hooks/useTvRealtime.ts`: 105 líneas ($\le 120$).
  - `client/src/components/tv/TvView.tsx`: 119 líneas ($\le 120$).
  - `client/src/components/tv/TvIdleScreen.tsx`: 116 líneas ($\le 120$).
- **Validación Automatizada:**
  - `npm run build` en cliente completado con código 0.
  - 14/14 tests unitarios de Vitest pasando al 100%.

---

## [1.25.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Diversidad Obligatoria y Rotación de Múltiples Artistas en Música Inteligente (Anti-Clustering):**
  - **Detección de Clusters de Género y Familias Musicales (`server/genreDefinitions.js`):**
    - Agregado soporte exhaustivo para Grunge y Rock Alternativo de los 90 (`Stone Temple Pilots`, `Pearl Jam`, `Nirvana`, `Soundgarden`, `Alice in Chains`, `Foo Fighters`, `Red Hot Chili Peppers`, `The Smashing Pumpkins`, `Audioslave`, `Bush`).
    - Función de búsqueda inversa `findRelatedArtists(query)`: si el usuario o la sala escucha un artista (ej. Stone Temple Pilots), detecta su movimiento musical y devuelve a sus artistas afines para rotar de manera natural y variada.
  - **Intercalado Round-Robin de Resultados (`server/searchService.js`):**
    - `interleaveArtistResults`: las canciones de diferentes artistas se mezclan intercaladas (Artista A Tema 1, Artista B Tema 1, Artista C Tema 1, Artista A Tema 2...), impidiendo que YouTube devuelva bloques concentrados del mismo cantante.
  - **Servicio de Diversidad y Extracción de Artistas (`client/src/services/artistDiversityService.ts`):**
    - `extractArtistName`: extrae y normaliza el nombre del artista tanto del título (`Artista - Tema`) como del canal de YouTube, removiendo sufijos técnicos (`VEVO`, `Official`, `Letra`, `Karaoke`).
    - `isArtistRecent` & `recordRecentArtist`: historial de los últimos 5 artistas reproducidos; filtra y descarta cualquier tema del mismo artista si ya sonó recientemente.
    - `getNextDiverseSeed`: selecciona automáticamente el siguiente artista afín del cluster que no haya sonado, evitando la monotonía auditiva.
  - **Refactorización Limpia de Auto-DJ (`client/src/services/autoDjService.ts` & `autoDjStations.ts`):**
    - Subdivisión modular para mantener todos los archivos estrictamente bajo la regla Clean-by-Design ($\le 120$ líneas).
    - `fetchNextAutoDjTrack` descarta temas de artistas repetidos en caliente.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Clean-by-Design Compliance:**
  - `client/src/services/artistDiversityService.ts`: 66 líneas ($\le 120$).
  - `client/src/services/autoDjService.ts`: 101 líneas ($\le 120$).
  - `client/src/services/autoDjStations.ts`: 27 líneas ($\le 120$).
  - `server/genreDefinitions.js`: 85 líneas.
  - `server/searchService.js`: 115 líneas.
- **Validación Automatizada:**
  - Creada suite de pruebas unitarias `server/autoDjDiversity.test.js` con Vitest: 14/14 tests pasando (100%).
  - Compilación de producción Vite 8 exitosa (código 0).

---

## [1.24.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Indicador en Pantalla TV para Pausar Música Inteligente con Control Remoto:**
  - **Aviso en Reproducción (`TvNowPlayingHUD.tsx`):** Mientras suena un tema de Auto-DJ, se muestra el distintivo: `[ ⏸ Pausar: botón Pausa u OK del control remoto ]`, permitiendo al personal y a los clientes saber de inmediato que pueden pausar la música en cualquier momento.
  - **Aviso en Reposo (`TvIdleScreen.tsx`):** Bajo el botón de inicio de música inteligente se visualiza: *"Puedes pausar con botón Pausa u OK del control remoto"*.
- **Manual de Uso y Guía para Clientes del Local (`docs/MANUAL_CLIENTES_LOCAL.md`):**
  - Documento fundamentado en principios de psicología cognitiva, Ley de Hick (3 pasos de oro) y reducción radical de fricción (sin instalar apps, sin pedir contraseña de Wi-Fi, con datos móviles 4G/5G).
  - Guía operativa para mozos y encargados de sala con respuestas a situaciones comunes de clientes.
- **Afiche Imprimible A4 / Póster para Salones y Mesas (`docs/poster_karaoke_clientes.html`):**
  - Plantilla HTML/CSS de alto impacto visual lista para imprimir (`Ctrl + P`) o plastificar para mesas y paredes del local.
  - Destaca los 3 pasos, tips de cambio de canción sin perder turno, dedicatorias, control remoto y tiempo de sala.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Clean-by-Design Compliance:**
  - `TvNowPlayingHUD.tsx`: 74 líneas ($\le 120$).
  - `TvIdleScreen.tsx`: 116 líneas ($\le 120$).
- **Validación Automatizada:**
  - Compilación exitosa Vite 8 (código 0).
  - 10/10 pruebas unitarias con Vitest pasando.

---

## [1.23.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Reproducción Continua de Música Inteligente (Auto-DJ Ininterrumpido):**
  - **Encadenamiento Proactivo Sin Silencios (`useTvAutoDj.ts`):** Al dar click en *"▶ Iniciar Música Inteligente"* (en la TV o desde el celular del mozo/anfitrión), se activa de forma persistente `auto_dj_enabled = true`. El sistema encola preventivamente la siguiente canción mientras la actual está sonando, garantizando una cadena infinita sin regresar a pantalla de reposo.
  - **Condiciones Estrictas de Parada:** La música inteligente NO se detiene jamás por sí sola; únicamente se detiene si:
    1. El administrador o mozo pausa la sala remotamente (`room.status === 'paused'` o comando `pause`).
    2. El administrador o mozo corta / apaga la música inteligente (`auto_dj_enabled = false`).
    3. El mozo o usuario en la sala pausa la música usando el control remoto físico de la TV o tocando la pantalla.
  - **Prioridad de Invitados:** Si los invitados piden canciones con sus celulares, el Auto-DJ cede el paso de inmediato; al terminar los pedidos de la gente, la música inteligente retoma sin baches.
- **Cronómetro de Tiempo Transcurrido en Pausa ("Tiempo de corrida de pausa"):**
  - **Contador Ascendente en Vivo (`TvPauseOverlay.tsx`):** Al pausar la música, se activa un cronómetro en tiempo real que contabiliza exactamente cuánto tiempo lleva en pausa la sala (formato `mm:ss` o `hh:mm:ss`, ej. `⏱️ Tiempo en Pausa: 02:45 min`).
  - Se resetea automáticamente al presionar Play o reanudar desde el control remoto.
- **Contador de Tiempo de Sala Alquilada por Horas (Locales Multi-Sala y KTVs):**
  - **Gestión desde el Celular del Mozo / Anfitrión (`HostRentalModal.tsx`):** Modal optimizado para celulares con presets rápidos para asignar tiempo de sala (`30 min`, `1 hora`, `2 horas (KTV)`, `3 horas`) y botones de extensión rápida (`+15 min`, `+30 min`, `+1 hora`) o liberación de la sala.
  - **Visualización Condicional en TV (`TvPauseOverlay.tsx` & `TvRentalBadge.tsx`):**
    - En la pantalla de pausa: Muestra el tiempo restante con barra de progreso y el total contratado (ej. `⏳ Tiempo de Sala Restante: 01:45:20 de 2h contratadas`).
    - Durante la reproducción: Distintivo flotante y discreto en la TV (`TvRentalBadge.tsx`).
    - **Regla Estricta:** Si la sala no opera bajo la modalidad de alquiler por horas (modo libre), el contador de sala permanece completamente oculto.
  - **Sincronización Híbrida Realtime y Offline-Ready (`rentalService.ts`):** Canal de broadcast Supabase Realtime, comandos remotos bidireccionales y persistencia local sin requerir DDL destructivo.
  - **Migración DDL Documentada (`supabase/migrations/08_room_rental_sessions.sql`):** Columnas opcionales `rental_duration_minutes`, `rental_started_at` y `rental_expires_at` para la base de datos.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Estricto Cumplimiento Clean-by-Design ($\le 120$ líneas por archivo):**
  - `client/src/types/index.ts`: 91 líneas.
  - `client/src/services/rentalService.ts`: 72 líneas.
  - `client/src/hooks/useTvAutoDj.ts`: 73 líneas.
  - `client/src/hooks/useTvRealtime.ts`: 107 líneas.
  - `client/src/components/tv/TvPauseOverlay.tsx`: 107 líneas.
  - `client/src/components/tv/TvRentalBadge.tsx`: 60 líneas.
  - `client/src/components/tv/TvPlayer.tsx`: 117 líneas.
  - `client/src/components/tv/TvView.tsx`: 119 líneas.
  - `client/src/components/host/HostHeader.tsx`: 102 líneas.
  - `client/src/components/host/HostRentalModal.tsx`: 116 líneas.
  - `client/src/components/host/HostModals.tsx`: 65 líneas.
  - `client/src/components/host/HostView.tsx`: 116 líneas.
- **Validación Automatizada:**
  - Compilación de producción con TypeScript y Vite 8 exitosa (código 0).
  - 10/10 pruebas unitarias con Vitest pasando.

---

## [1.22.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Modo Android Móvil (Celular como Reproductor Central + Consola DJ + Salida Bluetooth a Barra de Sonido):**
  - **Doble Pestaña Superior Conmutable en Celular (`App.tsx`):**
    - `[ 📺 Modo Android (QR) ]`: Convierte el celular en la pantalla reproductora central con video de YouTube y código QR de gran legibilidad para que los invitados escaneen al llegar a la fiesta.
    - `[ 🎛️ Host DJ ]`: Consola DJ para gestionar la fila de pedidos, saltar canciones, cambiar volumen y configurar la sala.
  - **Acceso Rápido desde la Cabecera del Anfitrión (`HostHeader.tsx`):** Botón `[ 📺 Modo Android (QR) ]` en la barra de herramientas para mostrar el código QR a un invitado con un solo toque.
  - **Audio Continuo con Pantalla Apagada y Conexión Bluetooth:**
    - **Media Session API (`useMediaSession.ts`):** Registra el título, autor y carátula del tema en la pantalla de bloqueo de Android/iOS y vincula los controles multimedia (Play, Pause, Next) con los botones físicos del parlante o barra de sonido Bluetooth.
    - **Screen Wake Lock API (`useWakeLock.ts`):** Mantiene la pantalla del celular encendida y activa sobre la mesa durante la fiesta para escaneo continuo del QR sin apagados involuntarios.
    - **Keep-Alive de Audio Web (`backgroundAudio.ts`):** Mantiene abierto el pipeline de audio del sistema operativo sobre Bluetooth para evitar que los navegadores móviles suspendan el sonido al bloquearse la pantalla.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Nuevos Módulos y Estricto Cumplimiento Clean-by-Design ($\le 120$ líneas por archivo):**
  - `client/src/App.tsx`: 91 líneas.
  - `client/src/components/host/HostHeader.tsx`: 96 líneas.
  - `client/src/components/host/HostView.tsx`: 116 líneas.
  - `client/src/components/tv/TvView.tsx`: 110 líneas.
  - `client/src/components/tv/TvSidebarOverlay.tsx`: 37 líneas.
  - `client/src/hooks/useMediaSession.ts`: 59 líneas.
  - `client/src/hooks/useWakeLock.ts`: 30 líneas.
  - `client/src/utils/backgroundAudio.ts`: 42 líneas.
- **Validación Automatizada y Compilación:**
  - Suite de 10 pruebas unitarias con Vitest pasando al 100% (10/10 OK).
  - Compilación de producción Vite 8 exitosa con código de salida 0.

---

## [1.21.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Pausa y Reanudación Universal de Reproducción (Celular Anfitrión, Pantalla TV y Control Remoto Físico):**
  - **En el Celular del Administrador (`HostTransportBar.tsx`):** Botón central destacado de Play/Pausa (`⏸` / `▶️`) ubicado permanentemente en la barra de transporte inferior fija. Al tocarlo, envía instantáneamente la orden remota por WebSockets a la TV (`command: 'pause'` / `'play'`).
  - **En la Pantalla de la TV mediante Click o Toque (`TvPlayer.tsx`):** Si un mozo o encargado se acerca al televisor o pantalla táctil y hace click en cualquier sector del reproductor, el sistema conmuta inmediatamente entre Pausa y Reproducción (`togglePlayPause`).
  - **Soporte Nativo de Control Remoto Físico de TV / Android TV (`TvPlayer.tsx`):**
    - Soporte para el botón central circular `OK / Enter` de controles remotos de Android TV, Google TV, Smart TV Box y teclados.
    - Soporte para botones dedicados multimedia de controles remotos: `MediaPlayPause`, `MediaPause`, `MediaPlay` (keyCode 179).
    - Soporte para la barra espaciadora (`' '`).
    - Un mozo puede simplemente apuntar el control remoto a la TV y presionar `OK` o `Pausa` para detener o continuar la música sin necesidad de abrir ningún menú.
  - **Insignia Visual Accesible de Estado (`TvPauseOverlay.tsx`):** Al pausar, se proyecta un overlay elegante en el centro de la pantalla: `[ ⏸ Música en Pausa - Toca la pantalla o presiona OK en el control para continuar ]`, garantizando claridad total para los asistentes del bar.
  - **Sincronización Bidireccional en Tiempo Real:** Si el mozo pausa desde la TV con el control físico, el celular del anfitrión actualiza su botón a `▶️ Play` a 0ms; si el dueño reanuda desde su teléfono, la TV oculta el cartel de pausa y reanuda el sonido.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Desacoplamiento Atómico Modular:** Creación de `TvPauseOverlay.tsx` (18 líneas).
- **Estricto Cumplimiento Clean-by-Design ($\le 120$ líneas por archivo):**
  - `client/src/components/tv/TvPlayer.tsx`: 116 líneas.
  - `client/src/components/tv/TvPauseOverlay.tsx`: 18 líneas.
- **Validación Automatizada y Compilación:**
  - Suite de 10 pruebas unitarias con Vitest pasando al 100% (10/10 OK).
  - Compilación de producción Vite 8 exitosa con código de salida 0.

---

## [1.20.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Control Humano Obligatorio y Señal Explícita de Inicio de Sonido ("Dar el Click"):**
  - **Eliminación del Auto-Arranque Involuntario en Reposo (`useTvAutoDj.ts`):** El motor inteligente nunca iniciará la reproducción de audio automáticamente por el solo hecho de abrir la TV o tener la cola vacía (`if (!currentSong) return;`). La sala permanece en reposo silencioso hasta recibir la orden humana.
  - **Botón de Señal en la Pantalla TV (`TvIdleScreen.tsx`):** La pantalla de reposo en la TV incluye un botón interactivo destacado `[ ▶ Iniciar Música Inteligente ]` con feedback visual. Al dar click directamente en el televisor, se desbloquea el contexto de audio del navegador (cumpliendo con las políticas de autoplay de Smart TVs y navegadores web) y se arranca la primera canción de inmediato.
  - **Botón de Señal en el Celular del Administrador (`HostEmptyQueueCard.tsx` & `HostView.tsx`):** En la consola DJ móvil, cuando la cola está vacía, se presenta el botón de acción principal `[ ▶ Iniciar Música Inteligente ]` y el botón de Play en la barra de transporte. Al pulsar el botón desde el teléfono, se emite la señal remota por WebSockets en tiempo real (`command: 'play'`), se encola el tema inteligente seleccionado y arranca el sonido en la TV.
  - **Continuidad de Fondo Únicamente con Sesión Activa:** El Auto-DJ solo asiste preparando el siguiente tema mientras una canción ya esté sonando en pantalla (`currentSong !== null`), garantizando una transición suave sin silencios solo mientras la fiesta esté en marcha.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Desacoplamiento Atómico Modular:**
  - `client/src/components/tv/TvIdlePromoCard.tsx`: 29 líneas.
  - `client/src/components/tv/TvSidebarOverlay.tsx`: 37 líneas.
- **Estricto Cumplimiento Clean-by-Design ($\le 120$ líneas por archivo):**
  - `client/src/hooks/useTvAutoDj.ts`: 48 líneas.
  - `client/src/components/tv/TvIdleScreen.tsx`: 117 líneas.
  - `client/src/components/tv/TvView.tsx`: 114 líneas.
  - `client/src/components/host/HostEmptyQueueCard.tsx`: 46 líneas.
  - `client/src/components/host/HostView.tsx`: 116 líneas.
- **Validación Automatizada y Compilación:**
  - Suite de 10 pruebas unitarias con Vitest pasando al 100% (10/10 OK).
  - Compilación de producción Vite 8 exitosa con código de salida 0.

---

## [1.19.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Auto-DJ Autónomo / Playlist Inteligente de Respaldo (`autoDjService.ts` & `useTvAutoDj.ts`):**
  - **Eliminación de Silencios y Pantallas Congeladas:** Cuando la cola de canciones de la sala queda vacía (`!currentSong && nextSongs.length === 0`), el sistema activa un temporizador de 800ms que inyecta automáticamente una canción seleccionada por el motor inteligente.
  - **Activación por Defecto:** Si el anfitrión no ha configurado explícitamente el Auto-DJ o no lo ha apagado de forma deliberada (`room.auto_dj_enabled !== false`), la lista inteligente se activa de oficio, garantizando que el local o salón siempre tenga música y video.
  - **Algoritmo de Selección Contextual por Sala (`getSmartGenreForRoom`):**
    - Consulta los últimos temas reproducidos con éxito en la sala (`status = 'finished'`) para extraer el artista más recurrente como semilla de recomendación (`seed:${top.author}`).
    - Si no existe historial previo (sala recién abierta o primer inicio), rota automáticamente entre estaciones festivas de alta rotación (`hits_80_90`, `rock_nacional`, `cumbia_fiesta`).
  - **Etiquetado e Integración Transparente:** Los temas inyectados se rotulan como solicitados por `🤖 Auto-DJ`. Cualquier solicitud posterior realizada por un invitado o el anfitrión toma prioridad natural en la cola.
- **Búsqueda Avanzada por Géneros, Décadas y Ritmos Musicales (`server/genreDefinitions.js`, `server/searchService.js`, `client/api/genreDefinitions.js`, `client/api/search.js`):**
  - **Detección Semántica de Géneros y Décadas:** Reconocimiento instantáneo mediante expresiones regulares de consultas amplias como *"música de los 80"*, *"rock de los 80"*, *"salsa"*, *"blues / bluet"*, *"rock roll / rock and roll"*, *"reggaeton / perreo"*, *"cumbia / cuarteto"*, *"baladas / boleros"*, *"disco"*.
  - **Expansión Paralela por Artistas Representativos:** Resuelve el problema donde YouTube devolvía mezclas y enganchados de 2 a 3 horas (los cuales eran descartados por los filtros de duración de temas individuales). El motor despacha consultas en paralelo para artistas legendarios de cada género (ej. 80s: Queen, Michael Jackson, Soda Stereo, Bon Jovi; salsa: Marc Anthony, Héctor Lavoe, Frankie Ruiz; blues: Eric Clapton, B.B. King, Muddy Waters; reggaeton: Daddy Yankee, Don Omar, Wisin & Yandel, Bad Bunny; rock roll: Elvis Presley, Chuck Berry, Little Richard) ensamblando un catálogo diverso de temas de 2 a 6 minutos.
  - **Carrusel de Chips de Género para Invitados (`GuestGenreChips.tsx` & `GuestSearchBar.tsx`):**
    - Deslizador táctil horizontal en la PWA móvil de invitados con botones de un toque: ⚡ Música 80s, 🎸 Rock 80s, 💃 Salsa, 🌴 Cumbia, 🔥 Reggaetón, 🎷 Blues, 📻 Hits 90s, 🎙️ Rock & Roll, ❤️ Baladas.
    - Al presionar un chip se ejecuta la búsqueda multi-artista de forma instantánea.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Estricto Cumplimiento Clean-by-Design ($\le 120$ líneas por archivo):**
  - `client/src/services/autoDjService.ts`: 117 líneas.
  - `client/src/hooks/useTvAutoDj.ts`: 48 líneas.
  - `client/src/components/guest/GuestGenreChips.tsx`: 44 líneas.
  - `client/src/components/guest/GuestSearchBar.tsx`: 97 líneas.
- **Compilación Limpia:** 0 errores TypeScript (`tsc -b`) y build de producción Vite exitoso.

---

## [1.18.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Ciclo Intermitente de Dedicatorias en Pantalla TV (12s visible / 33s descanso):**
  - **Ubicación Lateral Derecha (`TvDedicationBanner.tsx`):** La tarjeta de dedicatoria ahora se ubica en el lateral derecho de la pantalla, justo debajo de las promociones del local, en armonía con el código QR.
  - **Frecuencia y Desaparición Cíclica:** Aparece durante 12 segundos (tiempo ideal para leer el mensaje con calma) y se oculta durante 33 segundos (~45 segundos en total), repitiéndose durante toda la duración de la canción.
  - **Cese Automático al Terminar la Canción:** Al finalizar la canción o saltar al siguiente tema, la dedicatoria desaparece de inmediato y se cancelan todos los temporizadores. Si la nueva canción no tiene dedicatoria, el espacio queda completamente limpio.
- **Frecuencia Óptima de Promociones Basada en Neuromarketing y DOOH (14s visible / 46s descanso):**
  - **Eliminación del Banner Fijo Permanente:** Para combatir la *Ceguera de Banners (Banner Blindness)* y la fatiga visual de los asistentes en el bar, las promociones del administrador ya no son estáticas ni permanentes.
  - **Fundamentación Científica y Psicológica (DOOH / Hospitality):**
    - **14 segundos en pantalla:** Tiempo de exposición óptimo para lectura, comprensión y procesamiento social sin generar rechazo (el tiempo de fijación cognitiva promedio para un titular y precio de barra es de 5 a 8 segundos).
    - **46 segundos de descanso:** Deja la pantalla completamente despejada para el video de YouTube (75% del tiempo pantalla limpia, 25% presencia publicitaria).
    - **Ciclo de 60 segundos (1 impacto por minuto):** En cada nueva aparición, el sistema avanza automáticamente a la siguiente promoción activa del local con una animación de entrada suave que reactiva la atención focal de los clientes.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Tipado Estricto de Navegador:** Uso de `ReturnType<typeof setTimeout>` para compatibilidad con TypeScript estricto en el cliente web.
- **Estricto Cumplimiento Clean-by-Design ($\le 120$ líneas por archivo):**
  - `client/src/components/tv/TvDedicationBanner.tsx`: 71 líneas.
  - `client/src/components/tv/TvPromoTicker.tsx`: 104 líneas.
  - `client/src/components/tv/TvView.tsx`: 118 líneas.
- **Compilación Limpia:** 0 errores TypeScript (`tsc -b`) y build de producción exitoso.

---

## [1.17.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Sistema de Activación y Emparejamiento TV Estilo Netflix / YouTube TV (QR + Código Corto 6 Caracteres):**
  - **Pantalla de Activación TV (`TvActivationScreen.tsx`):** Si un televisor nuevo o recién instalado arranca sin sala asignada, presenta un código QR grande y un código alfanumérico visible de 6 caracteres (ej. `TV-4821`). Elimina la necesidad de escribir nombres largos o contraseñas con el control remoto físico.
  - **Canal de Broadcast Realtime Efímero (`tv-activation-${code}`):** La TV se suscribe a su canal de activación. Cuando el anfitrión confirma el enlace desde su teléfono móvil, la pantalla recibe el evento `paired` en tiempo real, persiste la sala asignada en `localStorage.setItem('tv_paired_room', roomCode)` y transiciona al reproductor `TvView` de inmediato.
  - **Persistencia y Resiliencia ante Cortes de Energía:** La vinculación se mantiene guardada localmente en el televisor o Android TV; al reiniciar el equipo o volver la electricidad, la pantalla reanuda automáticamente el sector asignado sin re-solicitar emparejamiento.
  - **Apertura Instantánea vía Escaneo de QR Móvil (`/host?pair=TV-XXXX`):** Al escanear el QR con la cámara de cualquier teléfono del dueño o encargado, se abre directamente la consola del anfitrión con el modal `HostPairTvModal.tsx` precargado con el código del televisor.
  - **Identificación Visual por Destello Neón ("⚡ Hacer Parpadear"):** Diseñado para locales con múltiples ambientes y televisores. Tanto al emparejar como desde la consola de administración, el anfitrión puede disparar un destello que hace vibrar la pantalla seleccionada con un marco verde esmeralda y el mensaje `⚡ PANTALLA IDENTIFICADA: [Sector]`, evitando emparejar la pantalla equivocada.
  - **Desvinculación y Re-enlace Bidireccional (Local y Remoto):**
    - **Remoto desde Master Venue Hub (`HostMasterHubModal.tsx`):** El dueño puede enviar la orden `unlink_tv` a cualquier ambiente para desvincular la TV y enviarla de regreso a la pantalla de emparejamiento.
    - **Local desde la TV (`TvUnlinkModal.tsx`):** En la esquina de la TV, un botón de ajustes ⚙️ permite confirmar la desvinculación local mediante un modal accesible, limpiando el almacenamiento y permitiendo reasignar el televisor a otro sector o anfitrión.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Ampliación de Tipos de Control Remoto:** Incorporación de `'flash_identify' | 'unlink_tv'` a `CommandType` en `client/src/types/index.ts`.
- **Integración en Hub Multi-Ambiente (`HostMasterHubModal.tsx`):** Acceso rápido con botones dedicados para probar destello (`Sparkles`), desvincular (`Tv`) y vincular nueva pantalla TV.
- **Estricto Cumplimiento Clean-by-Design ($\le 120$ líneas por archivo):**
  - `client/src/App.tsx`: 70 líneas.
  - `client/src/components/tv/TvActivationScreen.tsx`: 96 líneas.
  - `client/src/components/tv/TvUnlinkModal.tsx`: 52 líneas.
  - `client/src/components/tv/TvView.tsx`: 116 líneas.
  - `client/src/components/host/HostPairTvModal.tsx`: 108 líneas.
  - `client/src/components/host/HostModals.tsx`: 61 líneas.
  - `client/src/components/host/multiroom/HostMasterHubModal.tsx`: 112 líneas.
  - `client/src/components/host/HostView.tsx`: 117 líneas.
- **Compilación Limpia:** 0 errores TypeScript (`tsc -b`) y empaquetado de producción Vite exitoso.

---

## [1.16.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Visualización Translúcida de Pedidos en TV con Borde Negro en Letras:**
  - **Fondo Translúcido de Alta Visibilidad de Video (`.tv-translucent-card`):** Se reemplazó el fondo negro opaco de la esquina superior izquierda (`TvNextQueueTicker.tsx`) por un panel translúcido de cristal sutil (`rgba(0, 0, 0, 0.20)` con `backdrop-blur`), permitiendo ver el videoclip de fondo casi por completo.
  - **Borde y Contorno Negro en Tipografía (`.tv-text-outline` y `.tv-text-outline-sm`):** Las letras mantienen sus colores originales (blanco en el título de la canción, rosa en el nombre del solicitante, púrpura en el badge del turno, etc.), pero ahora cuentan con un contorno negro nítido de 1px y sombra de contraste, garantizando perfecta legibilidad incluso cuando el video de YouTube tiene escenas brillantes, cielo o fondo blanco.
  - **Efecto de Sombra Negra en Íconos:** Se agregaron filtros `drop-shadow` negros a los íconos de música, usuario y flecha para que resalten sobre cualquier toma del video.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Estricto Cumplimiento Clean-by-Design ($\le 120$ líneas):**
  - `client/src/components/tv/TvNextQueueTicker.tsx`: 66 líneas.
  - `client/src/index.css`: Clases `.tv-translucent-card`, `.tv-text-outline`, `.tv-text-outline-sm`.
- **Compilación Limpia:** 0 errores TypeScript (`tsc -b`) y empaquetado de producción Vite exitoso.

---

## [1.15.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Sincronización Automática de Cola en Tiempo Real (Cliente y Administrador):**
  - **Nuevo Hook Modular `useGuestRealtime.ts`:** Encapsula el ciclo de vida de la sala, la cola y la suscripción en tiempo real de invitados de forma reactiva y aislada.
  - **Identificadores de Canal Únicos por Instancia:** Asignación de nombres únicos (`tv-rt-${roomId}-${uid}` y `guest-rt-${roomId}-${uid}`) que evitan el conflicto interno de Supabase (`cannot add postgres_changes callbacks after subscribe()`) cuando TV y Administrador conviven en el mismo navegador o sesión.
  - **Heartbeat de Respaldo y Red de Seguridad (3.5s):** Sondeo periódico ligero que consulta la base de datos únicamente si la pantalla está visible (`!document.hidden`), garantizando que si el WebSocket experimenta caídas o congelamiento en redes móviles 4G/5G, la lista se actualice en máximo 3.5 segundos.
  - **Sincronización Instantánea por Foco y Visibilidad:** Re-sincronización reactiva inmediata al desbloquear el teléfono o regresar a la pestaña del navegador (`visibilitychange` y `window.onfocus`).
  - **Refresco Inmediato a 0ms en Acciones Locales:** Invocación directa de `refreshQueue()` tras añadir una canción (`executeAddSong`), cancelarla, reemplazarla, reordenarla o cambiar entre pestañas de navegación.

### 🐛 [CORRECCIÓN / FIX]
- **Subsanación de Fuga de Suscripción en Invitados:** Corregido el defecto donde la función de desuscripción de `GuestView` estaba atrapada dentro de una promesa `.then()`, permitiendo a React limpiar y renovar correctamente los canales en cada ciclo de vida.
- **Eliminación de Canales Zombis y Desconexiones Cruzadas:** Al separar los identificadores de canal entre el modo TV y el Administrador DJ, desmontar un rol ya no anula ni interrumpe la recepción de eventos del otro.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Estricto Cumplimiento Clean-by-Design ($\le 120$ líneas):**
  - `client/src/hooks/useGuestRealtime.ts`: 63 líneas.
  - `client/src/hooks/useTvRealtime.ts`: 103 líneas.
  - `client/src/components/guest/GuestView.tsx`: 115 líneas.
  - `client/src/components/host/HostView.tsx`: 114 líneas.
- **Compilación Limpia:** 0 errores TypeScript (`tsc -b`) y empaquetado Vite exitoso.
- **Prueba Automatizada E2E Exitosa:** Verificada la entrega y refresco bidireccional concurrente entre Host y Guest en Node.js.

---

## [1.14.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Soporte de Búsqueda con Teclado Móvil (Enter / Flecha ➔) & Lupa Clickeable:**
  - **Envoltorio de Formulario Semántico (`<form onSubmit>`):** Tanto en `GuestSearchBar.tsx` como en `GuestReplaceSongModal.tsx`, el cajón de búsqueda ahora está contenido en un formulario nativo con captura de `onSubmit`.
  - **Atributos Nativos Móviles (`type="search"` y `enterKeyHint="search"`):** En teléfonos Android (Gboard, Samsung Keyboard) y iOS (Safari/Chrome), la tecla inferior derecha del teclado virtual se transforma automáticamente en acción de búsqueda explícita (ícono de lupa o flecha de acción ➔) que ejecuta la búsqueda al ser pulsada.
  - **Lupa Clickeable con Feedback:** El ícono de lupa del extremo izquierdo ahora es un botón interactivo clickeable (`<button type="submit">`) con hover esmeralda, permitiendo tocar la lupa directamente para buscar.
  - **Auto-Ocultamiento del Teclado Móvil (`blur()`):** Al enviar la búsqueda (vía Enter, flecha ➔ o botón lupa), el teclado virtual se oculta de inmediato para que el usuario pueda visualizar la lista completa de canciones sin obstrucción visual.

### 🐛 [CORRECCIÓN / FIX]
- **Auto-Restauración y Persistencia de Búsquedas Previas:**
  - **Solución al bug de resultados vacíos con artista ya tipeado:** Se resolvió la falla donde al regresar a la pestaña de búsqueda teniendo el nombre de un artista ya escrito, la lista inferior quedaba vacía y requería borrar y volver a escribir letras para disparar el evento `onChange`.
  - **Persistencia en `sessionStorage` (`guest_last_query`):** El término buscado se preserva en la sesión del navegador móvil del cliente.
  - **Restauración Reactiva Automática:** Si el usuario vuelve a la pestaña de búsqueda y el input contiene texto pero los resultados estaban vacíos, el sistema ejecuta la búsqueda de manera automática en segundo plano sin que el usuario tenga que tipear nada.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Estricto Cumplimiento Clean-by-Design ($\le 120$ líneas):**
  - `client/src/components/guest/GuestSearchBar.tsx`: 89 líneas.
  - `client/src/components/guest/GuestView.tsx`: 118 líneas.
  - `client/src/components/guest/GuestReplaceSongModal.tsx`: 89 líneas.
- **Compilación Limpia:** 0 errores TypeScript (`tsc -b`) y empaquetado de producción Vite exitoso.

---

## [1.13.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Promociones del Local en TV con Duración Programada & Expiración en Tiempo Real:**
  - **Selector de Tiempo en Consola Anfitrión (`HostBannersModal.tsx`):**
    - Nuevos controles rápidos por botones estilo pastilla para programar la vigencia de cada promoción:
      - `15 min`: Activa durante 15 minutos exactos desde su publicación.
      - `30 min`: Activa durante media hora.
      - `Fin hora`: Válida hasta que finalice la hora actual (ej. si se activa a las 21:14 hs, finaliza exactamente a las 22:00:00 hs).
      - `1 hora`: Activa durante 60 minutos.
      - `Siempre`: Anuncio permanente hasta ser desactivado manualmente por el anfitrión.
    - Cálculo dinámico de timestamp `expires_at` con visualización en vivo de la hora de vencimiento (`🕒 Expira: 22:00 hs`).
  - **Auto-Expiración y Desaparición Automática en TV (`TvPromoTicker.tsx` & `TvIdleScreen.tsx`):**
    - Timer ticker a nivel de segundo que evalúa la vigencia en tiempo real (`!b.expires_at || b.expires_at > now`).
    - Las promociones vencidas desaparecen suavemente de la pantalla del televisor sin necesidad de recargar la página ni de intervención manual del encargado del local.
    - Contador regresivo en vivo con badge de urgencia (`⏳ 14 min` o `⏳ 45s`) para incentivar el consumo rápido de la oferta en barra.

- **Efecto Visual Letrero Neón Fosforescente con Parpadeo Eléctrico (Prende y Apaga):**
  - **Animación Neón Intermitente Realista (`@keyframes neon-tube-blink` & `.animate-neon-tube` en `client/src/index.css`):**
    - Simula el encendido, zumbido y destello titilante característico de los letreros de gas neón de pubs y bares nocturnos ("letras fosforescentes que se prenden y apagan para captar la mirada").
  - **Tipografía y Brillo Fosforescente de Alto Impacto:**
    - `.neon-text-gold`: Dorado/ámbar eléctrico con capas de resplandor `text-shadow` fluorescente.
    - `.neon-text-emerald`: Verde lima/ácido fosforescente.
    - `.neon-text-purple`: Violeta/cian láser con halo brillante.
    - `.neon-text-ruby`: Fucsia/carmín brillante de neón.
    - Contenedores con borde reflectivo brillante y sombra ambiental difusa (`shadow-[0_0_25px_...]`).
  - **Ubicación Estratégica en TV:**
    - Emplazado directamente debajo del módulo de código QR y contador de reacciones (`TvFloatingQr.tsx`), en la columna lateral derecha del televisor, con interacción desvinculada del reproductor (`pointer-events-auto`) para no interferir con la letra ni el video.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Estándar Clean-by-Design Estricto ($\le 120$ líneas):**
  - `client/src/components/host/HostBannersModal.tsx`: 108 líneas.
  - `client/src/components/tv/TvPromoTicker.tsx`: 94 líneas.
  - `client/src/components/tv/TvIdleScreen.tsx`: 113 líneas.
  - `client/src/components/tv/TvView.tsx`: 119 líneas.
  - `client/src/types/index.ts`: 83 líneas.
- **Compilación Limpia:** 0 errores TypeScript (`tsc -b`) y empaquetado de producción Vite exitoso.

---

## [1.12.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Escalamiento Accesible de Tamaño de Letra para Cliente y Administrador (A / A+ / A++):**
  - **Selector Rápido en Cabecera (`GuestHeader.tsx` y `HostHeader.tsx`):** Nuevo botón con ícono tipográfico `Type` y badges visuales (`A`, `A+`, `A++`) que permite al usuario ciclar entre tres niveles de tamaño de letra:
    1. **Normal (A):** Tamaño estándar de la interfaz (100%).
    2. **Grande (A+):** Aumento del 15% al 20% en textos, botones, títulos, badges y cajón de búsqueda (`.font-scale-large`).
    3. **Extra Grande (A++):** Aumento del 30% al 40% en textos, botones, etiquetas e inputs para máxima legibilidad de personas mayores o con visión reducida (`.font-scale-xl`).
  - **Sobrescritura de Variables CSS en Tiempo Real (`client/src/index.css`):**
    - Escalamiento dinámico de variables `--text-xs`, `--text-sm`, `--text-base`, `--text-lg`, `--text-xl` en contenedores de aplicación.
    - Adaptación proporcional para cajón de búsqueda `input` y `placeholder`, chips de filtros, botones de pedido y etiquetas de estado.
  - **Persistencia en LocalStorage:** Las preferencias se guardan de forma independiente para el cliente (`guest_font_size`) y para el administrador (`host_font_size`).

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Clean-by-Design Estricto ($\le 120$ líneas):** Todos los componentes (`HostHeader.tsx`: 91 líneas, `HostView.tsx`: 115 líneas, `GuestHeader.tsx`: 112 líneas, `GuestView.tsx`: 120 líneas) cumplen rigurosamente el estándar.
- **Compilación de Producción:** 0 errores TypeScript (`tsc -b`) y build exitoso con Vite.

---

## [1.11.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Diseño Responsive Móvil de Consola Host & Botón Saltar Prominente:**
  - **Botón Primario Saltar en Barra de Transporte (`HostTransportBar.tsx`):** Se transformó el antiguo ícono de salto pequeño en un botón de acción destacado con gradiente rosa/carmín (`bg-gradient-to-r from-rose-600 to-pink-600`), texto legible `[⏭️ Saltar]`, sombra de impacto y efecto háptico visual (`active:scale-95`).
  - **Saltar en Tarjeta de Reproducción Actual (`HostNowPlayingCard.tsx`):** Botón `[Saltar]` resaltado con contraste vibrante en el header de la tarjeta y soporte en estado de reposo para activar la siguiente canción con un solo toque.
  - **Cabecera Host Responsive en 2 Niveles (`HostHeader.tsx`):** Reorganización de los 8 controles en dos niveles estructurados para eliminar el desbordamiento horizontal en pantallas estrechas (360px a 400px), asegurando que el botón `Reiniciar` y el nuevo selector de tema nunca queden cortados.
- **Tema Celeste / Azul Noche para Administrador y Clientes (`.theme-blue`):**
  - Paleta profunda de azul marino/océano (`#070e1e` / `#0d1a38`) con bordes y acentos en celeste cielo (`#38bdf8`), tipografía de alto contraste blanco hielo (`#f0f9ff`) y slate (`#7dd3fc`), especialmente pensada para boliches y bares con iluminación tenue sin cansar la vista ni encandilar.
  - Soporte completo y conmutador visual en `HostView.tsx`, `HostHeader.tsx`, `GuestView.tsx` y `GuestHeader.tsx`.
- **Búsqueda por Voz para Canción Semilla de Auto-DJ (`HostAutoDjModal.tsx`):**
  - Se integró el micrófono Web Speech API (`useSpeechToText`) en el campo "Canción Semilla" del modal de Auto-DJ. El anfitrión puede dictar por voz el artista o tema semilla (ej: *"Soda Stereo"*, *"Queen"*) con animación pulsante en tiempo real sin necesidad de tipear.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Cumplimiento Estricto Clean-by-Design ($\le 120$ líneas):** Todos los 7 componentes modificados (`HostHeader.tsx`, `HostTransportBar.tsx`, `HostNowPlayingCard.tsx`, `HostAutoDjModal.tsx`, `HostView.tsx`, `GuestHeader.tsx`, `GuestView.tsx`) respetan rigurosamente el estándar de 120 líneas.
- **Compilación Limpia:** 0 errores TypeScript (`tsc -b`) y build de producción exitoso con Vite.

---

## [1.10.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Selector de Temas Visuales para Clientes (Modo Claro, Modo Oscuro y Modo Neón):**
  - **☀️ Modo Claro (Luz / Café):** Fondo blanco/marfil suave (`#f8fafc`) con tarjetas blancas limpias y textos oscuros de alto contraste (`#0f172a`), diseñado para personas mayores, personas con visión cansada o locales iluminados.
  - **🌙 Modo Oscuro (Boliche / Noche):** Fondo oscuro con contrastes tenues para ambientes nocturnos.
  - **💜 Modo Neón (Fiesta / Púrpura):** Paleta moderna estilo rockola con acentos violeta y fucsia.
  - **Botón Rápido en Cabecera (`client/src/components/guest/GuestHeader.tsx`):** Alternador táctil con iconos (`Sun`, `Moon`, `Sparkles`) que cicla entre temas y persiste la elección en `localStorage`.
- **Búsqueda por Voz con Micrófono 🎙️ (`client/src/hooks/useSpeechToText.ts` y `GuestSearchBar.tsx`):**
  - Integración nativa con Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`).
  - Botón de micrófono táctil con animación pulsante y feedback en vivo (*"🎤 Escuchando... Di el tema"*).
  - Permite a clientes de cualquier edad buscar su música favorita hablando al teléfono sin necesidad de tipear en el teclado táctil pequeño.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Clean-by-Design Estricto ($\le 120$ líneas):** Todos los componentes y hooks involucrados (`GuestView.tsx`, `GuestHeader.tsx`, `GuestSearchBar.tsx`, `useSpeechToText.ts`) cumplen rigurosamente el límite de 120 líneas.
- **Compilación de Producción:** 0 errores TypeScript (`tsc -b`) y build exitoso en Vite 8.

---

## [1.9.0] - 2026-09-10

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Motor Auto-DJ Inteligente por Canción Semilla y Estaciones de Bar (Música Infinita de Fondo):**
  - **Estaciones Predefinidas de Bar (`client/src/services/autoDjService.ts`):** 6 estaciones curadas para ambientación comercial y nocturna (🎸 Rock Nacional, 🌴 Cumbia & Fiesta, ⚡ Hits 80s/90s, 🍹 Chill & Lounge, 🎺 Cuarteto & Fiesta, 🎤 Karaoke Éxitos).
  - **Modo Canción / Artista Semilla (`seed:...`):** Permite al administrador definir un tema o artista de partida (ej: *"Soda Stereo"*, *"Queen"*, *"Calamaro"*) delegando a YouTube la selección de canciones oficiales del mismo género o relacionadas.
  - **Filtro Estricto de Duración:** Descarte automático de videos fuera del rango de 2.5 min (140s) a 6.5 min (390s) para filtrar podcasts de 2 horas o clips cortos.
  - **Memoria Anti-Repetición:** Buffer en memoria de sesión que evita repetir temas durante la jornada.
  - **Prioridad Inmediata a Invitados:** En `addSongToQueue`, si un invitado pide un tema real, se purgan los temas de fondo encolados de Auto-DJ y la canción del invitado pasa a la posición #1 inmediatamente.
  - **Modal de Configuración Host (`client/src/components/host/HostAutoDjModal.tsx`):** Selector táctil con interruptor On/Off, parrilla de estaciones, campo de texto para canción semilla y sincronización por broadcast en tiempo real.
  - **Acceso Rápido en Consola DJ (`HostHeader.tsx` y `HostEmptyQueueCard.tsx`):** Botón con disco giratorio en cabecera e indicador en la tarjeta de cola vacía con acceso directo para cambiar de estación.
  - **HUD y Ticker en Pantalla TV (`TvNowPlayingHUD.tsx` y `TvNextQueueTicker.tsx`):** Identificación visual de temas de ambientación automática (`Ambiente: Auto-DJ`) y badge sutil en el cintillo de próximos temas.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Clean-by-Design Estricto ($\le 120$ líneas):** Todos los 12 archivos nuevos y modificados (`autoDjService.ts`, `useTvAutoDj.ts`, `useTvRealtime.ts`, `TvView.tsx`, `HostAutoDjModal.tsx`, `HostHeader.tsx`, `HostView.tsx`, etc.) cumplen rigurosamente la regla de 120 líneas.
- **Sincronización Realtime Instantánea:** Sincronización en vivo mediante canales de broadcast `set_auto_dj` y captura de eventos PostgreSQL en `karaoke_rooms`.
- **Compilación Limpia:** 0 errores TypeScript (`tsc -b`) y build exitoso con Vite 8.

---

## [1.8.0] - 2026-09-09

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Sistema Multi-Ambientes para Locales (Master Venue Hub):**
  - **Progressive Disclosure (Anti-Saturación):** Los dueños con un solo ambiente disfrutan de una interfaz minimalista y limpia sin sobrecarga visual. La barra de ambientes (`HostMultiRoomBar`) se activa de forma totalmente automática y fluida únicamente cuando el local cuenta con dos o más salas configuradas (`client/src/components/host/multiroom/HostMultiRoomBar.tsx`).
  - **Panel de Control Centralizado del Dueño (`client/src/components/host/multiroom/HostMasterHubModal.tsx`):**
    1. *Ambientes y Estado Operativo:* Gestión individual de estado por sala (`Abierto` 🟢, `Pausado` 🟡, `Cerrado` 🔴). Al cerrar un sector (ej: Terraza exterior), la pantalla TV informa el cese de actividad de forma amigable (`TvIdleScreen.tsx`).
    2. *Traspaso Atómico de Colas (`client/src/components/host/multiroom/HostTransferQueueModal.tsx`):* Permite migrar en bloque las canciones pendientes de un ambiente que cierra hacia otra sala activa (ej: Terraza -> Salón Principal), recalculando la prioridad para agregarlas de manera ordenada al final de la cola destino.
    3. *Identidad Sonora por Sector:* Configuración de géneros permitidos por sala (ej: Terraza acústica vs Salón bailable).
    4. *Precios VIP Diferenciados:* Configuración de tarifa personalizada en ARS por sala (ej: Terraza $800 vs Salón Principal $500).
    5. *Fiesta Unificada / Sincronización Global:* Control broadcast para replicar reproducción simultánea en todas las pantallas del local.
    6. *PIN Staff Delegado:* Clave de 4 dígitos independiente por sala para el personal asignado a cada sector.
- **Creación de Nuevos Sectores (`client/src/components/host/multiroom/HostCreateRoomModal.tsx`):**
  - Formulario intuitivo con validación de código de sala (3 a 8 caracteres alfanuméricos) y PIN de 4 dígitos.
- **Suite de Pruebas Automatizadas de Traspaso de Colas (`server/testMultiRoomTransfer.js`):**
  - Validación completa con inserción de ambiente secundario, encolado de temas, migración y verificación atómica de recepción en la sala principal.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Arquitectura Clean-by-Design Estricta ($\le 120$ líneas):**
  - Descomposición modular de modales en `HostModals.tsx` (53 líneas), `HostMasterHubModal.tsx` (115 líneas), `HostCreateRoomModal.tsx` (84 líneas), `HostTransferQueueModal.tsx` (79 líneas) y `HostMultiRoomBar.tsx` (64 líneas).
- **Compatibilidad Resiliente de Base de Datos:**
  - Fallback transparente en el cliente (`client/src/services/karaokeApi.ts`) para operar sin interrupciones tanto antes como después de ejecutar la migración SQL `06_multiroom_management.sql`.
- **Compilación Limpia:** 0 errores TypeScript (`tsc -b`) y bundle optimizado con Vite 8.

---

## [1.7.0] - 2026-09-09

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Pase VIP con Mercado Pago ($500 ARS):**
  - Integración de cobranza express por transferencia al alias `david.taboa` con copia con un solo toque y deep link directo `mercadopago://` hacia la app de transferencias de Mercado Pago (`client/src/components/guest/GuestMercadoPagoModal.tsx`).
  - Límite estricto de máximo 3 canciones VIP consecutivas por dispositivo para salvaguardar el orden y la justicia social en la fiesta.
- **Identificación Antifraude por Dispositivo (`client/src/utils/deviceId.ts`):**
  - Generación y persistencia de `deviceId` único (UUID v4) en `localStorage` para identificar teléfonos de invitados sin vulnerar el sandbox de privacidad W3C (evitando acceso indebido a IMEI/MAC).
  - Algoritmo de control de turnos VIP que valida el historial del dispositivo en cola antes de habilitar el Fast-Pass.
- **Extensión de Dedicatorias en Pantalla a 40 Segundos (`client/src/components/tv/TvDedicationBanner.tsx`):**
  - El temporizador del banner en TV se extendió de 12 a 40 segundos para permitir que todo el local aprecie las dedicatorias y saludos especiales.
- **Reacciones y Emojis en Vivo Estilo TikTok/Twitch Live:**
  - **Barra de Reacciones para Invitados (`client/src/components/guest/GuestLiveReactionsBar.tsx`):** Disparo de aplausos 👏, fuegos 🔥, corazones ❤️ y brindis 🍻 con animación táctil y cooldown anti-spam.
  - **Partículas Flotantes en Pantalla TV (`client/src/components/tv/TvFloatingReactions.tsx`):** Los emojis ascienden flotando por el margen derecho de la TV sobre cualquier video o pantalla de espera vía canales de difusión en tiempo real de Supabase (`room_reactions_[code]`).
  - **Animación CSS dedicada (`client/src/index.css`):** Keyframes `@keyframes float-reaction` con desplazamiento vertical, desvanecimiento y balanceo lateral.
- **Control de Horario / "Última Ronda" de Pedidos:**
  - Botón de bloqueo rápido de cola en la Consola DJ (`client/src/components/host/HostHeader.tsx` y `HostView.tsx`).
  - Alerta visual en la vista de búsqueda del invitado informando que la rockola cerró pedidos para culminar a horario (`GuestView.tsx`).
- **Modo Auto-DJ Ambiente de Respaldo:**
  - Selector en la configuración del local (`client/src/components/host/HostSettingsModal.tsx`) para activar música ambiental cuando no hay temas solicitados.
  - Indicador animado en la pantalla de espera de la TV (`TvIdleScreen.tsx`), cortando al instante en cuanto un invitado pide una canción.
- **Votación Comunitaria y Likes en Cola (`client/src/components/guest/GuestPartyQueue.tsx`):**
  - Botón interactivo de Me Gusta con corazón y contador en tiempo real para temas en cola.
  - Condecoración automática **"🔥 Más Esperado"** para la canción con mayor cantidad de votos comunitarios.
- **Migración DDL 05 (`supabase/migrations/05_rockola_features.sql`):**
  - Columnas `is_queue_locked`, `auto_dj_enabled`, `auto_dj_genre`, `promo_banners`, `likes_count`, `liked_by` y función RPC transaccional `fn_toggle_song_like`.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Estándar Clean-by-Design Estricto ($\le 120$ líneas):** Todos los componentes del cliente (`GuestView.tsx`, `GuestModals.tsx`, `GuestReplaceSongModal.tsx`, `HostSettingsModal.tsx`, `GuestPartyQueue.tsx`, etc.) se verificaron y mantuvieron rigurosamente dentro del límite de 120 líneas.
- **Compilación de Producción:** Vite 8 y TypeScript estricto ejecutaron con 0 errores y 0 advertencias de tipo.

---

## [1.6.0] - 2026-09-09

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Dedicatorias en Pantalla con Filtro Anti-Ofensivo en Tiempo Real:**
  - **Filtro Estricto de Contenido Ofensivo (`client/src/utils/profanityFilter.ts`):** Motor de filtrado que analiza insultos, groserías y frases ofensivas en español (regionalismos de Sudamérica/España/México) e inglés, con normalización fonética y de caracteres leetspeak (`p@t0`, `m1erd@`, etc.). Límite máximo de 70 caracteres con feedback visual en vivo antes de enviar.
  - **Modal de Confirmación de Pedido (`client/src/components/guest/GuestSongConfirmModal.tsx`):** Al tocar un resultado de búsqueda en YouTube, el invitado puede escribir una dedicatoria opcional (ej: *"¡Feliz cumple Sofía! Mesa 4 🎂"*) y seleccionar su tipo de pase.
  - **Banner Neon Glassmorphism en TV (`client/src/components/tv/TvDedicationBanner.tsx`):** La TV proyecta un banner elegante y translúcido en la parte superior con el mensaje de dedicatoria durante los primeros 12 segundos de la canción con animación fluida.
  - **Suite de Pruebas Automatizadas (`server/testProfanityFilter.js`):** 12 casos de prueba unitarios validando frases legítimas aprobadas y bloqueo certero de insultos y textos excesivos.

- **Banners de Promociones del Local en la Pantalla TV:**
  - **Gestor de Promociones en Consola DJ (`client/src/components/host/HostBannersModal.tsx`):** El dueño del local puede crear y administrar hasta 4 promociones activas simultáneas con título, descripción y paleta cromática neon (oro, esmeralda, púrpura, rubí).
  - **Botón Directo en Cabecera (`client/src/components/host/HostHeader.tsx`):** Acceso con 1 toque al panel de promociones desde el celular del dueño.
  - **Ticker Sutil de Promociones en Reproducción (`client/src/components/tv/TvPromoTicker.tsx`):** Durante la música, la TV muestra un cintillo discreto y estilizado en la esquina inferior cada 75 segundos, sin tapar letras de karaoke ni controles.
  - **Carrusel de Ofertas en Pantalla Inactiva (`client/src/components/tv/TvIdleScreen.tsx`):** Cuando la cola está vacía, las promociones rotan bajo el código QR central invitando al consumo en la barra.

- **Pase VIP ("Fast Pass / Tocar Siguiente"):**
  - **Priorización Automática en Cola (`client/src/services/karaokeApi.ts`):** Los temas pedidos con Pase VIP se ubican automáticamente en la posición #1 (siguiente a tocar) o tras pases VIP preexistentes (máximo 2 VIPs consecutivos), desplazando ordenadamente los turnos normales sin romper su secuencia relativa.
  - **Insignia Distintiva `VIP ⚡`:** Visualización dorada de alto impacto en la Consola DJ (`HostQueueItem.tsx`), la fila personal del invitado (`GuestMyQueue.tsx`) y la cola general de la fiesta (`GuestPartyQueue.tsx`).
  - **Test E2E Automatizado (`server/testVipAndDedication.js`):** Verificación integral contra Supabase de inserción VIP, desplazamiento atómico de cola y persistencia de metadatos.

- **Codificación y Desacoplamiento Resiliente (`client/src/utils/songMeta.ts`):**
  - Mapeo y codificación de metadatos (`dedication`, `isVip`) en el hash de thumbnail de YouTube (`#d=...&vip=1`), permitiendo despliegue productivo inmediato con 100% de compatibilidad con esquemas existentes.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- **Estándar Clean-by-Design ($\le 120$ líneas):** Todos los 15 archivos nuevos y modificados se mantuvieron de forma estricta por debajo de 120 líneas de código fuente.
- **Compilación de Producción:** Vite 8 y TypeScript en modo estricto compilaron con 0 errores (`tsc -b && vite build`).

---

## [1.5.0] - 2026-09-09

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Control Táctil con el Dedo (Touch Gesture Reordering) en Dispositivos Móviles:**
  - **Reordenamiento con el Dedo para Invitados (`client/src/components/guest/GuestMyQueue.tsx`):** Implementación de gestos táctiles nativos de pantalla táctil (`onTouchStart`, `onTouchMove`, `onTouchEnd`) sobre el control de agarre `GripVertical` con la propiedad CSS `touch-none` (evita que el navegador del teléfono intercepte el gesto como scroll vertical).
  - **Botones Táctiles de 1 Toque (`ArrowUp` / `ArrowDown`):** Permite a los invitados subir o bajar el orden de sus temas en la cola con un solo toque con el dedo.
  - **Toque Directo para Sustituir Canción:** Tocar cualquier parte de la tarjeta o el botón verde "Cambiar" abre el modal de sustitución de YouTube para cambiar de canción manteniendo intacto el turno en la cola.
  - **Reordenamiento Táctil en Consola de Anfitrión / DJ Móvil (`client/src/components/host/HostQueueItem.tsx`):** Añadido soporte de arrastre con el dedo sobre el control `GripVertical` (`touch-none`) para que el anfitrión pueda mover temas hacia arriba o abajo en la cola completa simplemente deslizando su dedo por la pantalla de su teléfono.

### 🐛 [CORRECCIÓN / FIX]
- **Solución Definitiva al Bloqueo de Reordenamiento tras 3 Swaps Rápidos:**
  - **Detección Causa Raíz:** Al intercambiar canciones rápidamente con el dedo o toques continuos, múltiples peticiones concurrentes leían el estado intermedio de la base de datos, provocando que ambas canciones terminaran con el mismo número de turno (`priority_order: 1` o `2`), bloqueando cualquier swap posterior.
  - **Semáforo de Exclusión Mutua en Vuelo (`isSwappingInFlight` e `isSwappingRef`):** Bloquea llamadas simultáneas hasta que el intercambio actual y la actualización de estado concluyan.
  - **Desacoplamiento Atómico con Offset Temporal (`tempOffset = 900000 + rand`):** Elimina cualquier ventana de tiempo donde dos canciones compartan temporalmente la misma posición.
  - **Auto-Reparación de Colisiones (Self-Healing):** Si el sistema detecta que dos temas tienen idéntica prioridad, recompacta automáticamente los ordinales de la sala (1, 2, 3...) antes de ejecutar el swap.
  - **Control de Gesto Único (`touchDoneRef`):** Un deslizamiento con el dedo ejecuta un solo intercambio hasta soltar la pantalla, y desactiva temporalmente las flechas para evitar saturación.

---

## [1.4.0] - 2026-09-09

### 🚀 [ESPECIFICACIÓN / FEATURE]
- **Rebranding Oficial a "Rockola Digital Live":**
  - Actualización de identidad de marca en `client/index.html`, pantalla central de TV (`TvIdleScreen.tsx`), QR flotante (`TvFloatingQr.tsx`) y cabecera de invitados (`GuestHeader.tsx`).
  - Admisión completa de catálogo YouTube libre (videoclips oficiales, recitales en vivo y karaoke instrumental).
- **Poderes de Cola para Invitados (Rockola Turn Management):**
  - **Reemplazo de Canción Sin Perder Turno (`client/src/components/guest/GuestReplaceSongModal.tsx`):** Permite al invitado buscar en YouTube y sustituir una canción en espera por otra, conservando de forma estricta su turno ordinal (`priority_order`) en la fila sin retrasar su turno.
  - **Intercambio de Orden Propio (Swap de Temas Propios):** Cuando un usuario tiene $\ge 2$ canciones en cola, puede invertir o intercambiar el orden entre sus propios turnos mediante `swapGuestSongs` en `GuestMyQueue.tsx`. Las canciones de otros invitados situadas en medio de sus pedidos quedan 100% intactas y preservadas.
  - **Cancelación Directa y Recompactación:** Posibilidad de quitar temas propios con modal accesible y liberación de turno.
- **Multi-Tenancy y Autenticación Google para Dueños de Locales:**
  - Acceso para administradores/dueños vía Google OAuth (`client/src/components/host/HostAuth.tsx`).
  - Modal de Configuración del Local (`client/src/components/host/HostSettingsModal.tsx`): administración del nombre del local/bar (`business_name`) y actualización del PIN numérico de 4 dígitos para el personal de barra y DJs.
  - Trazabilidad en base de datos: las salas quedan vinculadas a su dueño con `owner_id` y `owner_email`.
  - Migración DDL `supabase/migrations/03_rockola_multitenant_and_swaps.sql` con columnas multi-tenant y procedimientos `fn_replace_guest_song` y `fn_swap_guest_songs`.
  - Script de prueba automatizado `server/testRockolaSwaps.js` validando reemplazo y swaps intercalados con 100% de éxito.
- **Compuerta de Aprobación Obligatoria por el Super Administrador:**
  - Control de acceso estricto: todo nuevo establecimiento/dueño inicia con `is_approved = false` y permanece bloqueado hasta recibir la aprobación directa del Super Administrador (tú).
  - Pantalla bloqueada con estado en tiempo real (`client/src/components/host/HostPendingApprovalView.tsx`): informa al dueño que su cuenta está en revisión y se desbloquea de manera instantánea vía WebSockets en cuanto es aprobada.
  - Panel exclusivo de Super Administrador (`client/src/components/host/SuperAdminApprovalModal.tsx`): permite al creador listar todos los locales registrados y autorizarlos o suspenderlos con 1 toque desde su propio dispositivo.
  - Migración DDL `supabase/migrations/04_owner_approval_system.sql` con columnas `is_approved`, `approved_at`, `approved_by` y procedimiento `fn_approve_room`.

### 🔧 [AFINAMIENTO / REFINAMIENTO]
- Regla Clean-by-Design rigurosamente mantenida: todos los nuevos componentes (`GuestReplaceSongModal.tsx`, `HostSettingsModal.tsx`) y vistas actualizadas (`GuestView.tsx`, `HostView.tsx`, `GuestMyQueue.tsx`, `HostAuth.tsx`) se mantuvieron estrictamente por debajo del límite de 120 líneas.
- Compilación de producción limpia (`tsc -b && vite build`) con código de salida 0.

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
### 🐛 [CORRECCIÓN / FIX]
- **Ajuste Móvil y Miniaturas de Video:**
  - Corrección de la propiedad `thumbnailUrl` en la Serverless Function de Vercel (`client/api/search.js`) y en `searchService.js` para que las miniaturas de YouTube se proyecten correctamente en la tarjeta.
  - Inclusión de texto explícito *"Pedir"* en el botón verde con ícono `+` (`GuestSearchResultCard.tsx`) para eliminar ambigüedades visuales.
  - Corrección del desbordamiento horizontal en pantallas móviles estrechas: ajuste de anchos fluidos (`w-full min-w-0`), reducción de padding lateral y ancho responsivo de miniatura.
  - Habilitación del escalado de pantalla en `index.html` retirando `user-scalable=no` del meta viewport para permitir pellizcar/reducir la pantalla libremente.
  - Ocultamiento de la barra flotante de desarrollo (`Modo TV | Host DJ | Invitado`) en la vista de invitados (`App.tsx`) para que no se superponga sobre el encabezado con el nombre y sala del usuario.

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
