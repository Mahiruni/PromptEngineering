create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists prompts (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  description text not null, prompt text not null, use_case text,
  difficulty text not null check (difficulty in ('Beginner','Intermediate','Advanced')),
  industry text, category text not null, tags text[] not null default '{}',
  search_text tsvector generated always as (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(prompt,'') || ' ' || coalesce(category,'') || ' ' || coalesce(industry,'') || ' ' || array_to_string(tags,' '))) stored,
  embedding vector(1536), featured boolean not null default false, published boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists prompts_search_idx on prompts using gin(search_text);
create index if not exists prompts_category_idx on prompts(category);
create index if not exists prompts_difficulty_idx on prompts(difficulty);
create index if not exists prompts_tags_idx on prompts using gin(tags);
create index if not exists prompts_embedding_idx on prompts using hnsw (embedding vector_cosine_ops);

create table if not exists prompt_examples (
  id uuid primary key default gen_random_uuid(), prompt_id uuid not null references prompts(id) on delete cascade,
  label text not null, input text, output text not null, sort_order integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists prompt_ratings (
  id uuid primary key default gen_random_uuid(), prompt_id uuid not null references prompts(id) on delete cascade,
  user_id uuid not null, rating smallint not null check (rating between 1 and 5), created_at timestamptz not null default now(), unique(prompt_id,user_id)
);
create table if not exists saved_prompts (
  user_id uuid not null, prompt_id uuid not null references prompts(id) on delete cascade, created_at timestamptz not null default now(), primary key(user_id,prompt_id)
);
create table if not exists collections (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, name text not null, description text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists collection_prompts (
  collection_id uuid not null references collections(id) on delete cascade, prompt_id uuid not null references prompts(id) on delete cascade,
  sort_order integer not null default 0, primary key(collection_id,prompt_id)
);
create table if not exists prompt_usage (
  id uuid primary key default gen_random_uuid(), user_id uuid, prompt_id uuid not null references prompts(id) on delete cascade,
  action text not null check (action in ('view','copy','save','improve','rate')), created_at timestamptz not null default now()
);
create table if not exists learning_progress (
  user_id uuid not null, path_slug text not null, lesson_slug text not null, completed_at timestamptz,
  primary key(user_id,path_slug,lesson_slug)
);

create or replace function match_prompts(query_embedding vector(1536), match_threshold float default 0.72, match_count int default 30)
returns table(id uuid,title text,description text,prompt text,category text,industry text,difficulty text,similarity float)
language sql stable as $$
 select p.id,p.title,p.description,p.prompt,p.category,p.industry,p.difficulty,1-(p.embedding <=> query_embedding) as similarity
 from prompts p where p.published=true and p.embedding is not null and 1-(p.embedding <=> query_embedding)>=match_threshold
 order by p.embedding <=> query_embedding limit match_count;
$$;
