# PROMPT — Plan de la app `habits` (tracker de hábitos)

> Pégale esto a otro chat. Le pide generar EL PLAN (no código todavía).

---

Quiero crear una web llamada **habits** para llevar un registro de mis hábitos, con el
**mismo estilo visual y stack de mi app `expenses`**. Lee primero la guía de estilo
`habits-style-guide.md` (te la pego al final si no la tienes) y respétala al pie de la letra,
con una excepción: el **color primario debe ser diferente** (expenses usa índigo `#4338ca`;
propón uno con identidad propia, p. ej. esmeralda, y úsalo en acento, icono PWA y focos).

## Stack obligatorio

Next.js (App Router + TypeScript) + HeroUI v3 + Tailwind v4 + lucide-react +
framer-motion + Supabase (Auth + Postgres + RLS) + **Server Actions únicamente**
(sin backend propio ni API Routes). ES/EN con el mismo sistema de diccionarios,
modo claro/oscuro con toggle, PWA instalable (manifest + icono + service worker mínimo).

## Qué debe hacer la app

1. **Hábitos CRUD con categorías**: crear (nombre, categoría con icono, tipo, color
   automático, hábito siguiente encadenado opcional), listar, editar, eliminar
   (con modal de confirmación). Categorías con iconos Lucide y paleta viva, como en expenses.
2. **Dos tipos de hábito** (diferéncialos en UI, copy y reportes):
   - **CONSTRUIR** (positivo, ej. "Tender la cama"): el éxito es HACERLO. Marcar
     completo = "lo hice".
   - **EVITAR** (negativo, ej. "No beber bebidas energéticas hoy"): el éxito es NO
     hacerlo. Marcar completo = "lo logré, no caí"; marcar no completado = "recaí".
   La racha cuenta días exitosos consecutivos en ambos; el copy, iconos y gráficas
   deben reflejar la diferencia (p. ej. "días limpio" vs "veces hecho").
3. **Racha por hábito**: cada hábito tiene su racha visible (llama + número + récord).
   Reutiliza el motor de rachas de expenses (congelamiento que se gana con 2 días
   seguidos, día pendiente hoy, reinicio tras 2 fallos) salvo que propongas algo mejor
   y justificado. Contempla día sin registro: cuenta como fallado salvo regla que definas.
4. **Encadenamiento**: cada hábito puede tener UN hábito siguiente opcional
   (`next_habit_id`). Al marcar un hábito (completo o no), si tiene siguiente encadenado,
   se abre automáticamente ese; si no, se cierra. Valida que no haya ciclos en la cadena
   (A→B→A prohibido) al guardar.
5. **Flashcards con swipe**: los hábitos se ven en una lista, pero al abrir uno se muestra
   como tarjeta grande. **Deslizar a la izquierda = no completado, a la derecha = completado**
   (implementa con drag de framer-motion; OBLIGATORIO: botones equivalentes + flechas de
   teclado por accesibilidad, y que funcione con mouse en desktop). Tras marcar, avanza al
   encadenado o cierra. Solo se puede marcar el día actual (o como definas en el plan).
6. **Reportes por hábito**: tasa de cumplimiento últimos 30 días (barras), racha actual e
   histórica, mejor racha, calendario/heatmap del mes y gráfica global. Conmutador
   barras/torta donde tenga sentido, como en expenses.
7. **Auth y ajustes**: login email + Google (igual que expenses), moneda NO aplica;
   ajustes con perfil, idioma, tema y zona de peligro (reiniciar rachas, eliminar cuenta).

## Entidades sugeridas (a confirmar en tu plan)

`habit_categories(id, user_id, name, icon, color)`,
`habits(id, user_id, name, type[build|avoid], category_id, next_habit_id→habits, color?, created_at)`,
`habit_logs(id, user_id, habit_id, date, status[done|missed], unique(habit_id,date))`.
Define RLS por usuario, índices y cómo se calcula la racha (¿derivada como expenses o tabla de estado?).

## Lo que te pido AHORA

**Crea el plan primero, sin escribir código.** Debe incluir: alcance MVP vs fuera de alcance,
arquitectura de rutas (`/hoy`, `/habitos`, `/informes`, `/ajustes` u otras que propongas),
esquema SQL + RLS, flujo exacto de encadenamiento y flashcards (incl. casos borde: ciclos,
cadenas largas, días pasados), sistema de rachas, gráficas, fases de implementación y
qué decisiones dejas abiertas con tu recomendación. Pregúntame lo que necesites
(hora de "cierre del día", si los hábitos tienen días de descanso programados, etc.)
antes de dar el plan por finalizado.
