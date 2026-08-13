-- Forma de pagamento do pedido (Pix, Cartão, Dinheiro) e valor de troco
-- pedido pelo cliente (só relevante quando forma_pagamento = 'dinheiro').

alter table public.pedidos
  add column if not exists forma_pagamento text
    check (forma_pagamento in ('pix', 'cartao', 'dinheiro'));

alter table public.pedidos
  add column if not exists troco_para numeric;
