-- Migración: iconos emoji → claves Lucide
-- Ejecuta esto en Supabase > SQL Editor si ya creaste categorías con la versión anterior

update public.categories set icon = 'food' where icon = '🍽';
update public.categories set icon = 'transport' where icon = '🚲';
update public.categories set icon = 'home' where icon = '⌂';
update public.categories set icon = 'health' where icon = '＋';
update public.categories set icon = 'fun' where icon = '☆';
update public.categories set icon = 'shopping' where icon = '○';
update public.categories set icon = 'bills' where icon = '◌';
update public.categories set icon = 'other' where icon = '◦';
