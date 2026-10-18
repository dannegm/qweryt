# qweryt — Plan

Generador de QR gratuito, mobile first (PWA instalable) con layout propio de desktop. "QR it". Todo es público y anónimo; la identidad es la misma que en pinia y filapp.

## Alcance v1

- Contenido: URL, texto, WiFi, vCard y tipos extra (email, SMS, geolocalización, evento) como registro extensible.
- Personalización total del QR: forma de ojos, forma de píxeles, colores, logo al centro, corrección de errores. El tamaño del QR es fijo (viewBox universal); solo el logo es ajustable, con advertencias.
- Exportar a PNG, JPG y SVG.
- Biblioteca propia: cards estilo Apple Wallet (QR arriba, detalles abajo, color por card). Buscar, editar, duplicar, borrar.
- Link público por QR: `/q/<nanoid>`, URL armada con `location.origin`.
- URLs: se guarda la URL original, sin tracking ni redirección propia. Acortar es un switch opcional, apagado por defecto, usando `https://s.hckr.mx` como caja negra.
- Dado: randomiza todos los parámetros de estilo y el color de la card. No toca el contenido ni el logo.
- UI en inglés, con `react-i18next` desde el inicio para sumar idiomas después.

Fuera de v1: tracking de escaneos, redirecciones, cuentas, revocar links, borrar links cortos.

## Stack

Igual que filapp y pinia: React 19 + Vite 8, JS plano (sin TypeScript), pnpm, Node 24. TanStack Router (rutas en `src/router.jsx`) y Query, nuqs, Tailwind v4 (config CSS), shadcn sobre base-ui, Lucide, sonner, motion, nanoid, fuse.js, DiceBear shape-grid para el avatar, `react-i18next`. Supabase con schema propio `qweryt`, en el mismo proyecto que bins, pinia y filapp. Despliegue en Vercel, `qweryt.hckr.mx`.

## Arquitectura

Cada capa solo conoce a las de abajo.

### 1. Motor (`src/engine/`) — JS puro, sin React, DOM ni Supabase

- `matrix.js`: envuelve la librería que genera la matriz de módulos. Es lo único que la conoce.
- `render.js`: `render(content, style) → string SVG`. Función pura. La usan la preview, las cards, la página pública y la exportación.
- `export.js`: SVG → PNG/JPG vía canvas a resolución fija. Única parte que toca el navegador.
- `guards.js`: elige la corrección de errores (alta si hay logo) y calcula advertencias de tamaño de logo y contraste.

### 2. Tipos de contenido (`src/content-types/`) — registro de datos

Cada tipo: `{ id, icon, fields, encode(values) → string, summary(values) }`. La tab Contenido pinta los campos desde `fields`; la card muestra `summary`. Agregar un tipo = agregar un archivo.

Tipo URL: `content = { url, shorten: false, short_url: null }`. `encode` devuelve `short_url` si `shorten` está encendido y `url` si no.

### 3. Opciones de estilo (`src/style-options/`) — registro de datos

Cada opción: `{ key, label, control, options, random() }`. La tab Personalizar se genera desde el registro y el dado recorre el mismo registro llamando a `random()`. Una opción nueva entra al dado sin código extra; el renderer solo debe saber dibujarla.

### 4. Editor (`src/components/editor/`)

`QrEditor` trabaja sobre un borrador local `{ type, values, style, cardColor, title }`. No sabe si crea, edita o duplica; solo cambian el borrador inicial y la mutación.

- Crear: borrador vacío.
- Duplicar: borrador del QR origen sin id.
- Editar: borrador del QR existente, guarda con update.

Layout: preview arriba en mobile y al lado en desktop. Tabs: Content / Customize / Settings.

### 5. Pickers y contenedores

`ColorSelector`, icon picker y demás son de contenido puro (`value`/`onChange`). El contenedor lo decide un wrapper `responsive-*`: en mobile siempre `Drawer` (no existen dropdowns, popovers ni diálogos); en desktop popover, diálogo o menú.

### 6. Datos (`src/queries/`)

Queries y mutations como factories de TanStack Query. La UI nunca toca Supabase directo.

### 7. Shell de plataforma — se porta tal cual de filapp y pinia

`ensureIdentity()`, `settings` y `cache` (localStorage con `BroadcastChannel`), compartir settings (`#share=`), `DeviceProvider` y variantes CSS, `BusProvider`, service worker con precache, scripts de íconos y splash, barra falsa de iOS, safe area, Borrar datos.

