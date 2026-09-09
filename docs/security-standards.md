# Estándares de Seguridad, Modelo de Amenazas y Protección de Datos (Security Standards)

**Estado:** Versión 1.0.0  
**Clasificación:** Confidencial / Arquitectura de Seguridad  
**Alcance:** Supabase Cloud, Protocolo Realtime, PWA Invitados en 4G/5G, Android TV y Consola DJ  

---

## 🛡️ 1. Modelo de Amenazas (STRIDE Framework)

Para garantizar que la fiesta se desarrolle sin troleos, sabotajes de lista ni brechas de seguridad, se analiza el sistema bajo la matriz de amenazas STRIDE:

| Amenaza (STRIDE) | Riesgo Identificado en la Fiesta | Mecanismo de Mitigación Implementado |
| :--- | :--- | :--- |
| **Spoofing (Suplantación)** | Un invitado finge ser el anfitrión para saltar temas o vaciar la cola. | **Autenticación por PIN del Anfitrión (Host PIN):** Los comandos de DJ (`reorder`, `skip`, `purge`) requieren validación obligatoria del PIN en funciones RPC protegidas en PostgreSQL. |
| **Tampering (Manipulación)** | Un invitado modifica la posición de su tema en la base de datos para cantar antes. | **Inmutabilidad de Orden por RLS:** Los usuarios anónimos solo tienen permisos de `INSERT` con estado forzado a `'queued'` y posición calculada por el servidor; no tienen permiso `UPDATE` directo sobre `priority_order`. |
| **Repudiation (Repudio)** | Un usuario agrega temas ofensivos o de broma y niega su autoría. | **Trazabilidad por Token de Sesión:** Cada solicitud vincula atómicamente el `session_token` local, la IP ofuscada, el nombre ingresado y la marca de tiempo `requested_at`. |
| **Information Disclosure** | Exposición de credenciales de infraestructura o claves de administración. | **Separación Estricta de Claves Supabase:** El cliente web solo conoce `anon_key` (restringida por RLS). La clave `service_role_key` jamás se incluye en los bundles de frontend (`.gitignore` activado). |
| **Denial of Service (DoS / Trolling)** | Un invitado solicita 50 temas en 1 segundo para monopolizar el equipo de música. | **Reglas de Juego Limpio (Fair Play):** Límite estricto de **máximo 3 temas activos por invitado**, cooldown de 15s entre peticiones y debounce de 300ms en el buscador. |
| **Elevation of Privilege** | Un invitado envía comandos directos al reproductor de la Android TV. | **Canal de Comandos Aislado:** La tabla `karaoke_commands` rechaza escrituras directas del rol `anon` y solo acepta inserciones a través de la función `fn_send_host_command` con PIN válido. |

---

## 🔒 2. Matriz de Políticas de Seguridad en Base de Datos (PostgreSQL RLS)

Todas las tablas en `public` tienen activado **Row Level Security (RLS)** obligatorio:

```sql
-- Activar RLS en todas las tablas del esquema
ALTER TABLE public.karaoke_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karaoke_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karaoke_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karaoke_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karaoke_history ENABLE ROW LEVEL SECURITY;
```

### Reglas de Acceso por Tabla:

### 2.1. Tabla `karaoke_rooms`
- **SELECT (Lectura):** Permitido para rol `anon` y `authenticated` filtrando por `room_code`. El campo sensible `host_pin` se enmascara en consultas públicas mediante una vista segura o función RPC.
- **INSERT/UPDATE/DELETE:** Denegado para `anon`. Solo modificable por funciones RPC internas de administración de sala.

### 2.2. Tabla `karaoke_queue`
- **SELECT (Lectura):** Público para cualquier usuario conectado a la sala (`WHERE room_id = current_room_id() AND status IN ('queued', 'playing')`).
- **INSERT (Agregar tema):** Permitido para `anon` siempre y cuando:
  1. El estado de la sala sea `'active'`.
  2. El usuario no supere el límite de 3 canciones en estado `'queued'`.
  3. El estado inicial del registro sea estrictamente `'queued'`.
