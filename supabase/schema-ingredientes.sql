-- Ingredientes por produto. Uma linha por (produto, ingrediente) — o nome
-- fica direto aqui, sem tabela catálogo separada (mais simples: cada
-- produto define os próprios ingredientes, sem precisar reaproveitar
-- nome entre produtos diferentes).
-- Rode no Supabase SQL Editor depois do schema.sql original.

create table if not exists public.produto_ingredientes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos(id) on delete cascade,
  nome text not null,
  -- true  = cliente pode pedir pra remover no cardápio público.
  -- false = ingrediente fixo/obrigatório do produto (não aparece pra remover).
  removivel boolean not null default true,
  ordem int not null default 0
);

create index if not exists produto_ingredientes_produto_idx
  on public.produto_ingredientes (produto_id, ordem);

alter table public.produto_ingredientes enable row level security;

drop policy if exists "public can read produto_ingredientes" on public.produto_ingredientes;
create policy "public can read produto_ingredientes"
  on public.produto_ingredientes for select using (true);

-- Sem policy de insert/update/delete pra anon/authenticated — toda escrita
-- passa pelo service_role em server fns, mesmo padrão do resto do schema.