### 8. Acortador (`src/services/shortener.js`)

`shorten(url) → short`. Solo manda la URL, sin `code`. Se llama cuando se enciende el switch con URL válida y cuando la URL cambia y el campo pierde el foco, no mientras se escribe. `short_url` es de solo lectura. Si la URL cambia, se pide uno nuevo y se reemplaza.

## Datos (schema `qweryt`)

- `profiles`: `id text pk` (nanoid(10)), `name`, `color`, `created_at`, `updated_at`.
- `qrs`: `id text pk` (nanoid(8)), `profile_id` → `profiles` (cascade), `title`, `type`, `content jsonb`, `style jsonb`, `card_color`, `v int` (versión del esquema de content/style), `created_at`, `updated_at`.
- Logo: data URI reducido (~128px, máx. ~50 KB) dentro de `style`. Sin bucket.
- RLS abierto (`using (true) with check (true)`), como pinia y filapp. El dueño se decide en la UI: `qr.profile_id === settings.user.id` habilita editar y borrar.
- Búsqueda: cliente (fuse.js, sin acentos) sobre los QR propios.
- `db.sql` es el estado canónico; el historial va en `migrations/NNN_slug.sql`, siempre vía el skill `/migrate` (copiado de bins y adaptado).

## Rutas

- `/` — biblioteca (cards + buscador)
- `/new` — editor, crear
- `/q/$id` — página pública del QR (detalles, descarga; si eres dueño: editar, duplicar, borrar)
- `/q/$id/edit` — editor, editar
- `/q/$id/duplicate` — editor, duplicar
- `/settings` — identidad, compartir/aplicar settings, instalar, Borrar datos

## Fases

Una feature a la vez: implemento, resumo qué cambió y qué probar, y espero tu confirmación antes de seguir. Tú verificas todo a mano.

1. **Scaffold:** Vite, dependencias, Tailwind, `components.json`, providers, router, portar `ui/` y helpers base, i18n, `.env`, skill `/migrate`, `CLAUDE.md` y `AGENTS.md`.
2. **Datos e identidad:** migración 001 y `db.sql`, cliente de Supabase, `ensureIdentity`, `profiles`, queries de `qrs`.
3. **Motor mínimo:** matriz, render con estilo por defecto, tipos Text y URL, preview.
4. **Editor base:** layout responsive, tabs, borrador, guardar y crear, tipos WiFi y vCard.
5. **Estilo:** registro de opciones y renderer: ojos, píxeles, colores, logo, corrección de errores y advertencias.
6. **Biblioteca:** cards estilo wallet, buscador, borrar, editar, duplicar.
7. **Página pública** `/q/$id`.
8. **Exportar:** PNG, JPG y SVG.
9. **Acortador:** switch en el tipo URL.
10. **Dado.**
11. **Tipos extra:** email, SMS, geolocalización, evento.
12. **Settings, PWA y pulido:** compartir settings, Borrar datos, service worker, íconos, splash, offline.

## Convenciones

Las de filapp y pinia:

- JS plano, `export const`, sin default exports, archivos y carpetas en kebab-case.
- `$` en los refs, `async/await`, sin comentarios obvios.
- `cn()` con objetos; valores dinámicos por CSS custom properties; íconos con `[&>svg]:size-X`; `rem` sobre `px`; cada `shadow-*` con color.
- Estados de carga, vacío y error extraídos a componentes con early return; `match()` en vez de ternarios anidados.
- Sin strings de UI hardcodeados (`useTranslation`, una instancia por archivo).
- Mobile: viewport sin zoom, `viewport-fit=cover`, `min-h-dvh`, `pt-safe`/`pb-safe`, inputs a 16px, targets táctiles ≥ 40px. Estilos sin prefijo son mobile; `sm:`/`lg:` encima para desktop.
- Antes de crear UI propia, revisar `src/ui/` y el registry de shadcn.
- Nunca git: el dueño hace stage, commit y push.

## Por confirmar durante la ejecución

- Qué librería concreta genera la matriz del QR.
- Contenido exacto de la tab Settings del editor. Propuesta: título, color de card, formato de exportación y acciones de descarga.
- Interacción exacta del stack de cards estilo wallet (se define en la fase 6).
