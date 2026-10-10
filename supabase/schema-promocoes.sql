-- ============================================================
-- TRAPEZA PROMOÇÕES
-- Promoções são uma entidade própria e NÃO dependem de produtos.
-- Uma empresa pode publicar várias promoções ao longo do tempo.
-- ============================================================

create table if not exists public.promocoes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  titulo text not null,
  slug text not null unique,
  descricao text,
  imagem_url text,
  preco_anterior numeric(10,2),
  preco_promocional numeric(10,2),
  valido_de timestamptz,
  valido_ate timestamptz,
  status text not null default 'rascunho'
    check (status in ('rascunho', 'ativa', 'pausada', 'expirada')),
  destaque boolean not null default false,
  criado_por uuid,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  check (
    preco_anterior is null
    or preco_promocional is null
    or preco_promocional <= preco_anterior
  ),
  check (
    valido_de is null
    or valido_ate is null
    or valido_ate >= valido_de
  )
);

create index if not exists promocoes_empresa_idx
  on public.promocoes (empresa_id, criado_em desc);

create index if not exists promocoes_status_validade_idx
  on public.promocoes (status, valido_de, valido_ate);

create table if not exists public.promocoes_categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  emoji text,
  ativo boolean not null default true,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);

create table if not exists public.promocao_categoria_relacoes (
  promocao_id uuid not null references public.promocoes(id) on delete cascade,
  categoria_id uuid not null references public.promocoes_categorias(id) on delete cascade,
  primary key (promocao_id, categoria_id)
);

create index if not exists promocao_categoria_relacoes_categoria_idx
  on public.promocao_categoria_relacoes (categoria_id, promocao_id);

-- Categorias iniciais do produto Promoções.
insert into public.promocoes_categorias (nome, slug, emoji, ordem) values
  ('Mercado', 'mercado', '🛒', 1),
  ('Moda', 'moda', '👕', 2),
  ('Farmácia', 'farmacia', '💊', 3),
  ('Construção', 'construcao', '🧱', 4),
  ('Casa', 'casa', '🏠', 5),
  ('Tecnologia', 'tecnologia', '📱', 6),
  ('Automotivo', 'automotivo', '🚗', 7),
  ('Pet', 'pet', '🐶', 8),
  ('Beleza', 'beleza', '💇', 9),
  ('Alimentação', 'alimentacao', '🍔', 10)
on conflict (slug) do nothing;

-- Atualização automática do timestamp.
drop trigger if exists promocoes_set_updated_at on public.promocoes;
create trigger promocoes_set_updated_at
  before update on public.promocoes
  for each row execute function public.set_updated_at();

alter table public.promocoes enable row level security;
alter table public.promocoes_categorias enable row level security;
alter table public.promocao_categoria_relacoes enable row level security;

drop policy if exists "public can read active promocoes" on public.promocoes;
drop policy if exists "public can read promocao categories" on public.promocoes_categorias;
drop policy if exists "public can read promocao category relations" on public.promocao_categoria_relacoes;

create policy "public can read active promocoes"
  on public.promocoes
  for select
  using (
    status = 'ativa'
    and (valido_de is null or valido_de <= now())
    and (valido_ate is null or valido_ate >= now())
  );

create policy "public can read promocao categories"
  on public.promocoes_categorias
  for select
  using (ativo = true);

create policy "public can read promocao category relations"
  on public.promocao_categoria_relacoes
  for select
  using (true);
