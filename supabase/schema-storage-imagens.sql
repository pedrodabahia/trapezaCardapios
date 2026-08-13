-- Bucket público de imagens (produtos, categorias, logo da empresa).
-- Rode uma vez no Supabase SQL Editor.
--
-- Público de LEITURA (qualquer um vê a imagem pela URL, necessário pro
-- cardápio funcionar), mas SEM policy de insert/update/delete pra
-- anon/authenticated — todo upload passa pelo service_role via server fn
-- (mesmo padrão das outras tabelas do projeto).

insert into storage.buckets (id, name, public)
values ('imagens', 'imagens', true)
on conflict (id) do nothing;

-- Redundante com "public: true" acima (buckets públicos já servem GET sem
-- checar RLS), mas deixamos explícito por clareza/defesa em profundidade.
drop policy if exists "public can read imagens" on storage.objects;
create policy "public can read imagens"
  on storage.objects for select
  using (bucket_id = 'imagens');
