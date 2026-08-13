-- Adiciona forma de pagamento e troco ao pedido.
-- Rode no Supabase SQL Editor depois de schema-pedidos.sql.

alter table public.pedidos
  add column if not exists forma_pagamento text
    check (forma_pagamento in ('pix', 'cartao', 'dinheiro')),
  add column if not exists troco_para numeric(10,2);
