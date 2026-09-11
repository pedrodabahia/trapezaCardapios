-- Correção: uma empresa pode se encaixar em mais de uma categoria de
-- negócio (ex: uma lanchonete que também vende açaí). O campo único
-- `categoria` vira um array `categorias`.

alter table empresas add column if not exists categorias text[] not null default '{}';

-- Backfill: quem já tinha uma categoria única definida vira um array de 1
-- item; quem não tinha nada continua com array vazio.
update empresas
set categorias = array[categoria]
where categoria is not null and categorias = '{}';

-- Precisa dropar a VIEW antes de dropar a coluna (a view depende dela) —
-- se tentar dropar a coluna primeiro, o Postgres recusa com "other
-- objects depend on it". Drop + recreate da view já era necessário
-- mesmo (ver comentário abaixo), então só mudei a ordem.
drop view if exists empresas_public;

alter table empresas drop column if exists categoria;

-- A view precisa ser recriada do zero (não só CREATE OR REPLACE) porque
-- estamos trocando o NOME de uma coluna (categoria -> categorias), e
-- CREATE OR REPLACE VIEW só aceita adicionar coluna no fim, nunca
-- renomear/remover uma do meio. Precisa re-conceder o GRANT depois,
-- porque dropar a view também derruba as permissões antigas.
create view empresas_public
with (security_invoker = true) as
  select id, slug, nome, whatsapp, endereco, logo_url, status_pagamento,
         criado_em, categorias, cidade,
         tipo, url_externa, descricao, bairro, capa_url, destaque
  from empresas;

grant select on empresas_public to anon, authenticated;
