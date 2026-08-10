# Guía de Arquitectura Frontend — Solfa (Interfaz Unificada)

> **Propósito de este documento:** servir como manual técnico de referencia para el diseño y estructuración del frontend final de la tesis. Este documento describe **únicamente** la capa visual/estructural (componentes, carpetas, estados de interfaz, responsividad). No contiene lógica de negocio, llamadas a backend, ni hooks funcionales — esas piezas se añadirán en commits futuros sobre esta base. Está pensado para ser reutilizado como contexto en futuros prompts a una IA.

---

## 1. Objetivo del proyecto (contexto)

Unificar en **una sola aplicación React** las funcionalidades previamente validadas de forma aislada en los mini-apps numerados (06–09) del monorepo de tesis:

- Subida de archivos de audio
- Grabación de audio desde el navegador
- Listado dinámico de audios (subidos/grabados) con estados
- Descarga de MIDI y de PDF (partitura)
- Visualización de MIDI como Piano Roll
- Visualización de partitura (VexFlow) a partir de MIDI/Tone.js JSON

Esta app es el **frontend de producción** de la tesis y también la interfaz que se usará en la **defensa en vivo**, por lo que prioriza claridad visual, consistencia y estabilidad de layout sobre features adicionales.

En esta etapa **solo se construye la interfaz**: estructura, componentes, estados visuales (vacío, cargando, error, éxito) y datos mock. La lógica de conexión a backend, Tone.js real, VexFlow real y MediaRecorder real se integrará en iteraciones posteriores sobre esta misma base.

---

## 2. Stack tecnológico

| Capa               | Tecnología                                                  |
| ------------------ | ----------------------------------------------------------- |
| Librería UI        | React (JavaScript, sin TypeScript)                          |
| Bundler/Dev server | Vite                                                        |
| Estilos            | CSS Modules (`*.module.css`) por componente                 |
| Tokens de diseño   | CSS Custom Properties globales (`:root`)                    |
| Iconografía        | Lucide React                                                |
| Alias de imports   | `@/` apuntando a `src/`                                     |
| Tipografía         | JetBrains Mono (técnico/monoespaciado) + Inter (UI general) |

No se incluyen librerías de estado global, routing, ni fetching en esta fase — la app es de una sola vista (single page) con secciones internas.

---

## 3. Principios de diseño

- **Tema oscuro** como único modo (no se contempla light mode).
- **Minimalista y profesional**: jerarquía tipográfica clara, espaciado generoso, poca decoración.
- **Glass effects**: paneles con `backdrop-filter: blur()`, bordes translúcidos, superficies semi-transparentes sobre el fondo oscuro.
- **Identidad "partitura/audio"**: texturas sutiles de fondo (líneas de pentagrama, grid tipo piano roll) usadas con moderación, nunca compitiendo con el contenido.
- **Micro-animación con propósito**: usada para indicar estado (grabando, procesando, escaneo de análisis), no como adorno gratuito.
- **Consistencia entre breakpoints**: la jerarquía de información se mantiene igual en desktop/tablet/mobile; lo que cambia es la disposición (columnas → stack → tabs/bottom sheet).

### 3.1 Paleta de color (tokens)

Paleta verde-bosque oscura, ya validada en mini-apps previos y en el scaffold de Solfa:

| Token              | Uso                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------- |
| `--color-void`     | Fondo más profundo (detrás de todo)                                                    |
| `--color-base`     | Fondo base de la app                                                                   |
| `--color-surface`  | Superficie de tarjetas/paneles                                                         |
| `--color-elevated` | Superficie elevada (modales, dropdowns, toolbars flotantes)                            |
| `--color-sage`     | Acento primario (verde salvia — acciones principales, estados activos)                 |
| `--color-amber`    | Acento secundario/advertencia (grabación activa, estados "processing", alertas suaves) |
| `--color-ink`      | Texto principal sobre fondo oscuro                                                     |

Variantes adicionales a definir en `tokens.css`: `--color-ink-muted` (texto secundario), `--color-border` (bordes sutiles), `--color-danger` (estado error), `--color-success` (estado ready/completado).

### 3.2 Tipografía

