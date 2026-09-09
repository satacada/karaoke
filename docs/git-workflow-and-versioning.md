# Flujo de Trabajo Git, Versionamiento y Estándares de Commits (Git & Versioning Standards)

**Estado:** Versión 1.0.0  
**Estándares:** Semantic Versioning 2.0.0 + Conventional Commits 1.0.0 + GitHub Flow  

---

## 🏷️ 1. Esquema de Versionamiento Semántico (SemVer 2.0.0)

El proyecto sigue formalmente la especificación `MAJOR.MINOR.PATCH`:

```
   v 1 . 0 . 0
     │   │   │
     │   │   └──► PATCH: Correcciones de errores, parches de seguridad y fixes de CSS (retrocompatible).
     │   └──────► MINOR: Nuevas funcionalidades (ej: nuevo filtro de búsqueda, vista de letras) (retrocompatible).
     └──────────► MAJOR: Cambios arquitectónicos que rompen compatibilidad (ej: migración DDL incompatible, rediseño de canales Realtime).
```

### Reglas de Etiquetado (Git Tags):
- Cada versión desplegada o hito completado se etiqueta con un tag anotado:
  ```bash
  git tag -a v1.0.0 -m "Release v1.0.0: Documentación completa de arquitectura y setup inicial"
  git push origin v1.0.0
  ```

---

## 🌿 2. Estrategia de Ramas (Git Branching Model)

El proyecto utiliza un modelo basado en ramas cortas y protegidas:

```
[ main ] ──────────────●─────────────────────────●────────────── (Producción Estable)
                       │                         ▲
                       │ (Branch off)            │ (Pull Request Aprobado)
                       ▼                         │
[ feature/tv-player ] ─●──────●──────●───────────┘ (Desarrollo Aislado)
```

| Tipo de Rama | Patrón de Nombres | Propósito | Rama Origen | Rama Destino |
| :--- | :--- | :--- | :--- | :--- |
| **Main / Release** | `main` | Código en producción, 100% estable y compilable | N/A | N/A |
| **Feature** | `feature/<nombre>` | Nuevas funcionalidades (ej: `feature/dj-remote-drag-drop`) | `main` | `main` |
| **Bugfix** | `fix/<nombre>` | Corrección de defectos encontrados en pruebas | `main` | `main` |
| **Hotfix** | `hotfix/<version>` | Parche crítico directo para producción | `main` | `main` |

---

## 📝 3. Convención de Mensajes de Commit (Conventional Commits)

Todos los commits deben cumplir la estructura:
```
<tipo>(<alcance opcional>): <descripción corta en imperativo>

[cuerpo opcional con justificación técnica del cambio]

[pie de commit opcional con referencias a historias de usuario o issues]
```

### Tipos de Commit Permitidos:
- **`feat`**: Nueva funcionalidad (ej: `feat(tv): agregar reproductor continuo de YouTube sin anuncios`).
- **`fix`**: Corrección de un defecto (ej: `fix(queue): corregir salto de ordinales al purgar invitado`).
- **`docs`**: Cambios exclusivamente en documentación (ej: `docs(security): agregar modelo de amenazas STRIDE`).
- **`refactor`**: Reestructuración de código sin alterar comportamiento (ej: `refactor(hooks): extraer useQueueManager`).
- **`test`**: Creación o ajuste de pruebas automatizadas (ej: `test(queue): agregar pruebas unitarias de turnos`).
- **`chore`**: Tareas de configuración, scripts o actualización de dependencias (ej: `chore(deps): actualizar supabase-js`).

### Ejemplos de Commits Válidos:
```bash
git commit -m "feat(dj-remote): implementar botón de purga de invitados ausentes con modal accesible"
git commit -m "fix(realtime): reconectar canal de sala tras pérdida momentánea de cobertura 4G"
git commit -m "docs(architecture): actualizar diagrama de secuencia TV-Anfitrión-Invitados"
```

---

## 🚦 4. Compuertas Pre-Commit y Calidad de Código

Antes de confirmar cualquier commit o abrir un Pull Request, el entorno local debe validar:
1. **Linter:** `npm run lint` (0 errores).
2. **Tipado Estricto:** `npx tsc --noEmit` (0 errores de TypeScript).
3. **Protección de Secretos:** Verificación automática de que no se incluyan archivos `.env` o claves privadas.
4. **Changelog Sincronizado:** Toda nueva funcionalidad o corrección relevante debe estar reflejada en `docs/CHANGELOG.md`.
