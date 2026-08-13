-- Migration: data de vencimento da assinatura.
-- Rode no Supabase SQL Editor DEPOIS de schema.sql, schema-pedidos.sql e
-- schema-rls-hardening.sql.
--
-- Até agora o único controle de cobrança era o status_pagamento manual
-- (ativo/atrasado/suspenso), sem nenhuma data associada. Isso significa
-- que não dava pra saber quem está "perto de vencer" — só depois que
-- você (ou o cliente) já percebia atraso. Essa coluna guarda a próxima
-- data de vencimento de cada empresa, pra alimentar o dashboard do
-- super-admin (empresas "perto de pagar" = vencimento nos próximos N dias).

alter table public.empresas
  add column if not exists proximo_vencimento date;

-- Backfill: empresas existentes recebem vencimento = data de criação + 30 dias.
-- Depois disso, cada renovação manual soma +30 dias (ver updateEmpresaVencimento
-- em admin-server.ts).
update public.empresas
set proximo_vencimento = (criado_em::date + interval '30 days')::date
where proximo_vencimento is null;
