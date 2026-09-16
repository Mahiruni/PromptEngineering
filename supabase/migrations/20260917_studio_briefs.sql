create table if not exists public.studio_briefs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new',
  business_name text not null,
  project_type text not null,
  business_description text not null,
  audience text not null,
  primary_goal text not null,
  desired_action text,
  style text not null,
  pages text not null,
  features text,
  references text,
  avoid text,
  budget text not null,
  timeline text not null,
  name text not null,
  email text not null
);

alter table public.studio_briefs enable row level security;

grant insert on public.studio_briefs to anon, authenticated;

create policy "studio briefs can be submitted"
on public.studio_briefs
for insert
to anon, authenticated
with check (true);
