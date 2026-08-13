-- ============================================================
-- MIGRAÇÃO: categorias de adicional dinâmicas por empresa
-- Rode UMA VEZ no Supabase SQL Editor do projeto já em produção
-- (depois do schema.sql original, que ainda tem a coluna "tipo" fixa,
-- e depois de schema-rls-hardening.sql, se você já rodou ele).
--
-- O que muda: cada empresa passa a poder criar suas próprias
-- categorias de adicional (nome livre, escolha se é seleção única ou
-- múltipla) em vez de ficar travada nas 6 categorias fixas
-- (pao, salsicha, tamanho, borda, sabor, molho).
--
-- Essa migration preserva todos os dados que já existem: cada
-- combinação (empresa, tipo antigo) vira uma linha em categorias_opcao,
-- e as opções e categorias de produto são religadas automaticamente.
-- ============================================================

-- 1) Tabela nova: categorias de adicional, uma por empresa.
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

create index if not exists categorias_opcao_empresa_idx
  on public.categorias_opcao (empresa_id, ordem);

alter table public.categorias_opcao enable row level security;

drop policy if exists "public can read categorias_opcao" on public.categorias_opcao;
create policy "public can read categorias_opcao"
  on public.categorias_opcao for select using (true);

-- Isolamento de tenant (mesmo padrão do schema-rls-hardening.sql) —
-- só roda sem erro se aquela migration já tiver sido aplicada antes
-- (a tabela empresas precisa já ter o formato com app_metadata no JWT,
-- o que já é o caso desde o schema original). Se você NÃO rodou
-- schema-rls-hardening.sql ainda, pode ignorar/comentar este bloco.
drop policy if exists "tenant manages own categorias_opcao" on public.categorias_opcao;
create policy "tenant manages own categorias_opcao"
  on public.categorias_opcao for all
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    or empresa_id = ((auth.jwt() -> 'app_metadata' ->> 'empresa_id'))::uuid
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    or empresa_id = ((auth.jwt() -> 'app_metadata' ->> 'empresa_id'))::uuid
  );

-- 2) Coluna nova em opcoes_personalizacao apontando pra categoria dinâmica
--    (fica nullable por enquanto, até migrarmos os dados existentes).
alter table public.opcoes_personalizacao
  add column if not exists categoria_opcao_id uuid references public.categorias_opcao(id) on delete cascade;

-- 3) Cria uma categoria_opcao para cada (empresa, tipo antigo) que tem
--    opção cadastrada, preservando nome amigável, ordem e o comportamento
--    de seleção que já existia no código (só "molho" era múltiplo).
insert into public.categorias_opcao (empresa_id, slug, nome, selecao, ordem)
select distinct
  op.empresa_id,
  op.tipo,
  case op.tipo
    when 'pao'      then 'Escolha o pão'
    when 'salsicha' then 'Escolha a salsicha'
    when 'tamanho'  then 'Escolha o tamanho'
    when 'borda'    then 'Escolha a borda'
    when 'sabor'    then 'Escolha o sabor'
    when 'molho'    then 'Molhos'
  end,
  case when op.tipo = 'molho' then 'multipla' else 'unica' end,
  case op.tipo
    when 'pao'      then 0
    when 'salsicha' then 1
    when 'tamanho'  then 2
    when 'borda'    then 3
    when 'sabor'    then 4
    when 'molho'    then 5
  end
from public.opcoes_personalizacao op
on conflict (empresa_id, slug) do nothing;

-- 4) Liga cada opção existente à categoria criada pra ela.
update public.opcoes_personalizacao op
set categoria_opcao_id = co.id
from public.categorias_opcao co
where co.empresa_id = op.empresa_id
  and co.slug = op.tipo
  and op.categoria_opcao_id is null;

-- 5) Migra `categorias.customizacao` (jsonb {pao:true,...}) pra lista de
--    ids de categorias_opcao — é isso que decide quais categorias de
--    adicional aparecem pros produtos de cada categoria.
alter table public.categorias
  add column if not exists categorias_opcao_ids uuid[] not null default '{}';

update public.categorias c
set categorias_opcao_ids = coalesce((
  select array_agg(co.id)
  from public.categorias_opcao co
  where co.empresa_id = c.empresa_id
    and co.slug in (
      select key from jsonb_each_text(c.customizacao) where value = 'true'
    )
), '{}')
where c.customizacao is not null and c.customizacao <> '{}'::jsonb;

-- 6) Agora que os dados existentes já estão migrados, torna
--    categoria_opcao_id obrigatório e REMOVE a trava fixa antiga
--    (coluna "tipo" + o CHECK das 6 categorias).
alter table public.opcoes_personalizacao
  alter column categoria_opcao_id set not null;

alter table public.opcoes_personalizacao
  drop constraint if exists opcoes_personalizacao_tipo_check;

alter table public.opcoes_personalizacao
  drop constraint if exists opcoes_personalizacao_empresa_id_tipo_nome_key;

alter table public.opcoes_personalizacao drop column if exists tipo;

alter table public.opcoes_personalizacao
  add constraint opcoes_personalizacao_categoria_nome_key
  unique (categoria_opcao_id, nome);

create index if not exists opcoes_categoria_idx
  on public.opcoes_personalizacao (categoria_opcao_id, ordem);

drop index if exists opcoes_empresa_idx;
create index if not exists opcoes_empresa_idx
  on public.opcoes_personalizacao (empresa_id, categoria_opcao_id, ordem);

-- 7) A coluna antiga `categorias.customizacao` fica guardada por
--    segurança. Depois de confirmar que tudo funciona com o app novo,
--    pode rodar:
--    alter table public.categorias drop column customizacao;
