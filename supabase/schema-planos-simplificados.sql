-- Simplifica pra 2 planos (por enquanto): Gratuito e Padrao (R$59,90).
-- Nao apaga os planos antigos (start/pro/pro_plus/premium) pra nao
-- quebrar empresa que ja estiver usando um deles -- so cadastra os dois
-- novos e adiciona um jeito explicito de saber "este plano e gratuito"
-- (em vez do codigo do app ter que adivinhar pelo id do plano).

alter table planos add column if not exists gratuito boolean not null default false;

insert into planos (id, nome, preco_mensal, limite_produtos, gratuito) values
  ('gratuito', 'Gratuito', 0,     10,   true),
  ('padrao',   'Padrao',   59.90, null, false)
on conflict (id) do update set
  nome = excluded.nome,
  preco_mensal = excluded.preco_mensal,
  limite_produtos = excluded.limite_produtos,
  gratuito = excluded.gratuito;
