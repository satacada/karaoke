# Estándares de Desarrollo, Buenas Prácticas y Arquitectura Limpia (Development Standards)

**Estado:** Versión 1.0.0  
**Enfoque:** Clean Code, Clean-by-Design, TypeScript Estricto y Principios SOLID  

---

## 🏛️ 1. Estructura de Directorios Modular (Clean Architecture)

El código fuente del proyecto se organiza por dominios y capas de responsabilidad para garantizar mantenibilidad a largo plazo:

```
src/
├── components/                 # Componentes visuales (UI pura)
│   ├── tv/                     # Nodo TV (Reproductor continuo, QR gigante, Ticker)
│   │   ├── TvVideoPlayer.tsx
│   │   ├── TvPartyOverlay.tsx
│   │   └── TvRoomQrBadge.tsx
│   ├── host/                   # Nodo Celular Anfitrión (Consola DJ Táctil)
│   │   ├── HostDjConsole.tsx
│   │   ├── HostReorderList.tsx
│   │   ├── HostGuestPurgeModal.tsx
│   │   └── HostPlaybackControls.tsx
│   ├── guest/                  # Nodo Celular Invitados (PWA 4G/5G)
│   │   ├── GuestSongSearch.tsx
│   │   ├── GuestMyTurnCard.tsx
│   │   ├── GuestQueueView.tsx
│   │   └── GuestWelcomeForm.tsx
│   └── ui/                     # Componentes atómicos base reutilizables
│       ├── Modal.tsx           # Reemplazo obligatorio de window.alert/confirm
│       ├── Button.tsx
│       ├── Badge.tsx
│       └── Toast.tsx
├── hooks/                      # Custom Hooks desacoplados (Lógica de Negocio)
│   ├── useKaraokeRoom.ts       # Suscripción y canal Realtime de sala
│   ├── useQueueManager.ts      # Agregar, reordenar y purgar canciones
│   ├── useYouTubePlayer.ts     # Control del reproductor sin anuncios
│   └── useGuestSession.ts      # Persistencia de token y nombre en LocalStorage
├── lib/                        # Infraestructura y Clientes Externos
│   ├── supabaseClient.ts       # Inicialización del cliente Supabase
│   └── youtubeSearchApi.ts     # Cliente para búsqueda de pistas de karaoke
├── types/                      # Tipado estricto en TypeScript (Cero 'any')
│   ├── room.types.ts
│   ├── queue.types.ts
│   └── commands.types.ts
└── utils/                      # Funciones puras libres de efectos secundarios
    ├── timeFormatters.ts       # Conversión de segundos a "MM:SS"
    ├── queueCalculators.ts     # Cálculo de tiempo de espera y canciones restantes
    └── inputSanitizer.ts       # Limpieza XSS de nombres de invitados
```

---

## 📏 2. Metodología "Clean-by-Design"

1. **Límite de Líneas por Archivo:**
   - Ningún componente debe superar las **100 - 120 líneas de código**.
   - Si un componente crece por encima de este umbral, se descompone obligatoriamente en subcomponentes atómicos (ej: separar `HostReorderList` en `HostQueueItem` y `HostDragHandle`).
2. **Separación de Lógica y Vista (SRP - Single Responsibility):**
   - Los componentes JSX solo contienen estructura visual y estilos Tailwind.
   - Toda llamada a Supabase, cálculo de turnos o manipulación de estado se extrae a un Custom Hook en `src/hooks/`.
3. **Documentación JSDoc Obligatoria en Interfaces Públicas:**
   - Todas las funciones utilitarias y hooks deben incluir encabezados explicativos con sus parámetros y valor retornado.

---

## 🛡️ 3. Reglas de TypeScript Estricto

En `tsconfig.json`, el modo estricto está completamente activado:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

- **Prohibición Total de `any`:** El uso de `any` está vetado en todo el repositorio. Se debe utilizar `unknown`, interfaces explícitas o Uniones Discriminadas.
- **Uniones Discriminadas para Estados:**
  ```typescript
  export type QueueItemStatus = 
    | 'queued' 
    | 'playing' 
    | 'finished' 
    | 'skipped' 
    | 'purged_by_host' 
    | 'cancelled_by_guest';
  ```

---

## 🚫 4. Prohibición de Modales Nativos (`window.alert` / `window.confirm`)

- Queda estrictamente vetado el uso de diálogos nativos del navegador por interrumpir la experiencia de pantalla completa y no ser accesibles ni personalizables.
- Toda confirmación de acciones destructivas (ej: borrar una canción, purgar las canciones de un invitado ausente, cerrar la sala) utiliza el componente accesible `<Modal>` estilizado con Tailwind CSS y soporte de teclado (`Escape` para cerrar, `Enter` para confirmar).

---

## ⚡ 5. Resiliencia y Manejo de Errores

1. **React Error Boundaries:**
   - La pantalla de la TV y la consola DJ están envueltas en un límite de errores para que, en el improbable caso de que un video de YouTube falle al cargar, la aplicación no se bloquee y avance suavemente al siguiente tema.
2. **Estrategia de Reconexión de Red 4G:**
   - Si un invitado pierde la cobertura móvil momentáneamente, el cliente implementa reconexión automática con **Backoff Exponencial** (reintento a 1s, 2s, 4s, 8s) sin obligarlo a refrescar la página manualmente.
