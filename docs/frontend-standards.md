# Estándares de Frontend, UX/UI y Diseño Multidispositivo (Frontend Standards)

**Estado:** Versión 1.0.0  
**Framework:** React 19 + TypeScript 6 + Tailwind CSS v4 + Lucide Icons  
**Estilo Visual:** Neón Karaoke Party (Dark Mode con Acentos Neón Brillantes)  

---

## 🎨 1. Sistema de Diseño (Design Tokens)

El sistema de diseño está concebido para ambientes de fiesta nocturnos con luces tenues:

| Token | Valor Hex | Uso en la Interfaz |
| :--- | :--- | :--- |
| **`bg-party-dark`** | `#0a0b12` | Fondo principal profundo para TV y móviles |
| **`bg-card-glass`** | `rgba(22, 25, 43, 0.75)` | Contenedores glassmorphism con desenfoque de fondo |
| **`neon-cyan`** | `#00f2fe` | Resaltado de títulos, progreso de canción y badges de cola |
| **`neon-purple`** | `#9d4edd` | Botones de acción primaria ("Pedir Canción", "Unirse") |
| **`neon-magenta`** | `#f72585` | Marca de Karaoke, animación de logo y alertas de acción |
| **`turn-green`** | `#10b981` | Estado "¡ES TU TURNO DE CANTAR!" en el celular |
| **`next-amber`** | `#f59e0b` | Estado "¡Prepárate! Eres el siguiente" |

---

## 📺 2. Modo Pantalla Central / Android TV (10-Foot UI)

Diseñado para ser observado con claridad a una distancia de **3 a 5 metros** en pantallas grandes (1080p y 4K):
1. **Tipografía y Legibilidad:**
   - Título de la canción actual: mínimo `text-4xl` (36px).
   - Nombre de quien canta: mínimo `text-2xl` con badge brillante (*"🎤 Canta: David"*).
2. **Código QR Integrado:**
   - Tamaño mínimo de renderizado: `280x280` píxeles.
   - Contraste absoluto (código oscuro sobre fondo blanco con borde neón) para garantizar lectura instantánea con cámaras de celular desde 4 metros.
3. **Banner de Próximas Pistas (Ticker Inferior):**
   - Muestra de forma fija los siguientes 3 temas en fila:
     - *"1. María - Como la Flor"*
     - *"2. Lucas - Lamento Boliviano"*
     - *"3. Sofía - I Will Survive"*

---

## 🎛️ 3. Modo Consola DJ del Anfitrión (Celular Táctil)

Diseñado para que el anfitrión controle la fiesta con una sola mano sin acercarse a la TV:
1. **Gestión Táctil de Cola:**
   - Cada tarjeta de canción cuenta con botones rápidos `▲` (Subir) y `▼` (Bajar) y soporte de arrastre táctil (drag-and-drop) con vibración háptica al soltar.
2. **Panel "Gestión de Invitados Ausentes":**
   - Agrupa las canciones pendientes por nombre de invitado:
     ```
     ┌────────────────────────────────────────────────────────┐
     │ 👤 Lucas (2 canciones pendientes en cola)              │
     │ [🗑️ Quitar canciones de Lucas]                         │
     └────────────────────────────────────────────────────────┘
     ```
   - Al pulsar el botón de purga, se despliega un `<Modal>` de confirmación Tailwind (nunca `window.confirm`).
3. **Barra de Transporte Multimedia Flotante:**
   - Barra inferior fija con botones grandes de 48x48px:
     - `⏯️ Play/Pausa`
     - `⏭️ Saltar Pista`
     - `🔄 Reiniciar`
     - `🔇 Silenciar`

---

## 📱 4. Modo Invitado (Web App Móvil 4G/5G)

1. **Ultra Ligereza (< 150 KB Payload):**
   - Los invitados se conectan con su plan de datos móviles; el paquete inicial de JavaScript y CSS se sirve comprimido con Brotli/Gzip para cargar en menos de 1.5 segundos en redes 4G.
2. **Tarjeta Dinámica "Mi Turno":**
   - Ubicada en la parte superior fija de la pantalla:
     - **Estado Inactivo:** *"🎤 No tienes canciones pedidas. ¡Busca una y súmate!"*
     - **Estado En Espera:** *"⏳ Tu tema [Nombre] está en el puesto #3. Faltan 2 canciones (~6 min de espera)"*.
     - **Estado Próximo:** Alerta amarilla parpadeante con vibración: *"⚡ ¡Prepárate! Eres el siguiente"*.
     - **Estado Cantando:** Fondo verde esmeralda con lluvia de confeti: *"🎉 ¡ES TU TURNO! Pasa al micrófono"*.
3. **Buscador con Debounce y Filtro Inteligente:**
   - Búsqueda con retardo de 300ms para no disparar peticiones innecesarias en 4G.
   - Interruptor conmutador: *"Solo Karaoke"* (con letra e instrumental) vs *"Video Original"*.
