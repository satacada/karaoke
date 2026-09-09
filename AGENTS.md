# 🚨 GUÍA Y ESTÁNDARES OBLIGATORIOS PARA AGENTES DE IA (AGENTS.MD)

Todos los agentes de IA (Antigravity, Cursor, Windsurf, Claude Code, GitHub Copilot, ChatGPT) que interactúen con este repositorio **DEBEN** cumplir estrictamente los estándares y la arquitectura definidos en:

- **`docs/mandatory-steps.md`** (Pasos Obligatorios de Calidad y Compuertas de Aprobación)
- **`docs/development-standards.md`** (Estándares de Clean Code, Clean-by-Design y TypeScript Estricto)
- **`docs/security-standards.md`** (Modelo STRIDE, Políticas RLS, Protección XSS/SQLi y Anti-Spam)
- **`docs/git-workflow-and-versioning.md`** (SemVer 2.0, Conventional Commits y Estrategia de Ramas)
- **`docs/architecture-diagrams.md`** (Diagramas C4, Secuencia TV-Anfitrión-Invitados y ERD)
- **`docs/data-model.md`** (Modelo de Datos PostgreSQL / Supabase y Políticas RLS)
- **`docs/user-stories.md`** (Historias de Usuario Formales con Criterios Gherkin)
- **`docs/backend-standards.md`** (Estándares de Backend, Supabase Realtime y Búsqueda YouTube)
- **`docs/frontend-standards.md`** (Estándares de Frontend: Modo TV 10-foot, Control DJ Móvil y PWA Invitados)
- **`docs/api-spec.yml`** (Especificación OpenAPI 3.1 y Canales Realtime)
- **`docs/testing-guide.md`** (Estrategia de Pruebas Automatizadas y de Red 4G)
- **`docs/development_guide.md`** (Comandos de Desarrollo, Configuración y Empaquetado APK)

---

## 🛑 REGLAS DE ORO INQUEBRANTABLES DEL PROYECTO KARAOKE:

1. **SOLO DOCUMENTACIÓN EN ESTA ETAPA (CERO CÓDIGO PRODUCTIVO SIN ORDEN EXPLÍCITA):**
   - No generar código de componentes, páginas o servicios hasta que el usuario revise, ajuste y apruebe formalmente la documentación técnica y el plan de fases.

2. **AISLAMIENTO Y BASE DE DATOS DEDICADA EN SUPABASE:**
   - La aplicación requiere una base de datos propia en Supabase (`karaoke-party` o similar).
   - Jamás ejecutar migraciones o DDL sin previa autorización del usuario. El script formal reside en `supabase/migrations/01_initial_schema.sql`.

3. **ARQUITECTURA TRIÁDICA OBLIGATORIA (TV + CELULAR ANFITRIÓN + CELULARES INVITADOS):**
   - **Nodo TV / Reproductor:** Corre en Android TV o navegador central. Reproduce YouTube sin anuncios a pantalla completa con sonido al equipo. Muestra QR y estado. **No se controla con el control remoto físico de la TV para la música**.
   - **Nodo Anfitrión (DJ Móvil):** Corre en el celular del dueño de casa. Controla la TV remotamente en tiempo real (reordena canciones por drag-and-drop, purga canciones de personas que se fueron, salta temas).
   - **Nodo Invitados (4G/5G PWA):** Corre en los teléfonos de los invitados vía datos móviles (sin conectarse al WiFi de la casa). Busca en YouTube, solicita temas y consulta su posición en la fila.

4. **REPRODUCCIÓN YOUTUBE LIMPIA (SIN INTERRUPCIONES DE ANUNCIOS):**
   - Se debe implementar el pipeline de streaming/embed desacoplado de telemetría comercial para garantizar reproducción continua sin pausas publicitarias entre canciones.

5. **PROHIBIDO `window.alert()` / `window.confirm()`:**
   - Todas las confirmaciones e interacciones (ej: eliminar canción, purgar invitado ausente) deben utilizar componentes modales accesibles estilizados con Tailwind CSS.

6. **ACTUALIZACIÓN SISTEMÁTICA DE `PROGRESS.MD` Y TRAZABILIDAD:**
   - Mantener el control de avance actualizado. Cada cambio debe registrarse en `docs/CHANGELOG.md` clasificando:
     - 🚀 **[ESPECIFICACIÓN / FEATURE]**
     - 🔧 **[AFINAMIENTO / REFINAMIENTO]**
     - 🐛 **[CORRECCIÓN / FIX]**
