# Guía de estilo visual — expenses (para replicar en nuevas apps)

Sistema de diseño real de la app `expenses` (Next.js + HeroUI v3). Si vas a crear
otra app con el mismo estilo, sigue este documento al pie de la letra.

## 1. Principios

- **Calma y minimalismo**: solo la info necesaria, mucho aire, nada decorativo.
- **Mobile-first**: columna centrada `max-w-xl`, una sola columna; rejillas solo
  donde aportan (2 cols móvil / 3 desktop en categorías).
- **Consistencia > originalidad**: mismos radios, mismos espaciados, mismos patrones
  de formulario en toda la app.

## 2. Stack técnico (obligatorio replicar)

| Pieza | Elección |
|---|---|
| Framework | Next.js App Router + TypeScript |
| UI | **HeroUI v3** (`@heroui/react` + `@heroui/styles`), API compuesta (`Card.Content`, `Select.Trigger`, `Modal.Dialog`…) |
| CSS | Tailwind CSS v4 (`@import "tailwindcss"; @import "@heroui/styles";`) |
| Iconos | **lucide-react** (nada de emojis en la UI; solo como fallback legacy) |
| Animación | **framer-motion** (`MotionConfig reducedMotion="user"`, Stagger + FadeIn propios) |
| Fuente | Inter (`next/font/google`), `tabular-nums` en todos los números |
| Forms | Inputs **no controlados** + `FormData` → Server Actions (sin `useActionState`) |
| i18n | ES/EN propio: diccionarios tipados + cookie + `LanguageProvider`/`useLang()` |
| Datos | Solo **Server Actions**; sin API Routes propias; Supabase con RLS |

## 3. Tema y color

- Base: **tema default de HeroUI** (neutro claro/oscuro), sin personalizar fondos.
- **Un solo acento** configurable vía variables CSS en `app/globals.css`:
  ```css
  :root { --accent: #4338ca; --accent-foreground: #ffffff; }
  .dark { --accent: #a5b4fc; --accent-foreground: #1e1b4b; }
  ```
  (En expenses el acento es índigo; una app nueva debe usar **otro color**.)
- Claro/oscuro: clase `.dark` en `<html>`, script pre-pintado (`next/script`
  `beforeInteractive`) que lee `localStorage` o `prefers-color-scheme`,
  `color-scheme: light/dark` correspondiente y toggle sol/luna en el header.
- `theme-color` en `viewport` según modo; `touch-action: manipulation` en `body`.
- Tokens que SÍ se usan: `bg-background`, `bg-surface`, `bg-default`, `bg-accent`,
  `text-foreground`, `text-muted`, `text-accent-foreground`, `text-danger`,
  `text-success`, `border-border`, `border-separator`.
- Colores de datos (categorías): paleta viva fija de 12 hex
  (`#F97316 #2563EB #9333EA #16A34A #DB2777 #0891B2 #65A30D #64748B #EF4444 #EAB308 #0D9488 #4F46E5`),
  chips con tinte `color + "40"` e icono a color pleno (`strokeWidth 2.2`).

## 4. Layout

- Header `sticky` con blur: marca (`translate="no"`) a la izquierda; a la derecha
  primer nombre + idioma (globo + "EN/ES") + tema + "Salir".
- Navegación por `Tabs` (no sidebar): 4–5 pestañas cortas.
- Contenido: `main#main-content` (`skip link` "Saltar al contenido"), `px-5 py-6`,
  secciones separadas con `gap-5`, titulares `text-2xl font-semibold tracking-tight text-balance`.

## 5. Componentes y patrones

- **Cards**: `Card > Card.Content (p-4/p-5)`. Filas de lista: `Card > Card.Content > div.flex.items-center`
  (¡el `flex` va en un div interno: `Card.Content` es columna por defecto!).
- **Formularios**: `TextField(fullWidth, isRequired, name, type) > Label + Input + Description? + FieldError?`;
  `Select(name, placeholder, variant="secondary" en modales) > Label + Trigger(Value+Indicator) + Popover(ListBox > Item[id, textValue] + ItemIndicator)`.
  `autocomplete` correcto (`email/new-password/current-password`), `spellCheck={false}` en emails,
  `inputMode="decimal"`, errores inline + `aria-live="polite"`.
- **Botones**: `primary` (CTA), `outline` (alternativo/Google), `ghost`/`tertiary` (sutil),
  `danger`/`danger-soft` (destructivo). Submit: `isDisabled={pending}` + `Spinner size="sm" color="current"`.
  Navegación con `<a>`/`<Link>` reales (no `router.push` en botones), salvo `Tabs`.
- **Modales**: `Modal > Button(directo) + Backdrop > Container(placement="center") > Dialog(render-prop {close}) > CloseTrigger + Header(Heading) + Body + Footer`.
  Controlados con `useOverlayState()` + prop `state` cuando se abren por código.
- **Confirmaciones destructivas**: modal dedicado (título, mensaje, Cancelar/Eliminar), nunca `confirm()`.
- **Éxitos**: `toast.success()` (con `Toast.Provider` global). Errores: inline junto al campo.
- **Borrados en lista**: botón `×`/`X` fantasma que abre el modal de confirmación.
- **Selectores**: rejilla de iconos (`IconPicker`, `grid-cols-5`, `aria-pressed`, `hidden input`).
- **Gráficas propias** en SVG (donut/pie con tooltip al hover + leyenda sincronizada;
  barras con `ProgressBar` + `Fill style={{width, background}}`).
- **Estados vacíos**: Card centrada con `○`, título y subtítulo. Listas con `Stagger/StaggerItem`.

## 6. Animación

- Entrada: `FadeIn` (secciones, delays 0/0.05/0.1) y `Stagger` (listas, `staggerChildren 0.06`,
  `y:14, duration 0.32`). Las listas se re-animan al cambiar datos (`key` por ids).
- Modales/toasts: animaciones propias de HeroUI. Nada de `transition: all`.

## 7. Copy (español)

- Segunda persona, voz activa, frases cortas. Botones específicos ("Guardar gasto", no "Continuar").
- Elipsis `…` (nunca `...`), `tabular-nums` en cifras, moneda con `Intl.NumberFormat`,
  fechas con `toLocaleDateString`. Marca con `translate="no"`.

## 8. Backend (convenciones)

- Server Actions con `"use server"`, validación `zod`, `revalidatePath` por ruta.
- RLS `user_id = auth.uid()` en todo; triggers para perfil+semillas; funciones
  `SECURITY DEFINER` solo para lo que el usuario no puede hacer solo (borrar cuenta,
  chequear admin). **Jamás `service_role` en la app.**
- Migraciones numeradas en `supabase/migration_*.sql` + `schema.sql` al día.
- Fechas "hoy" siempre en **zona horaria del usuario** (cookie `expenses-tz`,
  `todayISOInTZ`), nunca `toISOString()` del servidor; inputs de fecha con default local.
