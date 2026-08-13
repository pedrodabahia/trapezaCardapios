-- Schema multi-tenant do pedidoPronto.
-- Rode uma vez no Supabase SQL Editor (Project > SQL Editor > New query).
-- Após este script, rode também `supabase/seed-simao.sql` para criar a primeira empresa
-- (Hotdog do Simão) com o cardápio de seed.

-- ============================================================
-- PLANOS
-- ============================================================
create table if not exists public.planos (
  id text primary key,
  nome text not null,
  preco_mensal numeric(10,2) not null default 0,
  limite_produtos int,
  tem_shopping boolean not null default false,
  tem_destaque boolean not null default false,
  tem_tv boolean not null default false,
  criado_em timestamptz not null default now()
);

insert into public.planos (id, nome, preco_mensal, limite_produtos) values
  ('start',    'Start',    49.90,  30),
  ('pro',      'Pro',      99.90,  100),
  ('pro_plus', 'Pro+',     149.90, null),
  ('premium',  'Premium',  249.90, null)
on conflict (id) do nothing;

-- ============================================================
-- EMPRESAS (tenants)
-- ============================================================
create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  whatsapp text not null,
  endereco text,
  pix_chave text,
  logo_url text,
  status_pagamento text not null default 'ativo'
    check (status_pagamento in ('ativo', 'atrasado', 'suspenso')),
  plano_id text not null default 'start'
    references public.planos(id),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create unique index if not exists empresas_slug_uidx on public.empresas (slug);

-- ============================================================
-- CONFIG POR EMPRESA (cores, cupons, bairros, horários, frete)
-- Substitui a antiga store_settings singleton.
-- ============================================================
create table if not exists public.empresa_config (
  empresa_id uuid primary key references public.empresas(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

-- ============================================================
-- CATEGORIAS (categorias de PRODUTO — ex: Hot dogs, Bebidas)
-- ============================================================
create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  slug text not null,
  nome text not null,
  emoji text,
  imagem_url text,
  ordem int not null default 0,
  ativo boolean not null default true,
  -- ids de categorias_opcao (definidas abaixo) que se aplicam aos produtos
  -- dessa categoria — ex: produtos de "Hot dogs" usam as categorias de
  -- adicional "Tipo de pão" e "Molhos".
  categorias_opcao_ids uuid[] not null default '{}',
  criado_em timestamptz not null default now(),
  unique (empresa_id, slug)
);

create index if not exists categorias_empresa_idx on public.categorias (empresa_id, ordem);

-- ============================================================
-- PRODUTOS
-- ============================================================
create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  categoria_id uuid references public.categorias(id) on delete set null,
  nome text not null,
  descricao_curta text,
  descricao text,
  preco numeric(10,2) not null,
  preco_antigo numeric(10,2),
  imagem_url text,
  ingredientes text[] not null default '{}',
  nutricao jsonb not null default '{}'::jsonb,
  tempo_preparo text,
  tag text check (tag in ('mais-vendido', 'promocao', 'novo')),
  ordem int not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists produtos_empresa_idx on public.produtos (empresa_id, ordem);
create index if not exists produtos_categoria_idx on public.produtos (empresa_id, categoria_id);

-- ============================================================
-- CATEGORIAS DE OPÇÃO (categorias de ADICIONAL — definidas pela
-- própria empresa, ex: "Tipo de pão", "Sabor", "Molhos")
-- ============================================================
create table if not exists public.categorias_opcao (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  slug text not null,
  nome text not null,
  selecao text not null default 'unica'
    check (selecao in ('unica', 'multipla')),
  obrigatorio boolean not null default false,
  ordem int not null default 0,
  criado_em timestamptz not null default now(),
  unique (empresa_id, slug)
);

create index if not exists categorias_opcao_empresa_idx on public.categorias_opcao (empresa_id, ordem);

-- ============================================================
-- OPÇÕES DE PERSONALIZAÇÃO (por empresa, dentro de uma categoria_opcao)
-- ============================================================
create table if not exists public.opcoes_personalizacao (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  categoria_opcao_id uuid not null references public.categorias_opcao(id) on delete cascade,
  nome text not null,
  preco_adicional numeric(10,2) not null default 0,
  ordem int not null default 0,
  unique (categoria_opcao_id, nome)
);

create index if not exists opcoes_empresa_idx on public.opcoes_personalizacao (empresa_id, categoria_opcao_id, ordem);

-- ============================================================
-- TRIGGER updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists empresas_set_updated_at on public.empresas;
create trigger empresas_set_updated_at
  before update on public.empresas
  for each row execute function public.set_updated_at();

drop trigger if exists empresa_config_set_updated_at on public.empresa_config;
create trigger empresa_config_set_updated_at
  before update on public.empresa_config
  for each row execute function public.set_updated_at();

drop trigger if exists produtos_set_updated_at on public.produtos;
create trigger produtos_set_updated_at
  before update on public.produtos
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS
-- Toda tabela de catálogo tem SELECT público. Tenant é filtrado
-- na camada de aplicação a partir do slug.
-- Service role ignora RLS — server fns escrevem sem policy extra.
-- ============================================================
alter table public.planos                enable row level security;
alter table public.empresas              enable row level security;
alter table public.empresa_config        enable row level security;
alter table public.categorias            enable row level security;
alter table public.categorias_opcao      enable row level security;
alter table public.produtos              enable row level security;
alter table public.opcoes_personalizacao enable row level security;

drop policy if exists "public can read planos"          on public.planos;
drop policy if exists "public can read empresas"        on public.empresas;
drop policy if exists "public can read empresa_config"  on public.empresa_config;
drop policy if exists "public can read categorias"      on public.categorias;
drop policy if exists "public can read categorias_opcao" on public.categorias_opcao;
drop policy if exists "public can read produtos"        on public.produtos;
drop policy if exists "public can read opcoes"          on public.opcoes_personalizacao;

create policy "public can read planos"          on public.planos          for select using (true);
create policy "public can read empresas"        on public.empresas        for select using (true);
create policy "public can read empresa_config"  on public.empresa_config  for select using (true);
create policy "public can read categorias"      on public.categorias      for select using (true);
create policy "public can read categorias_opcao" on public.categorias_opcao for select using (true);
create policy "public can read produtos"        on public.produtos        for select using (true);
create policy "public can read opcoes"          on public.opcoes_personalizacao for select using (true);

-- Sem policies de INSERT/UPDATE/DELETE para anon/authenticated:
-- toda escrita passa pelo service_role em server fns.