- **UPDATE (Modificar tema):** Denegado directamente para `anon`. El reordenamiento y cambio de estado se canaliza exclusivamente por las funciones RPC `fn_reorder_queue` y `fn_advance_next_song`.
- **DELETE (Cancelar tema propio):** Permitido únicamente si el `session_token` del registro coincide con el token del cliente solicitante.

### 2.3. Tabla `karaoke_commands`
- **SELECT:** Permitido únicamente para el dispositivo TV (`client_role = 'tv_display'`).
- **INSERT:** Exclusivo para el celular del anfitrión validado con PIN.

---

## 🧹 3. Sanitización de Entradas y Protección contra Inyecciones

1. **Prevención de Cross-Site Scripting (XSS):**
   - El nombre del invitado (`guest_name`) se sanitiza removiendo etiquetas HTML, scripts y caracteres de escape.
   - Longitud máxima forzada: **50 caracteres**.
   - Los títulos de canciones se renderizan en React usando interpolación nativa (escapado automático de entidades HTML) sin emplear `dangerouslySetInnerHTML`.
2. **Prevención de Inyección SQL (SQLi):**
   - Cero consultas mediante concatenación de strings (`'SELECT * FROM ... WHERE id = ' + id`).
   - Uso 100% obligatorio de consultas parametrizadas a través del SDK de Supabase / PostgREST y parámetros formales en funciones PL/pgSQL.

---

## 🌐 4. Seguridad en Redes Celulares 4G/5G y Cero Exposición Doméstica

1. **Cero Puertos Abiertos en el Router:**
   - La TV y el celular anfitrión operan como clientes salientes WebSocket hacia Supabase.
   - No se requiere configurar Port Forwarding, NAT ni DMZ en el router de la casa.
2. **Trifecta de Cifrado en Tránsito:**
   - Todo el tráfico entre los celulares 4G y la nube viaja exclusivamente sobre **HTTPS (TLS 1.3)** y **WSS (WebSockets Seguro)**.
3. **Protección de Datos en Reposo:**
   - PostgreSQL en Supabase almacena los datos cifrados mediante AES-256 a nivel de bloque.

---

## 📍 5. Mecanismo Híbrido de Presencia Física (Anti-Trolleo Remoto)

Para impedir que personas que abandonaron el establecimiento o están en sus casas agreguen canciones usando el enlace guardado en sus celulares 4G/5G, se implementa una arquitectura híbrida de 3 etapas:

1. **Código QR Rotativo Diario / Por Jornada:**
   - Cada día o sesión de fiesta se genera un token efímero (`daily_token`) en el QR proyectado por la TV.
   - Los enlaces antiguos o capturas de pantalla de días pasados quedan invalidados automáticamente.

2. **Período de Gracia Inicial de 60 Minutos (Cero Fricción):**
   - Al escanear el QR en el local, el dispositivo del invitado registra las coordenadas GPS del escaneo inicial (`scan_latitude`, `scan_longitude`).
   - Durante los primeros **60 minutos**, el cliente tiene un pase libre para pedir música sin ser interrumpido ni volver a solicitarle permisos de ubicación.

3. **Verificación de Geocerca Silenciosa Post-Gracia (Fórmula de Haversine <= 200m):**
   - Cumplida la hora de gracia, cada vez que el cliente presiona *"Pedir canción"*, el navegador consulta silenciosamente el GPS en segundo plano:
     - **Si sigue en el local (distancia <= 200m):** El pedido se procesa de inmediato y de forma transparente; el usuario no tiene que levantarse de su mesa ni re-escanear nada.
     - **Si se fue a su casa (distancia > 200m):** El sistema bloquea el pedido con el mensaje: *"⚠️ Estás fuera del establecimiento. Acércate al local para solicitar música."*

