-- Permite ter varios carrosseis de propaganda na home (antes so existia
-- 1 posicao fixa). Cada anuncio agora pertence a uma "posicao" -- a home
-- renderiza um carrossel por posicao, cada um so com os anuncios ativos
-- daquela posicao.
alter table anuncios_home add column if not exists posicao text not null default 'topo';
