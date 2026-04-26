alter table public.entries
add column if not exists private_notes jsonb;

drop function if exists public.list_entries(text);

create or replace function public.list_entries(p_share_id text)
returns table (
  id text,
  cover_url text,
  title text,
  entry_type text,
  genres text[],
  finished text,
  aster numeric,
  notes text,
  private_notes jsonb,
  created_at text
)
language sql
security definer
set search_path = public
as $$
  select
    e.id,
    e.cover_url,
    e.title,
    e.entry_type,
    e.genres,
    coalesce(to_char(e.finished, 'YYYY-MM-DD'), '') as finished,
    e.aster,
    e.notes,
    e.private_notes,
    e.created_at::text
  from public.entries e
  join public.atlases a on a.id = e.atlas_id
  where a.share_id = p_share_id
  order by e.finished desc nulls last, e.created_at desc;
$$;

create or replace function public.upsert_entry(p_share_id text, p_edit_token text, p_entry jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_atlas_id uuid;
  v_genres text[];
begin
  select a.id
  into v_atlas_id
  from public.atlases a
  where a.share_id = p_share_id
    and a.edit_token_hash = public.hash_edit_token(p_edit_token);

  if v_atlas_id is null then
    raise exception 'not_allowed';
  end if;

  select coalesce(array_agg(value), '{}')
  into v_genres
  from jsonb_array_elements_text(coalesce(p_entry->'genres', '[]'::jsonb)) as value;

  insert into public.entries (
    id,
    atlas_id,
    cover_url,
    title,
    entry_type,
    genres,
    finished,
    aster,
    notes,
    private_notes,
    created_at,
    updated_at
  )
  values (
    p_entry->>'id',
    v_atlas_id,
    coalesce(p_entry->>'coverUrl', ''),
    p_entry->>'title',
    coalesce(nullif(p_entry->>'type', ''), 'Film'),
    v_genres,
    nullif(p_entry->>'finished', '')::date,
    nullif(p_entry->>'aster', '')::numeric,
    coalesce(p_entry->>'notes', ''),
    nullif(p_entry->>'privateNotes', '')::jsonb,
    coalesce(nullif(p_entry->>'createdAt', '')::timestamptz, now()),
    now()
  )
  on conflict (id) do update
  set
    cover_url = excluded.cover_url,
    title = excluded.title,
    entry_type = excluded.entry_type,
    genres = excluded.genres,
    finished = excluded.finished,
    aster = excluded.aster,
    notes = excluded.notes,
    private_notes = excluded.private_notes,
    updated_at = now()
  where public.entries.atlas_id = v_atlas_id;
end;
$$;
