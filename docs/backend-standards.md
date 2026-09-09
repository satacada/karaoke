# Estándares de Backend, Seguridad y Tiempo Real (Backend Standards)

**Estado:** Versión 1.0.0  
**Stack de Nube:** Supabase (PostgreSQL 16 + Realtime Engine) & Node.js Edge Services  

---

## 1. Topología de Canales Realtime (Supabase WebSockets)

Para mantener la sincronización instantánea entre el **Nodo TV**, el **Control Remoto Móvil del Anfitrión** y los **Celulares de los Invitados (4G/5G)**, se implementa una arquitectura basada en Canales Multiplexados:

```
                          [ Canal: room:{ROOM_CODE} ]
                                       │
     ┌─────────────────────────────────┼─────────────────────────────────┐
     ▼                                 ▼                                 ▼
[ Evento: queue_updated ]     [ Evento: tv_command ]       [ Evento: player_tick ]
Notifica cambios en la cola   Transmite acciones DJ        Transmite segundo actual
(altas, bajas, reorden)       (play, pause, skip, seek)    del video en pantalla
```

### Protocolo de Mensajería:
1. **`queue_updated`**: Emitido automáticamente por PostgreSQL triggers o funciones RPC ante cualquier cambio en `karaoke_queue`. Carga útil: Lista completa de canciones en cola con orden ordinal y datos del tema en curso.
2. **`tv_command`**: Emitido por la Consola DJ del Anfitrión y consumido exclusivamente por el Nodo TV para ejecutar acciones físicas en el reproductor (pausar, saltar, ajustar volumen).
3. **`player_tick`**: Emitido por el Nodo TV cada 2 segundos con `{ current_time, duration, is_playing }` para mantener las barras de progreso de los celulares sincronizadas sin saturar el ancho de banda 4G.

---

## 2. Motor de Búsqueda de YouTube (Zero-Quota Engine)

Para evitar cuotas de pago o bloqueos de Google Cloud YouTube Data API v3:
- Se implementa un servicio backend optimizado que utiliza extractores de metadatos de YouTube (`yt-search` / endpoints públicos de Invidious).
- **Algoritmo de Priorización de Karaoke:**
  - Si el parámetro `karaoke=true` está presente, el motor evalúa si la consulta ya contiene palabras como *"karaoke"*, *"letra"*, *"lyrics"*, *"instrumental"* o *"pista"*.
  - Si no las contiene, añade automáticamente el sufijo `karaoke` al término de búsqueda.
- **Cache en Memoria:** Las consultas populares se almacenan en un mapa de caché durante 30 minutos para responder en menos de 10ms y ahorrar ancho de banda.
- **Formato Estándar de Respuesta:**
  ```json
  {
    "videoId": "abc123xyz",
    "title": "De Música Ligera (Karaoke con Letra)",
    "author": "Karaoke Hits",
    "thumbnail": "https://i.ytimg.com/vi/abc123xyz/hqdefault.jpg",
    "durationSeconds": 215,
    "durationText": "3:35"
  }
  ```

---

## 3. Políticas de Control de Fila y Anti-Spam (Fair Play Rules)

Para garantizar una fiesta divertida y equitativa:
1. **Límite de Canciones Activas por Invitado:**
   - Un mismo invitado no puede tener más de **3 canciones activas en la cola al mismo tiempo**.
   - Si intenta agregar una 4ta canción, el sistema responde con error amigable: *"Ya tienes 3 canciones en espera. Espera tu turno para pedir más"*.
2. **Rate Limiting de Búsqueda y Peticiones:**
   - Máximo 1 petición de canción cada 15 segundos por token de sesión.
   - Búsqueda con debounce obligatorio de 300ms en el cliente.

---

## 4. Seguridad y Aislamiento de Anfitrión

1. **Autenticación del Anfitrión por PIN:**
   - La sala se crea con un `host_pin` de 4 a 6 dígitos (por defecto `1234` o configurable).
   - Para emitir comandos de control remoto (`skip`, `reorder`, `purge`), el celular del anfitrión debe enviar el encabezado `x-host-pin`.
   - Las funciones RPC de PostgreSQL verifican el PIN antes de alterar el orden o eliminar registros.
2. **Políticas de Row Level Security (RLS) en PostgreSQL:**
   - Las lecturas de cola y estado de sala están abiertas para usuarios anónimos asociados al `room_code`.
   - Las inserciones en cola requieren que el estado de la sala sea `'active'`.
   - Las modificaciones de orden (`priority_order`) o eliminación masiva solo pueden ejecutarse mediante las funciones RPC `SECURITY DEFINER` protegidas con verificación de PIN.
