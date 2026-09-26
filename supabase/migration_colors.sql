-- Migración: paleta apagada → paleta viva
-- Ejecuta esto en Supabase > SQL Editor si tus categorías tienen los colores anteriores

update public.categories set color = '#F97316' where color = '#D6A99C';
update public.categories set color = '#2563EB' where color = '#A8B8A0';
update public.categories set color = '#9333EA' where color = '#C4B5A5';
update public.categories set color = '#16A34A' where color = '#9CAF88';
update public.categories set color = '#DB2777' where color = '#D4C5A9';
update public.categories set color = '#0891B2' where color = '#B8A9C9';
update public.categories set color = '#65A30D' where color = '#93A8AC';
update public.categories set color = '#64748B' where color = '#A8A29E';
