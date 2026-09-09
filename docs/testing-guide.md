# Guía y Estrategia de Pruebas Automatizadas (Testing Guide)

**Estado:** Versión 1.0.0  
**Frameworks:** Vitest (Pruebas Unitarias y de Lógica de Cola) + Playwright (Pruebas E2E Multidispositivo)  

---

## 🎯 1. Pirámide de Testing del Sistema

```
           /  E2E Multi-Device  \        (10% - TV + Celular Host + Celular Invitado)
          /----------------------\
         /  Integración & RPCs    \      (30% - Supabase Realtime, Transacciones SQL)
        /--------------------------\
       /    Pruebas Unitarias       \    (60% - Cálculo de turnos, Parser, Debounce)
```

---

## 🧪 2. Casos de Prueba Unitarios Críticos

### 2.1. Cálculo de Tiempos de Espera y Posición en Fila (`queueUtils.test.ts`)
1. **Caso 1:** Invitado sin canciones en cola -> Retorna `songsAhead: 0`, `isSingingNow: false`.
2. **Caso 2:** La canción del invitado está sonando actualmente en la TV -> Retorna `isSingingNow: true`.
3. **Caso 3:** Canción en posición #3, con canción actual con 45s restantes y canción #2 de 180s de duración -> Retorna tiempo estimado de 225 segundos (aprox. 4 minutos).

### 2.2. Reordenamiento y Purga Atómica (`queueOperations.test.ts`)
1. **Caso 1: Purga de Invitado Ausente:**
   - Si la cola tiene: `[1: David, 2: Lucas, 3: María, 4: Lucas, 5: Sofía]`
   - Al invocar `purge_guest_songs('Lucas')`:
     - Se eliminan las canciones en #2 y #4.
     - La nueva cola resultante es: `[1: David, 2: María, 3: Sofía]`.
     - Se verifica que los ordinales quedan perfectamente correlativos sin huecos (`1, 2, 3`).
2. **Caso 2: Reordenamiento por Drag-and-Drop:**
   - Mover la canción #5 al puesto #2 debe desplazar a las canciones #2, #3 y #4 hacia abajo en 1 posición.

---

## 🌐 3. Pruebas de Conectividad en Redes Separadas (4G vs Wi-Fi)

Para validar que los invitados en **redes móviles 4G/5G** pueden interactuar con la **Android TV en Wi-Fi**:
1. **Simulación de Latencia y Desconexión:**
   - Configurar en DevTools la emulación de red "Fast 3G" y "Slow 4G".
   - Desconectar momentáneamente la conexión celular (modo avión) durante 5 segundos y verificar que la aplicación reconecta automáticamente el canal Realtime de Supabase y recupera la cola sin recargar la página.
2. **Prueba de Petición Concurrente:**
   - Disparar 10 solicitudes de canciones simultáneas desde diferentes tokens de sesión.
   - Verificar que PostgreSQL serializa las inserciones asignando ordinales únicos correlativos sin colisiones.

---

## 📺 4. Pruebas de Reproducción Continua Sin Anuncios

1. **Detección de Finalización (`YT.PlayerState.ENDED`):**
   - Verificar que al terminar el video actual, el reproductor de la TV invoca automáticamente la carga del siguiente video (`loadVideoById`) en un lapso **menor a 1.2 segundos**.
2. **Verificación de Ausencia de Anuncios:**
   - Comprobar que los parámetros del reproductor embebido suprimen la telemetría comercial y garantizan que el video musical inicie inmediatamente en el segundo 0:00.
