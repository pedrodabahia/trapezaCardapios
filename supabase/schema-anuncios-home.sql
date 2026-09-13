-- Banners/anuncios do carrossel da home da plataforma, controlados
-- manualmente pelo super-admin em /plataforma/anuncios (substitui a
-- ideia anterior de sortear produto em promocao automaticamente -- agora
-- e curadoria manual mesmo).

create table if not exists anuncios_home (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  subtitulo text,
  imagem_url text,
  -- pra onde o slide leva ao clicar: pode ser uma URL externa, ou um
  -- caminho interno tipo /s/algum-slug ou /s/algum-slug/product/algum-id.
  link_url text,
  ativo boolean not null default true,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);

alter table anuncios_home enable row level security;

-- Leitura publica so dos ativos (defesa em profundidade -- a home em si
-- sempre le via service_role, que ignora RLS).
create policy "leitura publica de anuncios ativos" on anuncios_home
  for select using (ativo = true);
