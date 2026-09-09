# Diagramas de Arquitectura e Interacción del Sistema de Karaoke

**Estado:** Versión 1.0.0 (Living Architecture Diagrams)  
**Formato:** Mermaid UML / C4 Model  
**Audiencia:** Ingenieros de Software, Arquitectos de Soluciones y Desarrolladores  

---

## 1. Diagrama C4 de Contexto del Sistema

```mermaid
C4Context
    title Diagrama de Contexto del Sistema - Karaoke Colaborativo en Tiempo Real

    Person(host, "Anfitrión / DJ de la Fiesta", "Controla la fiesta desde su celular: reordena canciones, salta temas y expulsa canciones de invitados ausentes.")
    Person(guest, "Invitado a la Fiesta", "Usa su plan de datos 4G/5G en su celular para escanear el QR, buscar música en YouTube y ver su turno.")

    System_Boundary(karaoke_sys, "Plataforma de Karaoke Colaborativo") {
        System(tv_node, "Nodo Reproductor (Android TV / Celular Host)", "Toca los videos de YouTube sin anuncios, sonido directo al equipo de música o TV, y proyecta el QR.")
        System(host_mobile, "Nodo Control Remoto DJ (Celular Anfitrión)", "Consola táctil rápida para reordenar la cola y gestionar la fiesta sin tocar la TV.")
        System(guest_pwa, "Nodo Invitados (Web App Móvil 4G/5G)", "Buscador de canciones, visualización de cola y cálculo de turnos personales.")
        System(cloud_backend, "Núcleo en la Nube (Supabase Realtime + API)", "Canal central que conecta dispositivos en 4G/5G con la TV en Wi-Fi con latencia < 50ms.")
    }

    System_Ext(youtube_cdn, "YouTube CDN & Stream", "Servicio externo de contenidos multimedia y pistas de karaoke.")

    Rel(guest, guest_pwa, "Accede escaneando QR con su plan de datos 4G/5G", "HTTPS")
    Rel(host, host_mobile, "Gestiona el orden de la música con interfaz táctil", "HTTPS / WSS")
    Rel(guest_pwa, cloud_backend, "Envía solicitudes de canciones", "JSON / Supabase Realtime")
    Rel(host_mobile, cloud_backend, "Envía comandos de reordenamiento y purga", "RPC / Supabase Realtime")
    Rel(cloud_backend, tv_node, "Sincroniza cola y transmite comandos remotos", "WebSockets / WSS")
    Rel(tv_node, youtube_cdn, "Descarga y reproduce video/audio sin anuncios", "HTTPS")
```

---

## 2. Diagrama C4 de Contenedores de Software

```mermaid
C4Container
    title Diagrama de Contenedores de Software (v1.0.0)

    Person(guest, "Invitado (4G/5G)", "Escanea QR y pide temas")
    Person(host, "Anfitrión (Celular)", "Controla la TV desde el móvil")

    Container_Boundary(frontend_nodes, "Aplicaciones Cliente (React 19 + TypeScript + Tailwind)") {
        Container(tv_app, "Aplicación Pantalla Central / TV", "Android TV APK / Web", "Reproductor continuo YouTube sin anuncios, visualizador de QR de sala y receptor de comandos.")
        Container(dj_console, "Consola DJ Anfitrión", "Mobile Web / PWA", "Interfaz táctil de alta velocidad: Drag-and-drop de temas, purga por invitado ausente y botones de transporte.")
        Container(guest_app, "PWA de Invitados", "Mobile Web / PWA", "Buscador con debounce, tarjeta 'Mi Turno' (tiempo de espera) y vista sincronizada de cola.")
    }

    Container_Boundary(cloud_infra, "Infraestructura Cloud (Supabase)") {
        Container(realtime_engine, "Supabase Realtime Engine", "Elixir WebSockets", "Difusión instantánea de eventos de cola, estado de reproducción y comandos de control remoto.")
        Container(search_engine, "Motor de Búsqueda YouTube", "Edge Function / REST", "Buscador de videos optimizado con filtro karaoke sin cuotas de Google Cloud.")
        ContainerDb(database, "PostgreSQL 16", "Database", "Tablas: rooms, queue_items, guests, playback_commands, playback_history.")
    }

    Rel(guest, guest_app, "Usa en celular con 4G/5G", "HTTPS")
    Rel(host, dj_console, "Controla fiesta desde celular", "HTTPS")
    Rel(guest_app, search_engine, "Busca temas de karaoke", "HTTPS / JSON")
    Rel(guest_app, realtime_engine, "Agrega canciones a la cola", "WSS")
    Rel(dj_console, realtime_engine, "Envía reordenamiento y comandos DJ", "WSS")
    Rel(realtime_engine, database, "Persistencia atómica con RLS", "Postgres Wire")
    Rel(realtime_engine, tv_app, "Transmite cambios de cola y comandos de reproducción", "WSS")
```

