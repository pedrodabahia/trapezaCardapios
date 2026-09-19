-- Leads enviados pelo formulário público "Cadastre sua empresa".
-- Rode este arquivo no Supabase SQL Editor depois de schema-categorias-negocio.sql.
-- Os inserts são feitos exclusivamente pela server function, com service_role;
-- por isso não existe policy pública de escrita nesta tabela.

create table if not exists public.cadastros_interesse (
  id uuid primary key default gen_random_uuid(),
  nome_empresa text not null,
  nome_responsavel text not null,
  whatsapp text not null,
  email text,
  cidade text not null,
  categoria_negocio_id uuid not null
    references public.categorias_negocio(id) on delete restrict,
  status text not null default 'novo'
    check (status in ('novo', 'contatado', 'arquivado')),
  criado_em timestamptz not null default now()
);

create index if not exists cadastros_interesse_criado_em_idx
  on public.cadastros_interesse (criado_em desc);

create index if not exists cadastros_interesse_status_idx
  on public.cadastros_interesse (status, criado_em desc);

alter table public.cadastros_interesse enable row level security;

-- Se você já executou uma versão anterior desta migration, rode também:
-- alter table public.cadastros_interesse drop constraint if exists cadastros_interesse_status_check;
-- alter table public.cadastros_interesse add constraint cadastros_interesse_status_check
--   check (status in ('novo', 'contatado', 'arquivado'));
