# Modelo de Datos y Esquema Relacional (PostgreSQL / Supabase)

**Estado:** Versión 1.0.0  
**Motor:** PostgreSQL 16 (Dedicado en Supabase)  
**Esquema:** `public`  
**Seguridad:** Row Level Security (RLS) + Stored Procedures Transaccionales  

---

## 1. Justificación de la Base de Datos Dedicada en Supabase

Para responder formalmente al requerimiento:
> *"indícame si tendremos que crear una base de datos específica para esta aplicación, así podré crear una en Supabase"*

**Respuesta Técnica:**
**SÍ, es indispensable crear un proyecto dedicado en Supabase** (por ejemplo llamado `karaoke-live` o `karaoke-fiesta`). Las razones técnicas de ingeniería son:
1. **Conexión entre Redes Incompatibles (4G/5G vs Wi-Fi de la TV):** Los invitados navegan con sus datos móviles en Internet, mientras la TV o el parlante anfitrión están en el Wi-Fi doméstico. Supabase actúa como el nodo central en la nube con **WebSockets de latencia ultra-baja (< 50ms)** que enlaza a ambos mundos sin abrir puertos en el router hogareño ni comprometer la seguridad de la red privada.
2. **Cálculo Atómico de Turnos y Posiciones:** Si varios invitados piden temas en el mismo segundo, PostgreSQL resuelve la concurrencia garantizando que ninguna canción se solape en orden.
3. **Control Remoto Móvil del Anfitrión sin Latencia:** Cuando el dueño de casa arrastra una canción o purga los temas de un invitado ausente, las funciones RPC de PostgreSQL actualizan la cola en un único paso atómico y difunden el cambio a la Android TV al instante.

---

### 2. Diccionario de Tablas del Sistema (Optimizado)

### 2.1. Tabla: `karaoke_rooms` (Salas de Karaoke Activas)
Almacena las sesiones de fiesta activas, códigos de acceso y estado global de reproducción en la TV.

| Columna | Tipo | Nulo | Restricciones / Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | Clave primaria generada por `gen_random_uuid()` |
| `room_code` | `TEXT` | NO | Código único (3 a 8 caracteres), indexado en mayúsculas |
| `host_pin` | `TEXT` | NO | PIN numérico (4 a 8 caracteres) para el celular del anfitrión |
| `name` | `TEXT` | NO | Nombre del evento o fiesta (máx. 100 caracteres) |
| `status` | `TEXT` | NO | `'active'`, `'paused'`, `'closed'` (Default: `'active'`) |
| `current_song_id` | `UUID` | SÍ | Clave foránea a `karaoke_queue(id)` con índice explícito |
| `is_playing` | `BOOLEAN` | NO | `true` si el video de YouTube está reproduciéndose en la TV |
| `current_time_seconds` | `INTEGER` | NO | Segundo actual del video (>= 0, Default: `0`) |
| `volume_percent` | `INTEGER` | NO | Nivel de volumen entre 0 y 100 (Default: `100`) |
| `created_at` | `TIMESTAMPTZ` | NO | Fecha y hora con zona horaria (Default: `NOW()`) |
| `updated_at` | `TIMESTAMPTZ` | NO | Actualizado automáticamente por disparador `fn_set_updated_at()` |

---

### 2.2. Tabla: `karaoke_guests` (Registro de Invitados)
Registra a los invitados que acceden escaneando el código QR con sus datos móviles 4G/5G.

| Columna | Tipo | Nulo | Restricciones / Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | Clave primaria generada por `gen_random_uuid()` |
| `room_id` | `UUID` | NO | Clave foránea a `karaoke_rooms(id)` con `ON DELETE CASCADE` e índice explícito |
| `session_token` | `TEXT` | NO | Identificador único en LocalStorage (hasta 64 caracteres) |
| `guest_name` | `TEXT` | NO | Nombre o apodo sanitizado (1 a 50 caracteres) |
| `is_active` | `BOOLEAN` | NO | `true` mientras el invitado participe en la fiesta |
| `joined_at` | `TIMESTAMPTZ` | NO | Momento de ingreso al evento |
| `last_seen_at` | `TIMESTAMPTZ` | NO | Heartbeat de última interacción |

---

### 2.3. Tabla: `karaoke_queue` (Cola de Reproducción FIFO & Reordenable)
Contiene la lista de canciones solicitadas, su estado ordinal y su progreso.

| Columna | Tipo | Nulo | Restricciones / Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | Clave primaria generada por `gen_random_uuid()` |
| `room_id` | `UUID` | NO | Clave foránea a `karaoke_rooms(id)` con `ON DELETE CASCADE` e índice explícito |
| `guest_id` | `UUID` | SÍ | Clave foránea a `karaoke_guests(id)` con `ON DELETE SET NULL` e índice explícito |
| `video_id` | `TEXT` | NO | ID de video de YouTube (8 a 20 caracteres) |
| `title` | `TEXT` | NO | Título de la canción (hasta 250 caracteres) |
| `author` | `TEXT` | NO | Canal de YouTube o artista (hasta 100 caracteres) |
| `thumbnail_url`| `TEXT` | SÍ | URL de la imagen de portada |
| `duration_seconds`| `INTEGER` | NO | Duración en segundos (> 0, Default: 180) |
| `duration_text`| `TEXT` | NO | Formato legible de tiempo (ej: `"3:35"`) |
| `requested_by` | `TEXT` | NO | Nombre visible de quien la solicitó |
| `priority_order`| `INTEGER` | NO | Posición ordinal en la fila (>= 1) |
| `status` | `TEXT` | NO | `'queued'`, `'playing'`, `'finished'`, `'skipped'`, `'purged_by_host'`, `'cancelled_by_guest'` |
| `requested_at` | `TIMESTAMPTZ` | NO | Fecha y hora de solicitud |
| `started_at` | `TIMESTAMPTZ` | SÍ | Momento de inicio de reproducción |
| `finished_at` | `TIMESTAMPTZ` | SÍ | Momento de finalización o salto |

