# Historias de Usuario (User Stories & Acceptance Criteria)

**Estado:** Versión 1.0.0  
**Metodología:** Agile / BDD con sintaxis Gherkin formal (Dado / Cuando / Entonces)  

---

## 📺 ÉPICA 1: PANTALLA CENTRAL / ANDROID TV (REPRODUCTOR HOST)

### HU-01: Proyección de Pantalla de Fiesta y Código QR Dinámico
**Como** Anfitrión de la fiesta,  
**Quiero** que mi Android TV muestre el video a pantalla completa con un código QR legible y el código de sala en una esquina,  
**Para que** los invitados puedan unirse de inmediato desde sus celulares escaneando con la cámara sin interrumpir la reproducción.

* **Criterios de Aceptación:**
  * **Escenario 1: Sala activa sin reproducción**
    * **Dado** que la sala "FIESTA" está activa y la cola está vacía,
    * **Cuando** se abre la aplicación en la Android TV,
    * **Entonces** se muestra un fondo animado estilo Neón Karaoke, el Código QR gigante en el centro y el texto "¡Escanea para pedir tu canción!".
  * **Escenario 2: Sala activa con reproducción de video**
    * **Dado** que hay una canción reproduciéndose en la TV,
    * **Cuando** el video está en pantalla completa,
    * **Entonces** el Código QR se reduce a una esquina inferior semitransparente con el código de sala ("FIESTA") legible a 4 metros de distancia.

---

### HU-02: Reproducción Continua de YouTube Sin Anuncios
**Como** Cantante e invitado de la fiesta,  
**Quiero** que los videos de YouTube comiencen al instante sin cortes publicitarios y pasen al siguiente tema de inmediato,  
**Para que** no se corte la energía ni la diversión del karaoke con comerciales de 30 segundos.

* **Criterios de Aceptación:**
  * **Escenario 1: Transición automática entre canciones**
    * **Dado** que está sonando la canción "La Incondicional" (duración 3:30),
    * **Cuando** el video llega a su segundo final (3:30),
    * **Entonces** la TV notifica el evento `finished`, llama a `fn_advance_next_song` y arranca de forma inmediata la siguiente pista en cola sin silencios mayores a 1 segundo.
  * **Escenario 2: Ausencia total de anuncios comerciales**
    * **Dado** cualquier video solicitado por un usuario,
    * **Cuando** se inicia la reproducción en el nodo TV,
    * **Entonces** el pipeline de streaming suprime anuncios publicitarios previos (pre-roll) e intermedios (mid-roll).

---

## 📱 ÉPICA 2: APLICACIÓN MÓVIL DE INVITADOS (4G/5G PWA)

### HU-03: Acceso Inmediato sin Conectarse al Wi-Fi Doméstico
**Como** Invitado que llega a la fiesta con su plan de datos 4G/5G,  
**Quiero** entrar al sistema escaneando el QR sin tener que pedir la clave del Wi-Fi de la casa ni descargar un APK pesado,  
**Para que** pueda participar en menos de 5 segundos consumiendo menos de 1 MB de mis datos.

* **Criterios de Aceptación:**
  * **Escenario 1: Registro express en 1 paso**
    * **Dado** que el invitado escanea el QR con su cámara en red 4G/5G,
    * **Cuando** se abre la URL en su navegador móvil (Safari o Chrome),
    * **Entonces** ve un campo de texto para ingresar su nombre o apodo ("Carlos") y un botón "¡Entrar a Cantar!".
  * **Escenario 2: Persistencia de sesión**
    * **Dado** que Carlos ya ingresó su nombre,
    * **Cuando** cierra el navegador o se le bloquea la pantalla y vuelve a abrir la app,
    * **Entonces** el sistema recuerda automáticamente su identidad mediante su `session_token` local sin volver a pedirle el nombre.

---

### HU-04: Buscador de YouTube con Filtro Especializado de Karaoke
**Como** Invitado,  
**Quiero** buscar cualquier canción o artista y que me sugiera automáticamente pistas con letra de karaoke,  
**Para que** pueda encontrar la versión instrumental correcta para cantar.

* **Criterios de Aceptación:**
  * **Escenario 1: Búsqueda con filtro karaoke activo (Por defecto)**
    * **Dado** que el interruptor "Solo Karaoke" está activado,
    * **Cuando** el usuario escribe "De Música Ligera",
    * **Entonces** el motor de búsqueda consulta automáticamente `De Música Ligera karaoke` y muestra una lista con carátula, canal y duración.
  * **Escenario 2: Solicitud de tema**
    * **Dado** un resultado de búsqueda,
    * **Cuando** el usuario pulsa "Pedir Canción",
    * **Entonces** se inserta en `karaoke_queue` con su nombre y se muestra una confirmación visual "¡Agregada a la cola en el puesto #3!".

