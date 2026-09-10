# Registro de Cambios y Trazabilidad (CHANGELOG)

Todas las modificaciones, nuevas especificaciones, afinamientos y correcciones del proyecto se registran formalmente en este documento.

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