---

## 3. Diagrama de Secuencia: Petición de Canción (Invitado 4G -> TV en Wi-Fi)

```mermaid
sequenceDiagram
    autonumber
    actor Invitado as Invitado (Celular 4G/5G)
    participant PWA as PWA Invitado
    participant Cloud as Supabase Realtime & DB
    participant TV as Android TV / Reproductor Central
    actor Anfitrion as Anfitrión (Celular DJ)

    Invitado->>PWA: Escanea QR de la TV y escribe su nombre ("Carlos")
    PWA->>Cloud: Registra invitado en sala (INSERT INTO guests)
    Invitado->>PWA: Busca "La Incondicional" (Filtro Karaoke Activo)
    PWA->>Cloud: GET /api/search?q=La+Incondicional+karaoke
    Cloud-->>PWA: Retorna lista de videos con carátula y duración
    Invitado->>PWA: Presiona "Pedir Canción"
    PWA->>Cloud: INSERT INTO queue_items (room_id, video_id, requested_by='Carlos')
    
    Note over Cloud: Transacción atómica: asigna posición en cola y calcula turno
    
    Cloud-->>PWA: Confirmación: "Puesto #4 (Espera aprox: 11 min)"
    par Difusión en Tiempo Real (< 50ms)
        Cloud->>TV: Evento REALTIME: 'queue_updated' (Nueva canción añadida)
        TV->>TV: Actualiza lista visual de próximas canciones
    and
        Cloud->>Anfitrion: Evento REALTIME: 'queue_updated'
        Anfitrion->>Anfitrion: Muestra tema de Carlos en consola DJ
    and
        Cloud->>PWA: Notifica a todos los invitados la nueva cola
    end
```

---

## 4. Diagrama de Secuencia: Control Remoto del Anfitrión desde el Celular

Este flujo resuelve el requerimiento de que **el anfitrión controle la TV desde su celular** (para no usar el incómodo control remoto físico de la TV) al momento de reordenar canciones o eliminar los temas de un invitado que se fue.

```mermaid
sequenceDiagram
    autonumber
    actor Host as Anfitrión (Celular)
    participant DJApp as Consola Móvil DJ
    participant Supabase as Supabase Cloud
    participant TV as Android TV (Reproductor)
    participant Guests as Celulares de Invitados (4G)

    Note over Host: El anfitrión nota que "Lucas" se fue de la fiesta
    Host->>DJApp: Abre panel "Gestión de Invitados"
    DJApp-->>Host: Muestra lista de personas con canciones pendientes (Lucas: 2 canciones)
    Host->>DJApp: Pulsa botón "🗑️ Quitar canciones de Lucas"
    DJApp->>DJApp: Muestra Modal accesible de confirmación
    Host->>DJApp: Confirma eliminación
    
    DJApp->>Supabase: RPC: purge_guest_songs(room_id, guest_name='Lucas')
    Note over Supabase: UPDATE queue_items SET status='purged_by_host' WHERE requested_by='Lucas'
    
    par Notificación Instantánea vía WebSockets
        Supabase->>TV: Evento 'queue_updated' (Canciones de Lucas removidas)
        TV->>TV: Actualiza ticker visual de próximas canciones
    and
        Supabase->>DJApp: Evento 'purge_success' (2 canciones eliminadas)
    and
        Supabase->>Guests: Evento 'queue_updated' (Recálculo de turnos para todos)
        Note over Guests: Los invitados que estaban detrás de Lucas avanzan 2 puestos automáticamente
    end

    Note over Host: Ahora el anfitrión quiere cambiar el orden (subir a María al puesto #1)
    Host->>DJApp: Arrastra la canción de María hacia arriba (Drag-and-Drop)
    DJApp->>Supabase: RPC: reorder_queue(room_id, song_id, new_position=1)
    Supabase->>TV: Evento 'queue_updated' (Nuevo orden en pantalla)
    Supabase->>Guests: Evento 'queue_updated' (María ve: "¡Eres la siguiente!")
```

---

## 5. Diagrama Entidad-Relación (ERD) Optimizado (Supabase Best Practices)

