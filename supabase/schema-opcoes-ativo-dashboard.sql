-- ============================================================
-- MIGRAÇÃO: opções ativáveis/desativáveis ("carne do dia") +
-- categorias de adicional em destaque no dashboard do painel.
-- Rode UMA VEZ no Supabase SQL Editor, depois de schema.sql e
-- schema-categorias-opcao.sql.
--
-- Por que essa migration existe: o código de app (types, repository,
-- service, controller e a UI do painel) já foi escrito assumindo as
-- duas colunas abaixo, mas nenhuma migration anterior chegou a
-- criá-las no banco de verdade — é o tipo de "código pela metade"
-- que este projeto já teve antes. Esta migration só fecha essa
-- lacuna, sem mudar nenhum código de app.
-- ============================================================

-- 1) opcoes_personalizacao.ativo — liga/desliga uma opção sem apagar
--    o registro (ex: "acabou a carne hoje"). Opção com ativo=false
--    some do cardápio público mas continua editável pro admin.
alter table public.opcoes_personalizacao
  add column if not exists ativo boolean not null default true;

-- Acelera o filtro usado no cardápio público (listarOpcoesAtivas):
-- WHERE empresa_id = ? AND ativo = true ORDER BY ordem.
create index if not exists opcoes_empresa_ativo_idx
  on public.opcoes_personalizacao (empresa_id, ativo, ordem);

-- 2) categorias_opcao.destaque_dashboard — marca quais categorias de
--    adicional aparecem no widget "carne do dia" da home do painel.
--    Categorias sem essa flag continuam editáveis normalmente na aba
--    Personalização, só não ganham o atalho na home.
alter table public.categorias_opcao
  add column if not exists destaque_dashboard boolean not null default false;
