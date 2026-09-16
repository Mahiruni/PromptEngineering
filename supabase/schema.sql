-- PromptForge Business production data model
-- Designed for 10,000+ prompts and future semantic search.
create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  prompt text not null,
  use_case text,
  category text not null,
  industry text,
  difficulty text not null check (difficulty in ('Beginner','Intermediate','Advanced')),
  tags text[] not null default '{}',
  example_input text,
  example_output text,
  expert_tips text[] not null default '{}',
  variations jsonb not null default '[]'::jsonb,
  quality_score numeric(4,2) not null default 0,
  rating_count integer not null default 0,
  is_published boolean not null default true,
  is_premium boolean not null default false,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prompts_category_idx on prompts(category);
create index if not exists prompts_difficulty_idx on prompts(difficulty);
create index if not exists prompts_published_idx on prompts(is_published);
create index if not exists prompts_tags_idx on prompts using gin(tags);
create index if not exists prompts_search_idx on prompts using gin(to_tsvector('english', title || ' ' || description || ' ' || prompt));
create index if not exists prompts_embedding_idx on prompts using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create table if not exists prompt_ratings (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references prompts(id) on delete cascade,
  user_id uuid not null,
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique(prompt_id,user_id)
);

create table if not exists prompt_saves (
  user_id uuid not null,
  prompt_id uuid not null references prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id,prompt_id)
);

create table if not exists prompt_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  description text,
  is_shared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists collection_prompts (
  collection_id uuid not null references prompt_collections(id) on delete cascade,
  prompt_id uuid not null references prompts(id) on delete cascade,
  position integer not null default 0,
  primary key(collection_id,prompt_id)
);

create table if not exists prompt_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  prompt_id uuid not null references prompts(id) on delete cascade,
  action text not null check (action in ('view','copy','save','improve','rate')),
  created_at timestamptz not null default now()
);

create table if not exists learning_progress (
  user_id uuid not null,
  path_slug text not null,
  lesson_slug text not null,
  completed_at timestamptz,
  primary key(user_id,path_slug,lesson_slug)
);

-- Scale-ready semantic retrieval function. Populate embedding asynchronously when prompts are inserted/updated.
create or replace function match_prompts(query_embedding vector(1536), match_count int default 24)
returns table(id uuid, title text, description text, category text, difficulty text, similarity float)
language sql stable as $$
  select p.id,p.title,p.description,p.category,p.difficulty,1-(p.embedding <=> query_embedding) as similarity
  from prompts p
  where p.is_published=true and p.embedding is not null
  order by p.embedding <=> query_embedding
  limit match_count;
$$;
