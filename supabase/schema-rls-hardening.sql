-- Migration: hardening de seguranca pos-lancamento.
-- Rode no Supabase SQL Editor DEPOIS de schema.sql e schema-pedidos.sql.
--
-- Dois problemas que essa migration resolve:
--
-- 1) A policy original "public can read empresas" (using (true)) libera
--    SELECT de TODAS as colunas da tabela empresas pra qualquer request
--    anonimo que bata direto na API REST do Supabase com a anon key
--    (que e publica por natureza -- ela vai no bundle JS do site). Isso
--    inclui a coluna pix_chave, que e um dado sensivel do lojista e nao
--    deveria ser publica. O app em si nunca expunha isso (as server fns
--    usam service_role e so retornam os campos que quer), mas quem
--    pegasse a anon key e fizesse GET /rest/v1/empresas?select=* direto
--    conseguia ler a chave pix de TODAS as empresas cadastradas.
--
-- 2) O schema original nao tinha nenhuma policy de isolamento de tenant
--    pro role authenticated -- toda checagem de "essa empresa e sua
--    mesmo?" ficava 100% na camada de aplicacao (authTenant, em
--    src/lib/admin-server.ts). Isso funciona porque a aplicacao sempre
--    usa service_role (que ignora RLS) e checa manualmente. Mas nao
--    havia uma segunda camada de defesa no banco: se uma rota nova
--    esquecesse de chamar authTenant, ou se o token do usuario logado
--    fosse usado direto contra o Supabase sem passar pelas server fns,
--    nao tinha nada no banco impedindo uma empresa de ler/editar dado
--    de outra. As policies abaixo fecham essa lacuna.

-- ============================================================
-- 1) empresas: tira pix_chave (e outras colunas sensiveis) da
--    leitura publica
-- ============================================================

drop policy if exists "public can read empresas" on public.empresas;

-- View publica com só as colunas que o cardápio/site realmente precisa.
create or replace view public.empresas_public
with (security_invoker = true) as
select id, slug, nome, whatsapp, endereco, logo_url, status_pagamento, criado_em
from public.empresas;

grant select on public.empresas_public to anon, authenticated;

-- O admin logado (ou super_admin) continua conseguindo ler a empresa
-- completa (inclusive pix_chave) -- mas só a própria, exceto super_admin.
create policy "tenant reads own empresa, super_admin reads all"
  on public.empresas for select
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    or id = ((auth.jwt() -> 'app_metadata' ->> 'empresa_id'))::uuid
  );

-- Nota: as server fns do app (getEmpresaBySlug, listEmpresasPublicas,
-- getEmpresaCompletaAuth, etc.) usam o client com service_role, que
-- ignora RLS -- continuam funcionando exatamente como antes, sem
-- nenhuma mudança de código necessária. Essas policies só passam a
-- valer pra quem acessa o Supabase direto com a anon key ou com o
-- token de um usuário logado.

-- ============================================================
-- 2) Isolamento de tenant no banco para o role "authenticated"
--    (defesa em profundidade)
-- ============================================================

-- categorias
create policy "tenant manages own categorias"
  on public.categorias for all
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    or empresa_id = ((auth.jwt() -> 'app_metadata' ->> 'empresa_id'))::uuid
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    or empresa_id = ((auth.jwt() -> 'app_metadata' ->> 'empresa_id'))::uuid
  );

-- produtos
create policy "tenant manages own produtos"
  on public.produtos for all
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    or empresa_id = ((auth.jwt() -> 'app_metadata' ->> 'empresa_id'))::uuid
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    or empresa_id = ((auth.jwt() -> 'app_metadata' ->> 'empresa_id'))::uuid
  );

-- opcoes_personalizacao
create policy "tenant manages own opcoes"
  on public.opcoes_personalizacao for all
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    or empresa_id = ((auth.jwt() -> 'app_metadata' ->> 'empresa_id'))::uuid
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    or empresa_id = ((auth.jwt() -> 'app_metadata' ->> 'empresa_id'))::uuid
  );

-- empresa_config
create policy "tenant manages own empresa_config"
  on public.empresa_config for all
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    or empresa_id = ((auth.jwt() -> 'app_metadata' ->> 'empresa_id'))::uuid
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    or empresa_id = ((auth.jwt() -> 'app_metadata' ->> 'empresa_id'))::uuid
  );

-- pedidos: dono le/atualiza só os próprios. A criação (INSERT) continua
-- sem policy pra authenticated/anon de propósito -- quem faz o pedido
-- no checkout público NÃO está logado, então isso sempre passa pela
-- server fn createPedido com service_role, como já era.
create policy "tenant reads own pedidos"
  on public.pedidos for select
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    or empresa_id = ((auth.jwt() -> 'app_metadata' ->> 'empresa_id'))::uuid
  );

create policy "tenant updates own pedidos"
  on public.pedidos for update
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    or empresa_id = ((auth.jwt() -> 'app_metadata' ->> 'empresa_id'))::uuid
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    or empresa_id = ((auth.jwt() -> 'app_metadata' ->> 'empresa_id'))::uuid
  );
