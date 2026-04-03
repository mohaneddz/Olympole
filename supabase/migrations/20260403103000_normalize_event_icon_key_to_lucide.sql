alter table public.events
alter column icon_key set default 'Trophy';

update public.events
set icon_key = 'Trophy'
where icon_key is null
   or trim(icon_key) = ''
   or icon_key in (
     '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🎯', '🎮', '🎲', '🎳',
     '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱'
   );
