create extension if not exists pgcrypto;

create table if not exists public.atlases (
  id uuid primary key default gen_random_uuid(),
  share_id text not null unique,
  edit_token_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.entries (
  id text primary key,
  atlas_id uuid not null references public.atlases(id) on delete cascade,
  cover_url text not null default '',
  title text not null,
  entry_type text not null check (entry_type in ('Film', 'Series', 'Book')),
  genres text[] not null default '{}',
  finished date,
  aster numeric(2, 1) check (aster is null or (aster >= 0.5 and aster <= 5.0 and mod(aster * 10, 5) = 0)),
  notes text not null default '',
  private_notes jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists entries_atlas_id_idx on public.entries(atlas_id);

alter table public.atlases enable row level security;
alter table public.entries enable row level security;

revoke all on public.atlases from anon, authenticated;
revoke all on public.entries from anon, authenticated;

create or replace function public.hash_edit_token(p_edit_token text)
returns text
language sql
stable
as $$
  select encode(extensions.digest(p_edit_token, 'sha256'), 'hex');
$$;

create or replace function public.create_atlas(p_edit_token text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_share_id text;
begin
  if p_edit_token is null or length(p_edit_token) < 20 then
    raise exception 'invalid_edit_token';
  end if;

  loop
    v_share_id := lower(substr(encode(extensions.gen_random_bytes(9), 'hex'), 1, 12));

    begin
      insert into public.atlases (share_id, edit_token_hash)
      values (v_share_id, public.hash_edit_token(p_edit_token));

      return v_share_id;
    exception when unique_violation then
    end;
  end loop;
end;
$$;

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

create or replace function public.delete_entry(p_share_id text, p_edit_token text, p_entry_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_atlas_id uuid;
begin
  select a.id
  into v_atlas_id
  from public.atlases a
  where a.share_id = p_share_id
    and a.edit_token_hash = public.hash_edit_token(p_edit_token);

  if v_atlas_id is null then
    raise exception 'not_allowed';
  end if;

  delete from public.entries
  where id = p_entry_id
    and atlas_id = v_atlas_id;
end;
$$;

grant execute on function public.create_atlas(text) to anon, authenticated;
grant execute on function public.list_entries(text) to anon, authenticated;
grant execute on function public.upsert_entry(text, text, jsonb) to anon, authenticated;
grant execute on function public.delete_entry(text, text, text) to anon, authenticated;
