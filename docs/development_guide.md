# Guía de Desarrollo, Despliegue y Empaquetado (Development Guide)

**Estado:** Versión 1.0.0  
**Runtimes:** Node.js 20+ / npm 10+ / Android SDK (Opcional para APK)  

---

## 🛠️ 1. Requisitos Previos y Setup del Proyecto

1. **Instalación de Dependencias:**
   ```bash
   npm install
   ```
2. **Configuración de Variables de Entorno (`.env`):**
   Crear un archivo `.env` en la raíz del proyecto basado en la siguiente plantilla:
   ```env
   # Configuración de Supabase (Proyecto Dedicado de Karaoke)
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-privada

   # Puerto del servidor local / proxy de búsqueda
   PORT=3001
   VITE_APP_URL=http://localhost:5173
   ```

3. **Ejecución del Script de Migración en Supabase:**
   - Abrir el dashboard de Supabase en **SQL Editor**.
   - Pegar y ejecutar el contenido de `supabase/migrations/01_initial_schema.sql`.

---

## 🚀 2. Comandos de Desarrollo

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con Hot Reload |
| `npm run build` | Compilación de producción estricta con verificación TypeScript |
| `npm test` | Ejecuta la suite de pruebas unitarias con Vitest |
| `npm run preview` | Previsualiza la compilación de producción localmente |

---

## 📺 3. Modos de Operación en el Evento

### 3.1. Modo A: Android TV (Pantalla Grande y Sonido de TV)
1. En la Android TV, abrir el navegador web (ej: TV Bro, Puffin TV o Chrome) o la APK instalada.
2. Ingresar a la URL: `https://tu-dominio.com/tv?room=FIESTA` y presionar F11 / Pantalla Completa.
3. La TV proyectará el video de YouTube sin anuncios, el audio saldrá por la barra de sonido o televisor, y en pantalla se verá el Código QR gigante para los invitados.

### 3.2. Modo B: Celular Android Anfitrión con Bluetooth al Equipo de Música
1. El anfitrión conecta su celular Android por **Bluetooth** al equipo de música o torre de sonido de la fiesta.
2. Abre la URL en su celular o conecta el teléfono a un proyector/TV por cable HDMI o Chromecast.
3. El audio de YouTube sale a máxima potencia por el equipo de música.

### 3.3. Modo C: Consola DJ Táctil (Celular del Anfitrión)
1. El anfitrión abre en su propio teléfono móvil: `https://tu-dominio.com/host?room=FIESTA`.
2. Ingresa su PIN de seguridad (`1234`).
3. Dispone de la consola táctil para reordenar la música con el dedo, pausar, saltar y purgar canciones de personas que se fueron de la fiesta.

### 3.4. Modo D: Invitados con Datos Móviles (4G/5G)
1. El invitado apunta la cámara de su celular al QR de la pantalla.
2. Se abre automáticamente: `https://tu-dominio.com/join?room=FIESTA`.
3. Escribe su nombre ("David"), busca canciones en YouTube y las agrega a la cola.

---

## 📦 4. Generación de APK para Android TV (Opcional)

Si el anfitrión prefiere tener una aplicación instalada directamente en el menú de aplicaciones de la Android TV:
1. Se utiliza **Capacitor** para encapsular la aplicación web en un paquete nativo Android:
   ```bash
   npx cap init "Karaoke Party" "com.karaoke.party"
   npx cap add android
   npx cap sync
   ```
2. En `android/app/src/main/AndroidManifest.xml`, se declara la compatibilidad con Android TV (Leanback UI):
   ```xml
   <uses-feature android:name="android.software.leanback" android:required="false" />
   <uses-feature android:name="android.hardware.touchscreen" android:required="false" />
   ```
3. Compilar el archivo APK final con Gradle:
   ```bash
   cd android && ./gradlew assembleRelease
   ```
4. Copiar el archivo APK resultante a la Android TV mediante pendrive USB o la app "Send Files to TV".
