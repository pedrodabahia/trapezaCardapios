-- Palavras-chave de busca, administraveis por empresa (super-admin).
-- Somam-se ao que a busca ja compara (nome, categoria, tipo, cidade) --
-- nao substitui nada da logica de busca existente.
-- Exemplo: "bebidas, gelo, agua, cerveja, distribuidora em Posto da Mata"
alter table empresas add column if not exists palavras_chave text;