El esquema aplica las recomendaciones oficiales de `supabase-postgres-best-practices`:
- Tipos de datos estándar (`TEXT` con restricciones `CHECK` en lugar de `VARCHAR` arbitrarios).
- Marcas de tiempo conscientes de zona horaria (`TIMESTAMPTZ`).
- Índices explícitos obligatorios en todas las columnas con Claves Foráneas (FK) para evitar bloqueos de tabla y asegurar rendimiento en operaciones `ON DELETE CASCADE`.
- Disparador automático `updated_at` para auditoría temporal.
- Índices parciales sobre estados calientes (`WHERE status = 'queued'`).

```mermaid
erDiagram
    KARAOKE_ROOMS ||--o{ KARAOKE_QUEUE : "gestiona (ON DELETE CASCADE)"
    KARAOKE_ROOMS ||--o{ KARAOKE_GUESTS : "aloja (ON DELETE CASCADE)"
    KARAOKE_ROOMS ||--o{ KARAOKE_COMMANDS : "recibe (ON DELETE CASCADE)"
    KARAOKE_ROOMS ||--o{ KARAOKE_HISTORY : "registra (ON DELETE CASCADE)"
    KARAOKE_GUESTS ||--o{ KARAOKE_QUEUE : "solicita (ON DELETE SET NULL)"

    KARAOKE_ROOMS {
        uuid id PK "gen_random_uuid()"
        text room_code UK "3-8 chars, indexado UPPER"
        text host_pin "4-8 dígitos para control DJ"
        text name "Nombre de la sala"
        text status "'active' | 'paused' | 'closed'"
        uuid current_song_id FK "Indexado explícitamente"
        boolean is_playing "true si hay video en TV"
        integer current_time_seconds ">= 0"
        integer volume_percent "0..100"
        timestamptz created_at "Default NOW()"
        timestamptz updated_at "Trigger automático"
    }

    KARAOKE_GUESTS {
        uuid id PK "gen_random_uuid()"
        uuid room_id FK "Indexado idx_fk_guests_room_id"
        text session_token "Token local del navegador (hasta 64 chars)"
        text guest_name "1-50 chars, sanitizado anti-XSS"
        boolean is_active "true mientras esté en el evento"
        timestamptz joined_at "Default NOW()"
        timestamptz last_seen_at "Heartbeat"
    }

    KARAOKE_QUEUE {
        uuid id PK "gen_random_uuid()"
        uuid room_id FK "Indexado idx_fk_queue_room_id"
        uuid guest_id FK "Indexado idx_fk_queue_guest_id"
        text video_id "8-20 chars (ID YouTube)"
        text title "Hasta 250 chars"
        text author "Artista / Canal"
        text thumbnail_url "URL carátula"
        integer duration_seconds "Mayor a 0"
        text duration_text "Ej: 3:35"
        text requested_by "Nombre de quien pidió"
        integer priority_order "Ordinal correlativo >= 1"
        text status "queued | playing | finished | skipped | purged_by_host | cancelled_by_guest"
        timestamptz requested_at "Default NOW()"
        timestamptz started_at "Nullable"
        timestamptz finished_at "Nullable"
    }

    KARAOKE_COMMANDS {
        uuid id PK "gen_random_uuid()"
        uuid room_id FK "Indexado idx_fk_commands_room_id"
        text command "play | pause | skip | previous | seek | volume"
        jsonb payload "Parámetros adicionales"
        boolean is_executed "Indexado parcial (false)"
        timestamptz created_at "Default NOW()"
    }

    KARAOKE_HISTORY {
        uuid id PK "gen_random_uuid()"
        uuid room_id FK "Indexado idx_fk_history_room_id"
        text video_id "ID de video"
        text title "Título histórico"
        text author "Artista"
        text requested_by "Cantante"
        timestamptz played_at "Default NOW()"
    }
```

---

## 6. Diagrama de Estados de una Canción en Cola

```mermaid
stateDiagram-v2
    [*] --> queued: Invitado agrega canción desde 4G/5G
    
    queued --> playing: La TV avanza y comienza la reproducción
    queued --> queued: El Anfitrión la reordena (sube o baja prioridad)
    queued --> cancelled_by_guest: El invitado cancela su propio tema
    queued --> purged_by_host: El anfitrión purga temas del invitado ausente
    
    playing --> finished: El video concluye naturalmente en la TV
    playing --> skipped: El anfitrión presiona "Saltar Canción" desde el celular
    
    finished --> [*]
    skipped --> [*]
    cancelled_by_guest --> [*]
    purged_by_host --> [*]
```
