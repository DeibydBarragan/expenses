# expenses · gastos con calma

Web minimalista para registrar gastos diarios. Next.js + Server Actions + Supabase.

## Puesta en marcha

1. **Crea el proyecto en Supabase** (https://supabase.com) y ejecuta `supabase/schema.sql` en el SQL Editor.
   Esto crea `profiles`, `categories`, `expenses`, las políticas RLS y el trigger que genera
   el perfil + 8 categorías al registrarse (con la moneda elegida).

2. **Auth > Providers > Google**: activa Google y añade como redirect:
   `https://tu-proyecto.supabase.co/auth/v1/callback` y en tu app `NEXT_PUBLIC_SITE_URL/auth/callback`.

3. **Variables de entorno** — copia `.env.example` a `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Arranca**:
   ```
   npm install
   npm run dev
   ```

## Estructura

- `app/page.tsx` — landing
- `app/login`, `app/registro` — auth email + Google (moneda elegible al registrarse, COP por defecto)
- `app/(app)/inicio` — dashboard (total mes/hoy, top categorías, recientes)
- `app/(app)/gastos` — lista + alta
- `app/(app)/informes` — por mes y categoría (`?y=2026&m=9`)
- `app/(app)/categorias` — gestión simple
- `actions/` — solo Server Actions, sin API propia
- `proxy.ts` — refresco de sesión + protección de rutas (nuevo nombre de middleware en Next 16)
