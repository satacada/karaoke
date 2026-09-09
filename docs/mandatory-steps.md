# Pasos Obligatorios de Calidad y Compuertas de Aprobación (Mandatory Steps)

**Estado:** Versión 1.0.0  
**Objetivo:** Establecer los criterios ineludibles de control de calidad para el proyecto Karaoke Colaborativo.  

---

## 🛑 1. Compuerta Pre-Ejecución: Consentimiento de Base de Datos
- **Aislamiento en Supabase:** El proyecto se conecta exclusivamente a su base de datos dedicada.
- **Prohibición de DDL no autorizado:** Ningún agente ni desarrollador aplicará scripts de migración (`DROP`, `ALTER`, `CREATE`) sin la confirmación y revisión previa del usuario.
- **Verificación de idempotencia:** Todo script DDL debe contar con sentencias `IF EXISTS` / `ON CONFLICT` para evitar inconsistencias en re-ejecuciones.

---

## ⚡ 2. Compuerta de Desarrollo: Clean-by-Design y TypeScript Estricto
- **TypeScript Strict Mode:** Cero uso de `any`; todos los tipos deben validarse estrictamente según `docs/development-standards.md`.
- **Cero `window.alert()` o `window.confirm()`:**
  - Queda terminantemente prohibido el uso de ventanas emergentes nativas del navegador.
  - Toda interacción de confirmación (ej: purga de invitado, salto de canción, salida de sala) debe utilizar componentes `<Modal>` o `<Dialog>` con accesibilidad WAI-ARIA y estilos Tailwind CSS.
- **Seguridad y Modelo STRIDE:**
  - Toda entrada de usuario (`guest_name`, consultas) debe sanitizarse contra XSS e inyecciones conforme a `docs/security-standards.md`.
  - Comandos de anfitrión protegidos obligatoriamente con verificación de PIN en funciones RPC con `SECURITY DEFINER`.
- **Commits y Versionamiento:**
  - Cumplir estrictamente la convención de `docs/git-workflow-and-versioning.md` (Conventional Commits y SemVer 2.0).

---

## 🧪 3. Compuerta de Verificación: Compilación y Pruebas
- **Build Limpio Obligatorio:**
  - Antes de concluir cualquier etapa, se debe ejecutar `npm run build` y verificar código de salida 0.
- **Pruebas de Red Desacoplada (4G/5G vs Wi-Fi):**
  - Simulación de peticiones concurrentes desde IPs públicas distintas a la red doméstica para validar que la capa Realtime de Supabase no depende de conexión LAN.
- **Prueba de Latencia:**
  - El tiempo transcurrido desde que un invitado pulsa "Pedir Canción" hasta que el nuevo tema aparece en la pantalla de la TV debe ser **inferior a 200 milisegundos**.

---

## 📝 4. Compuerta de Cierre: Documentación Viva
- Toda modificación arquitectónica o nueva función debe registrarse de inmediato en:
  - `PROGRESS.md`: Marcado de la actividad con `[x]`.
  - `docs/CHANGELOG.md`: Registro de versión y tipo de cambio (🚀 Feature, 🔧 Refinamiento, 🐛 Fix).
  - `docs/user-stories.md`: Validación contra los criterios de aceptación Gherkin.