- **JetBrains Mono**: nombres de archivo, timestamps, valores numéricos (BPM, duración, tonalidad), badges de estado, cualquier dato "técnico".
- **Inter**: títulos, texto de interfaz, labels, botones, texto descriptivo.

### 3.3 Efectos y texturas reutilizables

- `.glass` — utilidad base para paneles con blur + borde translúcido + sombra suave.
- `.staff-lines` — textura de fondo tipo pentagrama, para zonas relacionadas con partitura.
- `.roll-grid` — textura de fondo tipo grid de piano roll, para zonas relacionadas con MIDI/piano roll.
- Animaciones con nombre semántico: `pulse-rec` (grabación activa), `waveform` (visualización de onda en vivo), `scan` (procesando/analizando), `rise-in` (entrada de elementos nuevos en listas).

### 3.4 Radios, espaciado y sombra

Definir como tokens (no valores hardcodeados en componentes):

- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`
- Escala de espaciado en base 4/8px: `--space-1` … `--space-8`
- `--shadow-glass`, `--shadow-elevated`

---

## 4. Estructura de carpetas

```
src/
├── assets/
│   ├── fonts/                  # JetBrains Mono, Inter (archivos locales)
│   ├── icons/                  # SVGs personalizados si no cubre Lucide
│   └── images/                 # logo, ilustraciones de empty states
│
├── styles/
│   ├── tokens.css              # variables globales: color, tipografía, espaciado, radios, sombras
│   ├── globals.css             # reset, box-sizing, tipografía base, scrollbar
│   ├── effects.module.css      # .glass, .staff-lines, .roll-grid (utilidades compartidas)
│   └── animations.css          # pulse-rec, waveform, scan, rise-in
│
├── components/
│   ├── ui/                     # primitivos genéricos, reutilizables en toda la app
│   │   ├── Button/
│   │   ├── IconButton/
│   │   ├── Badge/
│   │   ├── Chip/
│   │   ├── Tabs/
│   │   ├── Tooltip/
│   │   ├── Modal/
│   │   ├── ProgressBar/
│   │   ├── Spinner/
│   │   ├── Slider/              # (volumen, seek de playback)
│   │   └── EmptyState/
│   │
│   ├── layout/                  # esqueleto general de la app
│   │   ├── AppShell/             # wrapper raíz: grid de layout responsive
│   │   ├── Topbar/                # logo/título del proyecto, acciones globales
│   │   ├── PanelSection/          # contenedor con título + glass card, usado en varias zonas
│   │   └── ViewerPanel/           # panel principal derecho (Piano Roll / Sheet Music)
│   │
│   ├── audio-input/              # captura de audio
│   │   ├── UploadDropzone/
│   │   ├── RecordControl/
│   │   ├── RecordingWaveform/     # visual de onda en vivo (mock/estática en esta fase)
│   │   └── RecordingTimer/
│   │
│   ├── audio-library/            # listado dinámico
│   │   ├── AudioList/
│   │   ├── AudioListItem/
│   │   ├── AudioStatusBadge/      # ready / processing / queued / error
│   │   └── AudioListEmptyState/
│   │
│   ├── playback/                 # reproducción de audio/MIDI
│   │   ├── PlaybackTransport/     # play/pause, seek, tiempo actual/total
│   │   └── VolumeControl/
│   │
│   ├── downloads/                # descargas de resultados
│   │   ├── DownloadBar/           # contenedor con botones de descarga
│   │   └── DownloadButton/        # botón individual (MIDI / PDF), con estado disabled/ready
│   │
│   ├── piano-roll/                # visualización MIDI
│   │   ├── PianoRollView/          # contenedor de la sección completa
│   │   ├── PianoRollCanvas/        # área de notas cayendo/scrolleando (placeholder visual)
│   │   ├── PianoKeyboard/          # teclado vertical sincronizado
│   │   └── PianoRollTimeline/      # regla de tiempo/compases
│   │
│   └── sheet-music/               # visualización de partitura
│       ├── SheetMusicView/         # contenedor de la sección completa
│       ├── SheetMusicToolbar/      # zoom, tonalidad detectada, exportar
│       └── SheetMusicPageControls/ # paginación si la partitura ocupa varias páginas
│
├── mock/
│   ├── audioLibrary.mock.js       # las 5 entradas mock ya usadas en Solfa (ready/processing/queued/error)
│   ├── pianoRoll.mock.js          # estructura mock de notas para placeholder visual
│   └── sheetMusic.mock.js         # estructura mock de compases/tonalidad para placeholder visual
│
├── layouts/                       # (si se decide separar de components/layout)
│   └── AppLayout/                 # composición final de AppShell + secciones para cada breakpoint
│
├── App.jsx
├── main.jsx
└── index.css
```

**Convención de carpetas por componente:**

```
ComponentName/
├── ComponentName.jsx
├── ComponentName.module.css
└── index.js            # re-export limpio: export { default } from './ComponentName'
```

---

## 5. Convención de encabezado de archivo

Todo archivo inicia con bloque de 3 líneas:

- Archivos `.css` / `.module.css`:

```css
/* thesis-audio-midi-sheet-music */
/* @jdomingu19 */
/* ComponentName.module.css */
```

- Archivos `.jsx` / `.js`:

```jsx
// thesis-audio-midi-sheet-music
// @jdomingu19
// ComponentName.jsx
```

---

## 6. Mapa de la aplicación (layout general)

La app es de **una sola vista** dividida en 4 zonas funcionales. No hay routing; la navegación es por estado local (ej. tab activo del `ViewerPanel`).

```
┌─────────────────────────────────────────────────────────┐
│ Topbar (logo / nombre del proyecto / acción global)      │
├───────────────────────┬───────────────────────────────────┤
│  Panel de entrada       │  ViewerPanel                       │
│  - UploadDropzone       │  Tabs: [ Piano Roll | Sheet Music ] │
│  - RecordControl        │                                     │
│  ------------------      │  Contenido activo:                 │
│  Panel de biblioteca     │  - PianoRollView   ó               │
│  - AudioList             │  - SheetMusicView                  │
│    (AudioListItem × n)   │                                     │
├───────────────────────┴───────────────────────────────────┤
│ PlaybackTransport + DownloadBar (barra inferior fija)      │
└─────────────────────────────────────────────────────────┘
```

- **Columna izquierda (Panel de entrada + biblioteca):** agrupa `UploadDropzone`, `RecordControl` y `AudioList`. Es la zona de "gestión de audios".
- **Columna/zona derecha (`ViewerPanel`):** zona de "resultado", con tabs para alternar entre Piano Roll y Sheet Music del audio seleccionado en la lista.
- **Barra inferior fija:** controles de reproducción del audio/MIDI activo + botones de descarga (MIDI/PDF), siempre visibles mientras hay un audio seleccionado.

Este layout es el que se adapta según breakpoint (ver sección 8).

---

## 7. Especificación por funcionalidad

### 7.1 Upload de audio — `UploadDropzone`

- **Propósito:** zona de arrastrar-y-soltar o click-para-explorar, únicamente visual.
- **Estados visuales:** idle, dragover (highlight de borde/fondo), file-selected (nombre + tamaño mock), error de formato (mock).
- **Elementos:** ícono de upload, texto principal ("Arrastra un audio o haz clic"), texto secundario (formatos aceptados, mock), botón "Examinar".
- **Responsive:** en mobile reduce a versión compacta (ícono + texto en una línea) para no ocupar media pantalla.

### 7.2 Grabación de audio — `RecordControl` + `RecordingWaveform` + `RecordingTimer`

- **Propósito:** control de grabación, puramente visual (sin `MediaRecorder` real en esta fase).
- **`RecordControl`:** botón circular principal con 3 estados visuales: idle, recording (animación `pulse-rec`), stopped.
- **`RecordingWaveform`:** representación de onda mientras se graba — en esta fase, animación con `waveform` sobre datos mock/estáticos.
- **`RecordingTimer`:** contador `mm:ss` en JetBrains Mono.
- **Responsive:** en mobile, este control puede colapsar bajo un tab o acordeón junto a `UploadDropzone` (ver sección 8).

### 7.3 Listado dinámico de audios — `AudioList` + `AudioListItem` + `AudioStatusBadge` + `AudioListEmptyState`

- **Propósito:** mostrar todos los audios subidos/grabados, cada uno con su estado de procesamiento.
- **Estados por item (`AudioStatusBadge`):** `ready`, `processing` (con animación `scan`), `queued`, `error`.
- **`AudioListItem` incluye:** nombre de archivo, duración (mock), timestamp, badge de estado, ícono de tipo (subido vs. grabado), estado de selección (item activo resaltado, sincronizado con `ViewerPanel`).
- **Animación de entrada:** nuevos items usan `rise-in`.
- **`AudioListEmptyState`:** ilustración/ícono + texto cuando no hay audios aún.
- **Responsive:** en mobile la lista pasa a ocupar el ancho completo y puede mostrarse como bottom sheet colapsable o como sección scrolleable superior (ver sección 8).

### 7.4 Descarga de MIDI y 7.5 Descarga de PDF — `DownloadBar` + `DownloadButton`

- **Propósito:** exponer acción de descarga para el audio actualmente seleccionado.
- **`DownloadBar`:** contenedor horizontal (glass) que agrupa ambos `DownloadButton`.
- **`DownloadButton`:** variante `midi` y variante `pdf`, cada una con ícono propio; estado `disabled` cuando el audio seleccionado no está en estado `ready`.
- **Ubicación:** integrado en la barra inferior fija junto a `PlaybackTransport`.
- **Responsive:** en mobile se muestra como par de botones compactos (solo ícono + label corto).

### 7.6 Vista MIDI — Piano Roll — `PianoRollView` + `PianoRollCanvas` + `PianoKeyboard` + `PianoRollTimeline`

- **Propósito:** representar visualmente el MIDI del audio seleccionado como notas tipo "piano roll".
- **`PianoRollView`:** contenedor de la sección, con textura `.roll-grid` de fondo.
- **`PianoRollCanvas`:** área principal donde "caerían" las notas — en esta fase, notas mock estáticas o con animación simple, sin sincronización real a audio.
- **`PianoKeyboard`:** teclado vertical lateral, resaltando teclas mock activas.
- **`PianoRollTimeline`:** regla superior de tiempo/compases.
- **Responsive:** en tablet/mobile el teclado puede reducir su ancho o convertirse en versión horizontal colapsada; el canvas mantiene scroll horizontal.

### 7.7 Vista PDF — Sheet Music (VexFlow) — `SheetMusicView` + `SheetMusicToolbar` + `SheetMusicPageControls`

- **Propósito:** representar la partitura generada a partir del MIDI.
- **`SheetMusicView`:** contenedor con textura `.staff-lines` de fondo, y área central donde se renderizaría el SVG de VexFlow (placeholder visual en esta fase).
- **`SheetMusicToolbar`:** controles de zoom, tonalidad detectada (mock, ej. "B♭ mayor"), botón exportar/descargar.
- **`SheetMusicPageControls`:** paginación cuando la partitura mock ocupa más de una página.
- **Responsive:** en mobile, toolbar colapsa a menú de ícono; la partitura permite zoom/pan táctil (solo contemplado a nivel de diseño, sin lógica aún).

---

## 8. Estrategia responsive

Breakpoints sugeridos (a definir como tokens si se desea, ej. `--bp-tablet`, `--bp-desktop`):

| Breakpoint | Rango aprox.     | Layout                                                                                                                                                                                                           |
| ---------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile     | `< 768px`        | Una sola columna. Navegación por tabs superiores: "Entrada", "Biblioteca", "Visor". `ViewerPanel` ocupa pantalla completa cuando está activo. Barra inferior fija con transport + downloads en versión compacta. |
| Tablet     | `768px – 1199px` | Dos zonas apiladas verticalmente: arriba panel de entrada + biblioteca (colapsable/acordeón), abajo `ViewerPanel` a ancho completo. Barra inferior fija igual que desktop pero con paddings reducidos.           |
| Desktop    | `≥ 1200px`       | Layout de 2 columnas descrito en sección 6: columna izquierda fija (entrada + biblioteca), columna derecha flexible (`ViewerPanel`). Barra inferior fija a todo el ancho.                                        |

**Reglas generales:**

- El `AppShell` es quien decide qué modo de layout renderizar según breakpoint (vía CSS Grid + media queries, no JS de detección de pantalla en esta fase).
- El componente `ViewerPanel` (tabs Piano Roll / Sheet Music) se comporta igual en los 3 tamaños — lo que cambia es cuánto espacio ocupa y si comparte pantalla con la biblioteca o no.
- La barra inferior (`PlaybackTransport` + `DownloadBar`) siempre permanece visible y fija en los 3 breakpoints, ajustando densidad de información (oculta labels de texto en mobile, deja solo íconos donde aplique).

---

## 9. Estados de interfaz a contemplar (visual, con datos mock)

Cada componente relevante debe diseñarse contemplando estos estados desde el inicio, aunque los datos sean mock:

- **Vacío:** sin audios aún (`AudioListEmptyState`), sin audio seleccionado (`ViewerPanel` muestra placeholder "Selecciona un audio").
- **Cargando/Procesando:** badge `processing` con animación `scan`, `DownloadButton` deshabilitado.
- **Error:** badge `error` en `AudioListItem`, posible tooltip/mensaje corto de error mock.
- **Éxito/Listo:** badge `ready`, `DownloadButton` habilitado, `ViewerPanel` con contenido renderizado.
- **Grabando:** `RecordControl` en estado activo con `pulse-rec`, `RecordingWaveform` animada, `RecordingTimer` corriendo (mock).

---

## 10. Datos mock

Reutilizar y extender el set de 5 entradas ya definido en Solfa (`audioLibrary.mock.js`), cubriendo los 4 estados (`ready`, `processing`, `queued`, `error`). Agregar:

- `pianoRoll.mock.js`: arreglo de notas mock (pitch MIDI, tiempo inicio, duración) suficiente para poblar visualmente `PianoRollCanvas` sin lógica real.
- `sheetMusic.mock.js`: estructura mock de compases/tonalidad suficiente para maquetar `SheetMusicView` sin VexFlow real conectado aún (puede ser un SVG estático de placeholder o notas de ejemplo).

Estos mocks viven en `src/mock/` y son la única fuente de datos en esta fase — ningún componente debe depender de fetch, backend, ni de MediaRecorder/Tone.js reales todavía.

---

## 11. Accesibilidad (consideraciones de diseño)

- Contraste suficiente entre `--color-ink` y fondos (`--color-base`, `--color-surface`), especialmente en badges de estado sobre glass.
- Todos los botones de ícono (`IconButton`, `DownloadButton`, controles de `PlaybackTransport`) deben diseñarse con `aria-label` previsto (aunque no haya lógica, dejar el atributo contemplado en el marcado).
- Estados de foco visibles (outline con `--color-sage`) para navegación por teclado, importante en un contexto de demo en vivo.
- Tamaños táctiles mínimos (~44px) en controles de mobile (`RecordControl`, tabs de `ViewerPanel`, botones de `DownloadBar`).

---

## 12. Fuera de alcance en esta fase (explícitamente)

- Conexión real a backend FastAPI / Basic Pitch.
- `MediaRecorder` funcional.
- Tone.js real (reproducción sincronizada).
- VexFlow real renderizando partitura desde datos reales.
- Descarga real de archivos (MIDI/PDF).
- Cualquier hook de estado global o manejo de lógica de negocio.

Todo lo anterior se añadirá en commits posteriores, usando esta estructura de componentes como base sin necesidad de reestructurar el árbol de carpetas.

---

## 13. Siguientes pasos sugeridos (roadmap, no ejecutar aún)

1. Validar/ajustar esta guía con el usuario.
2. Generar los tokens (`tokens.css`) y utilidades (`effects.module.css`, `animations.css`).
3. Construir `ui/` (primitivos) primero, ya que todo lo demás depende de ellos.
4. Construir `layout/` (AppShell, Topbar, ViewerPanel) para tener el esqueleto responsive navegable con placeholders.
5. Construir por feature: `audio-input/` → `audio-library/` → `playback/` + `downloads/` → `piano-roll/` → `sheet-music/`.
6. Poblar con mocks y revisar los 3 breakpoints antes de pasar a lógica real.

> Built with '\u{2665}' (♥) by Jesús Domínguez [@jdomingu19](https://github.com/jdomingu19/)
