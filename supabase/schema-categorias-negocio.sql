-- Categorias de NEGOCIO administraveis pelo super-admin (antes eram uma
-- lista fixa no codigo, em src/lib/categorias-negocio.ts). Essa tabela
-- passa a ser o lugar onde o super-admin cria/edita categoria pelo
-- painel. Populada com a mesma lista que ja existia no codigo, pra nao
-- perder nada na migracao.
create table if not exists categorias_negocio (
  id uuid primary key default gen_random_uuid(),
  valor text not null unique,
  label text not null,
  imagem_url text,
  cor text,
  ordem int not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

alter table categorias_negocio enable row level security;
create policy "leitura publica de categorias ativas" on categorias_negocio
  for select using (true);

insert into categorias_negocio (valor, label, imagem_url, cor, ordem) values
  ('distribuidora', 'Distribuidoras',    '/icons/distrib.png',           '#E8F8EC', 0),
  ('lanchonete',     'Lanchonetes',      '/icons/lanchonete.png',        '#FFF0DC', 1),
  ('pizzaria',       'Pizzarias',        '/icons/pizza.png',             '#FFE5E1', 2),
  ('confeitaria',    'Confeitarias',     '/icons/bolo.png',              '#F8E8F5', 3),
  ('restaurante',    'Restaurante',      '/icons/comida.png',            '#FFF4D6', 4),
  ('sorvete',        'Sorveteria/Acai',  '/icons/sorvete.png',           '#F3E8FF', 5),
  ('barbearia',      'Barbearias',       '/icons/barba.png',             '#EAE6FF', 6),
  ('estetica',       'Estetica/Beleza',  '/icons/lindo.png',             '#FFE8F0', 7),
  ('farmacia',       'Farmacias',        '/icons/farmacia.png',          '#FFE8F0', 8),
  ('mercado',        'Mercados',         '/icons/carrinho-de-compras.png','#FFE8F0', 9),
  ('servico',        'Servicos',         '/icons/servico.png',           '#FFE8F0', 10),
  ('taxi',           'Taxi',             '/icons/taxi.png',              '#FFE8F0', 11),
  ('mototaxi',       'Moto-Taxi',        '/icons/mototaxi.png',          '#FFE8F0', 12)
on conflict (valor) do nothing;
