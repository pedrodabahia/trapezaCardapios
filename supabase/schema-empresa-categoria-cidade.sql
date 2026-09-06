-- Adiciona categoria de negócio e cidade na empresa, usadas pros filtros
-- da home pública (busca por categoria/cidade) e pras seções de destaque.
-- Preenchidas pelo próprio dono da empresa no painel (aba Config).

alter table empresas add column if not exists categoria text;
alter table empresas add column if not exists cidade text;

-- Recria a view pública incluindo as novas colunas (view não herda
-- colunas novas da tabela automaticamente). CREATE OR REPLACE VIEW só
-- aceita ADICIONAR colunas no final da lista — por isso categoria/cidade
-- vêm depois de criado_em, não no meio (senão dá erro 42P16).
create or replace view empresas_public as
  select id, slug, nome, whatsapp, endereco, logo_url, status_pagamento,
         criado_em, categoria, cidade
  from empresas;
