-- Migration: tabela de pedidos + gate de assinatura.
-- Rode no Supabase SQL Editor DEPOIS do schema.sql original.

-- ============================================================
-- PEDIDOS
-- ============================================================
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  numero text not null,
  cliente_nome text not null,
  cliente_telefone text not null,
  endereco text,
  itens jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2) not null default 0,
  taxa_entrega numeric(10,2) not null default 0,
  desconto numeric(10,2) not null default 0,
  valor_total numeric(10,2) not null default 0,
  cupom text,
  status text not null default 'recebido'
    check (status in ('recebido', 'preparando', 'pronto', 'entregue', 'cancelado')),
  criado_em timestamptz not null default now()
);

create index if not exists pedidos_empresa_idx on public.pedidos (empresa_id, criado_em desc);

alter table public.pedidos enable row level security;

-- Sem policies de select/insert/update para anon/authenticated:
-- pedido é criado pelo cliente via server fn (service role) no checkout,
-- e lido/atualizado pelo admin da empresa também via server fn (service role).
-- Isso segue o mesmo padrão do resto do schema (authTenant no backend).