---

### HU-05: Seguimiento Personalizado del Turno ("Mi Turno")
**Como** Invitado con canciones solicitadas,  
**Quiero** ver cuántas canciones y minutos faltan exactamente antes de que me toque cantar,  
**Para que** pueda calcular en qué momento ir a buscar una bebida o acercarme al micrófono.

* **Criterios de Aceptación:**
  * **Escenario 1: Canción en espera lejana**
    * **Dado** que Carlos tiene un tema en el puesto #4 de la cola,
    * **Cuando** mira su celular,
    * **Entonces** la tarjeta "Mi Turno" muestra: *"Faltan 3 canciones (~10 min de espera)"*.
  * **Escenario 2: Alerta previa (Eres el siguiente)**
    * **Dado** que la canción previa concluyó y la canción de Carlos queda en el puesto #1 (siguiente),
    * **Cuando** se actualiza la cola,
    * **Entonces** su celular vibra suavemente y muestra un banner parpadeante en amarillo: *"⚡ ¡Prepárate! Eres el siguiente después de esta canción"*.
  * **Escenario 3: Momento de cantar**
    * **Dado** que la canción de Carlos comienza a sonar en la TV,
    * **Cuando** se recibe el evento `playing`,
    * **Entonces** su pantalla se vuelve verde esmeralda con una animación de confeti y el texto: *"🎉 ¡ES TU TURNO! Pasa al micrófono"*.

---

## 🎛️ ÉPICA 3: CONSOLA MÓVIL DEL ANFITRIÓN (CONTROL REMOTO DJ TÁCTIL)

### HU-06: Control de la TV desde el Celular (Reordenamiento de Cola)
**Como** Anfitrión de la fiesta,  
**Quiero** controlar la cola musical desde la pantalla táctil de mi celular en lugar de usar el control remoto de la TV,  
**Para que** pueda subir o bajar temas de prioridad arrastrándolos con el dedo de forma ultra rápida.

* **Criterios de Aceptación:**
  * **Escenario 1: Reordenar por Drag-and-Drop**
    * **Dado** que el anfitrión tiene abierta la Consola DJ en su celular,
    * **Cuando** arrastra la canción del puesto #5 al puesto #1,
    * **Entonces** se ejecuta `fn_reorder_queue` en Supabase y la lista de la Android TV se actualiza en menos de 100ms reflejando el nuevo orden.

---

### HU-07: Purga de Canciones de Invitados que se Fueron de la Fiesta
**Como** Anfitrión,  
**Quiero** un panel donde pueda ver la lista de invitados que pidieron temas y un botón para eliminar todas las canciones de alguien que ya se fue,  
**Para que** no suenen canciones huérfanas en la fiesta si una persona se retira temprano.

* **Criterios de Aceptación:**
  * **Escenario 1: Purga con confirmación modal**
    * **Dado** que el invitado "Lucas" tenía 3 canciones en la cola y se va de la fiesta,
    * **Cuando** el anfitrión entra a "Gestión de Invitados" y pulsa "🗑️ Quitar canciones de Lucas",
    * **Entonces** aparece un Modal Tailwind de confirmación preguntando: "¿Deseas eliminar las 3 canciones de Lucas?".
  * **Escenario 2: Ejecución atómica y recálculo**
    * **Dado** que el anfitrión confirma la eliminación,
    * **Cuando** se ejecuta la función `fn_purge_guest_songs`,
    * **Entonces** las 3 canciones de Lucas se eliminan de la cola, los demás invitados avanzan puestos automáticamente y la TV actualiza su lista en vivo.

---

### HU-08: Controles Multimedia Remotos para la TV
**Como** Anfitrión,  
**Quiero** botones táctiles en mi celular para pausar, adelantar o saltar la canción actual que suena en la TV,  
**Para que** pueda manejar el sonido de la fiesta desde cualquier rincón de la casa.

* **Criterios de Aceptación:**
  * **Escenario 1: Saltar canción**
    * **Dado** que nadie sale a cantar la canción en curso,
    * **Cuando** el anfitrión pulsa el botón "⏭️ Saltar Canción" en su celular,
    * **Entonces** se emite un comando Realtime a la TV, la pista actual se detiene de inmediato y arranca el siguiente tema en cola.