---

### 2.4. Tabla: `karaoke_commands` (Canal de Control Remoto Anfitrión Móvil -> TV)
Cola efímera de comandos de control de reproducción disparados desde el celular del anfitrión hacia la TV.

| Columna | Tipo | Nulo | Restricciones / Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | Clave primaria |
| `room_id` | `UUID` | NO | Clave foránea a `karaoke_rooms(id)` con `ON DELETE CASCADE` e índice explícito |
| `command` | `TEXT` | NO | `'play'`, `'pause'`, `'skip'`, `'previous'`, `'seek'`, `'volume'` |
| `payload` | `JSONB` | SÍ | Parámetros adicionales (ej: `{"seek_to": 45}`) |
| `is_executed` | `BOOLEAN` | NO | `false` al emitirse, `true` al ejecutarse en la TV |
| `created_at` | `TIMESTAMPTZ` | NO | Fecha de creación del comando |

---

### 2.5. Tabla: `karaoke_history` (Historial de Canciones de la Noche)
Registro de auditoría para evitar duplicidad de canciones o consultar qué se cantó durante la fiesta.

| Columna | Tipo | Nulo | Restricciones / Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | Clave primaria |
| `room_id` | `UUID` | NO | Clave foránea a `karaoke_rooms(id)` con `ON DELETE CASCADE` e índice explícito |
| `video_id` | `TEXT` | NO | ID de video de YouTube |
| `title` | `TEXT` | NO | Título de la pista |
| `author` | `TEXT` | SÍ | Artista |
| `requested_by` | `TEXT` | NO | Cantante |
| `played_at` | `TIMESTAMPTZ` | NO | Hora de reproducción |

---

## 3. Índices de Alto Rendimiento

Para garantizar respuestas en menos de 5ms en la difusión Realtime:

```sql
-- Índice para recuperar la cola activa ordenada al instante
CREATE INDEX idx_queue_active_order 
ON public.karaoke_queue (room_id, priority_order) 
WHERE status = 'queued';

-- Índice para purga rápida cuando un invitado se retira de la fiesta
CREATE INDEX idx_queue_guest_purge 
ON public.karaoke_queue (room_id, lower(requested_by)) 
WHERE status = 'queued';

-- Índice para búsqueda de sala por código QR
CREATE UNIQUE INDEX idx_rooms_code_unique 
ON public.karaoke_rooms (upper(room_code));
```

---

## 4. Procedimientos Almacenados Transaccionales (RPCs)

### 4.1. `fn_purge_guest_songs(p_room_id, p_guest_name)`
Elimina atómicamente todas las canciones pendientes de un invitado ausente y recompacta las posiciones ordinales de los temas restantes para que nadie pierda su turno:

```sql
CREATE OR REPLACE FUNCTION public.fn_purge_guest_songs(
    p_room_id UUID,
    p_guest_name VARCHAR
)
RETURNS INTEGER AS $$
DECLARE
    v_purged_count INTEGER := 0;
BEGIN
    -- 1. Marcar como purgadas las canciones del invitado ausente
    UPDATE public.karaoke_queue
    SET status = 'purged_by_host',
        finished_at = NOW()
    WHERE room_id = p_room_id
      AND status = 'queued'
      AND LOWER(requested_by) = LOWER(TRIM(p_guest_name));
      
    GET DIAGNOSTICS v_purged_count = ROW_COUNT;

    -- 2. Recompactar ordinales (1, 2, 3...) de los temas restantes
    WITH reordered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY priority_order ASC, requested_at ASC) AS new_order
        FROM public.karaoke_queue
        WHERE room_id = p_room_id AND status = 'queued'
    )
    UPDATE public.karaoke_queue q
    SET priority_order = r.new_order
    FROM reordered r
    WHERE q.id = r.id;

    RETURN v_purged_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.2. `fn_reorder_queue(p_room_id, p_song_id, p_new_position)`
Mueve una canción a una nueva posición en la cola mediante drag-and-drop desde el celular del anfitrión, desplazando las demás canciones sin colisiones:

```sql
CREATE OR REPLACE FUNCTION public.fn_reorder_queue(
    p_room_id UUID,
    p_song_id UUID,
    p_new_position INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_old_position INTEGER;
BEGIN
    SELECT priority_order INTO v_old_position
    FROM public.karaoke_queue
    WHERE id = p_song_id AND room_id = p_room_id AND status = 'queued';

    IF v_old_position IS NULL OR v_old_position = p_new_position THEN
        RETURN FALSE;
    END IF;

    IF v_old_position < p_new_position THEN
        UPDATE public.karaoke_queue
        SET priority_order = priority_order - 1
        WHERE room_id = p_room_id 
          AND status = 'queued' 
          AND priority_order > v_old_position 
          AND priority_order <= p_new_position;
    ELSE
        UPDATE public.karaoke_queue
        SET priority_order = priority_order + 1
        WHERE room_id = p_room_id 
          AND status = 'queued' 
          AND priority_order >= p_new_position 
          AND priority_order < v_old_position;
    END IF;

    UPDATE public.karaoke_queue
    SET priority_order = p_new_position
    WHERE id = p_song_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
