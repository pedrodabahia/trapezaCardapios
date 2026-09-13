-- Cor de fundo por anuncio (opcional) -- quando nao definida, o carrossel
-- cai pro gradiente padrao (trapeza-banner-gradient).
alter table anuncios_home add column if not exists cor_fundo text;
