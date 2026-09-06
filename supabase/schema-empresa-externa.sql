-- Empresas "externas": clientes que já têm site/sistema próprio (feito
-- fora do Trapeza) e só querem aparecer no diretório da home, apontando
-- pra fora. Reaproveita a tabela `empresas` existente (mesma entidade
-- "aparece no diretório") em vez de criar uma tabela nova — só muda pra
-- onde o clique leva e quais campos fazem sentido.

-- Empresa externa pode não ter WhatsApp cadastrado (o contato é pelo site
-- dela mesma), então esse campo deixa de ser obrigatório. Empresas do
-- tipo "trapeza" continuam exigindo WhatsApp na validação da aplicação
-- (é obrigatório no formulário de cadastro), só não é mais obrigatório
-- no banco.
alter table empresas alter column whatsapp drop not null;

alter table empresas add column if not exists tipo text not null default 'trapeza'
  check (tipo in ('trapeza', 'externa'));
alter table empresas add column if not exists url_externa text;
alter table empresas add column if not exists descricao text;
alter table empresas add column if not exists bairro text;
alter table empresas add column if not exists capa_url text;
alter table empresas add column if not exists destaque boolean not null default false;

-- Recria a view pública com as colunas novas no final (CREATE OR REPLACE
-- VIEW só aceita ADICIONAR colunas no fim, nunca no meio — ver migration
-- anterior). Repete "security_invoker = true" explicitamente: esse WITH
-- precisa ser respecificado toda vez que a view é recriada, senão volta
-- pro comportamento default (a migration schema-empresa-categoria-cidade
-- tinha deixado de repetir isso por engano — corrigido aqui).
create or replace view empresas_public
with (security_invoker = true) as
  select id, slug, nome, whatsapp, endereco, logo_url, status_pagamento,
         criado_em, categoria, cidade,
         tipo, url_externa, descricao, bairro, capa_url, destaque
  from empresas;
