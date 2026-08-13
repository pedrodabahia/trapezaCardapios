-- Seed da primeira empresa: Hotdog do Simão.
-- Rode após o schema.sql. Tudo idempotente (on conflict do nothing).
--
-- Cria a empresa `hotdog-do-simao` com as 5 categorias e 10 produtos
-- que existiam no antigo `src/lib/data.ts`. As categorias de adicional
-- (pão, salsicha, molhos, tamanho de pizza, borda, sabor de suco) também
-- são populadas como categorias dinâmicas, replicando o que o data.ts
-- tinha como constantes — mas já no formato novo (cada empresa dona das
-- suas próprias categorias de adicional).

do $$
declare
  v_empresa_id uuid;
  v_cat_promocoes    uuid;
  v_cat_hot_dogs     uuid;
  v_cat_mini_pizzas  uuid;
  v_cat_bebidas      uuid;
  v_cat_sucos        uuid;
  v_co_pao       uuid;
  v_co_salsicha  uuid;
  v_co_molho     uuid;
  v_co_tamanho   uuid;
  v_co_borda     uuid;
  v_co_sabor     uuid;
begin
  -- Empresa
  insert into public.empresas (slug, nome, whatsapp, endereco, plano_id, status_pagamento)
  values (
    'hotdog-do-simao',
    'Hotdog do Simão',
    '557399831608',
    'Rua das Salsichas, 123 · Centro, Posto da Mata - Nova Viçosa - BA',
    'pro',
    'ativo'
  )
  on conflict (slug) do update set nome = excluded.nome
  returning id into v_empresa_id;

  -- Config inicial (cores, cupons, bairros, horários, frete).
  -- O painel admin pode editar tudo depois.
  insert into public.empresa_config (empresa_id, data)
  values (
    v_empresa_id,
    jsonb_build_object(
      'cores', jsonb_build_object(
        'primary', '#D6291B',
        'accent',  '#F6A511',
        'bg',      '#FFF6E9',
        'fg',      '#5A3420'
      ),
      'cupons', jsonb_build_array(
        jsonb_build_object('code', 'BEMVINDO10', 'discount', 10, 'desc', '10% OFF em qualquer pedido'),
        jsonb_build_object('code', 'PRIMEIRA',   'discount', 15, 'desc', '15% OFF na primeira compra'),
        jsonb_build_object('code', 'FRETE0',     'discount', 0,  'desc', 'Frete grátis (não cumulativo)')
      ),
      'frete', jsonb_build_object(
        'taxa', 6.9,
        'gratis_acima_de', 80,
        'gratis_habilitado', true
      ),
      'horarios', jsonb_build_object(
        'domingo',    jsonb_build_object('abre', '18:00', 'fecha', '23:00', 'fechado', false),
        'segunda',    jsonb_build_object('abre', '00:00', 'fecha', '00:00', 'fechado', true),
        'terca',      jsonb_build_object('abre', '18:00', 'fecha', '23:00', 'fechado', false),
        'quarta',     jsonb_build_object('abre', '18:00', 'fecha', '23:00', 'fechado', false),
        'quinta',     jsonb_build_object('abre', '18:00', 'fecha', '23:00', 'fechado', false),
        'sexta',      jsonb_build_object('abre', '18:00', 'fecha', '00:00', 'fechado', false),
        'sabado',     jsonb_build_object('abre', '18:00', 'fecha', '00:00', 'fechado', false)
      ),
      'cidade_entrega', 'Posto da Mata - Nova Viçosa, BA'
    )
  )
  on conflict (empresa_id) do update set data = excluded.data;

  -- Categorias de ADICIONAL (dinâmicas — cada empresa cria as suas).
  -- Aqui já criamos com nome/seleção equivalentes ao que era fixo antes.
  insert into public.categorias_opcao (empresa_id, slug, nome, selecao, ordem) values
    (v_empresa_id, 'pao',      'Escolha o pão',      'unica',    0),
    (v_empresa_id, 'salsicha', 'Escolha a salsicha',  'unica',    1),
    (v_empresa_id, 'molho',    'Molhos',              'multipla', 2),
    (v_empresa_id, 'tamanho',  'Escolha o tamanho',   'unica',    3),
    (v_empresa_id, 'borda',    'Escolha a borda',     'unica',    4),
    (v_empresa_id, 'sabor',    'Escolha o sabor',     'unica',    5)
  on conflict (empresa_id, slug) do update set nome = excluded.nome;

  select id into v_co_pao      from public.categorias_opcao where empresa_id = v_empresa_id and slug = 'pao';
  select id into v_co_salsicha from public.categorias_opcao where empresa_id = v_empresa_id and slug = 'salsicha';
  select id into v_co_molho    from public.categorias_opcao where empresa_id = v_empresa_id and slug = 'molho';
  select id into v_co_tamanho  from public.categorias_opcao where empresa_id = v_empresa_id and slug = 'tamanho';
  select id into v_co_borda    from public.categorias_opcao where empresa_id = v_empresa_id and slug = 'borda';
  select id into v_co_sabor    from public.categorias_opcao where empresa_id = v_empresa_id and slug = 'sabor';

  -- Categorias de PRODUTO
  insert into public.categorias (empresa_id, slug, nome, emoji, imagem_url, ordem, categorias_opcao_ids) values
    (v_empresa_id, 'promocoes',   'Promoções',   '🔥',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80&auto=format&fit=crop',
      0, array[v_co_pao, v_co_salsicha, v_co_molho]),
    (v_empresa_id, 'hot-dogs',    'Hot Dogs',    '🌭',
      'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=400&q=80&auto=format&fit=crop',
      1, array[v_co_pao, v_co_salsicha, v_co_molho]),
    (v_empresa_id, 'mini-pizzas', 'Mini Pizzas', '🍕',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80&auto=format&fit=crop',
      2, array[v_co_tamanho, v_co_borda]),
    (v_empresa_id, 'bebidas',     'Bebidas',     '🥤',
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80&auto=format&fit=crop',
      3, array[]::uuid[]),
    (v_empresa_id, 'sucos',       'Sucos',       '🧃',
      'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400&q=80&auto=format&fit=crop',
      4, array[v_co_sabor])
  on conflict (empresa_id, slug) do update set nome = excluded.nome
  returning id, slug;

  select id into v_cat_promocoes   from public.categorias where empresa_id = v_empresa_id and slug = 'promocoes';
  select id into v_cat_hot_dogs    from public.categorias where empresa_id = v_empresa_id and slug = 'hot-dogs';
  select id into v_cat_mini_pizzas from public.categorias where empresa_id = v_empresa_id and slug = 'mini-pizzas';
  select id into v_cat_bebidas     from public.categorias where empresa_id = v_empresa_id and slug = 'bebidas';
  select id into v_cat_sucos       from public.categorias where empresa_id = v_empresa_id and slug = 'sucos';

  -- Produtos
  -- Hot dogs
  insert into public.produtos (empresa_id, categoria_id, nome, descricao_curta, descricao, preco, preco_antigo, imagem_url, ingredientes, nutricao, tempo_preparo, tag, ordem) values
    (v_empresa_id, v_cat_hot_dogs,
      'Simão Clássico',
      'Pão brioche, salsicha artesanal, batata palha e cheddar cremoso.',
      'O queridinho da casa: salsicha artesanal grelhada na chapa, cheddar derretido, batata palha crocante, milho e vinagrete fresco no pão brioche macio.',
      22.90, null,
      'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=900&q=80&auto=format&fit=crop',
      array['Pão brioche', 'Salsicha artesanal', 'Cheddar', 'Batata palha', 'Milho', 'Vinagrete'],
      jsonb_build_object('kcal', 620, 'carbs', 58, 'protein', 24, 'fat', 32),
      '20-30 min',
      'mais-vendido', 0),
    (v_empresa_id, v_cat_hot_dogs,
      'Bacon Lover',
      'Dose dupla de bacon crocante, cheddar e cebola caramelizada.',
      'Para os fãs de bacon: dose generosa de bacon crocante, cheddar cremoso, cebola caramelizada e molho barbecue defumado, no pão brioche.',
      28.90, 34.90,
      'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=900&q=80&auto=format&fit=crop',
      array['Pão brioche', 'Salsicha suína', 'Bacon', 'Cheddar', 'Cebola caramelizada', 'Barbecue'],
      jsonb_build_object('kcal', 780, 'carbs', 55, 'protein', 34, 'fat', 46),
      '20-30 min',
      'promocao', 1),
    (v_empresa_id, v_cat_hot_dogs,
      'Catupiry Explosion',
      'Recheado com catupiry cremoso, calabresa e purê.',
      'Explosão de sabor: catupiry cremoso, calabresa fatiada na chapa, purê de batata artesanal e um toque de cheddar.',
      26.90, null,
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=900&q=80&auto=format&fit=crop',
      array['Pão australiano', 'Salsicha tradicional', 'Catupiry', 'Calabresa', 'Purê', 'Cheddar'],
      jsonb_build_object('kcal', 710, 'carbs', 62, 'protein', 26, 'fat', 38),
      '20-30 min',
      'novo', 2),
    (v_empresa_id, v_cat_hot_dogs,
      'Verdinho do Simão',
      'Salsicha vegetal, molho verde e vinagrete.',
      'Versão levinha com salsicha vegetal, molho verde artesanal, milho, ervilha e vinagrete.',
      24.90, null,
      'https://images.unsplash.com/photo-1550317138-10000687a72b?w=900&q=80&auto=format&fit=crop',
      array['Pão integral', 'Salsicha vegetal', 'Molho verde', 'Milho', 'Ervilha', 'Vinagrete'],
      jsonb_build_object('kcal', 480, 'carbs', 60, 'protein', 18, 'fat', 18),
      '20-30 min',
      null, 3),

    -- Mini pizzas
    (v_empresa_id, v_cat_mini_pizzas,
      'Mini Pizza Calabresa',
      'Calabresa fatiada, cebola e muçarela.',
      'Massa fininha e crocante, molho de tomate da casa, muçarela derretida, calabresa fatiada e cebola.',
      24.90, null,
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&q=80&auto=format&fit=crop',
      array['Massa', 'Molho de tomate', 'Muçarela', 'Calabresa', 'Cebola'],
      jsonb_build_object('kcal', 680, 'carbs', 74, 'protein', 28, 'fat', 30),
      '20-25 min',
      'mais-vendido', 0),
    (v_empresa_id, v_cat_mini_pizzas,
      'Mini Pizza Muçarela',
      'A clássica, com bastante queijo.',
      'Massa fininha e crocante, molho de tomate da casa e muçarela generosa, do jeito que todo mundo gosta.',
      21.90, null,
      'https://images.unsplash.com/photo-1548365328-9f547fb0953b?w=900&q=80&auto=format&fit=crop',
      array['Massa', 'Molho de tomate', 'Muçarela', 'Orégano'],
      jsonb_build_object('kcal', 620, 'carbs', 70, 'protein', 26, 'fat', 24),
      '20-25 min',
      null, 1),

    -- Bebidas
    (v_empresa_id, v_cat_bebidas,
      'Coca-Cola Lata 350ml',
      'Geladinha na medida.',
      'Coca-Cola tradicional 350ml, geladinha.',
      7.50, null,
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=900&q=80&auto=format&fit=crop',
      array['Coca-Cola 350ml'],
      jsonb_build_object('kcal', 140, 'carbs', 37, 'protein', 0, 'fat', 0),
      '10 min',
      null, 0),
    (v_empresa_id, v_cat_bebidas,
      'Guaraná Antarctica 350ml',
      'Clássico brasileiro.',
      'Guaraná Antarctica 350ml.',
      6.90, null,
      'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=900&q=80&auto=format&fit=crop',
      array['Guaraná 350ml'],
      jsonb_build_object('kcal', 130, 'carbs', 34, 'protein', 0, 'fat', 0),
      '10 min',
      null, 1),
    (v_empresa_id, v_cat_bebidas,
      'Água Mineral 500ml',
      'Sem gás, geladinha.',
      'Água mineral sem gás 500ml.',
      4.50, null,
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=80&auto=format&fit=crop',
      array['Água mineral'],
      jsonb_build_object('kcal', 0, 'carbs', 0, 'protein', 0, 'fat', 0),
      '10 min',
      null, 2),

    -- Sucos
    (v_empresa_id, v_cat_sucos,
      'Suco Natural 500ml',
      'Natural, feito na hora. Escolha o sabor.',
      'Suco natural, feito na hora, sem açúcar, 500ml. Escolha o sabor no pedido.',
      12.90, null,
      'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=900&q=80&auto=format&fit=crop',
      array['Fruta natural'],
      jsonb_build_object('kcal', 210, 'carbs', 48, 'protein', 3, 'fat', 0),
      '15 min',
      'novo', 0),

    -- Promoções
    (v_empresa_id, v_cat_promocoes,
      'Combo Clássico + Refri',
      'Simão Clássico + refri lata.',
      'Leve o Simão Clássico com refrigerante lata por um precinho especial.',
      24.90, 32.90,
      'https://images.unsplash.com/photo-1550317138-10000687a72b?w=900&q=80&auto=format&fit=crop',
      array['Simão Clássico', 'Refri lata'],
      jsonb_build_object('kcal', 760, 'carbs', 95, 'protein', 24, 'fat', 32),
      '20-30 min',
      'promocao', 0)
  on conflict do nothing;

  -- Opções de personalização (dentro de cada categoria de adicional criada acima)
  insert into public.opcoes_personalizacao (empresa_id, categoria_opcao_id, nome, preco_adicional, ordem) values
    -- Pão
    (v_empresa_id, v_co_pao, 'Tradicional', 0,    0),
    (v_empresa_id, v_co_pao, 'Brioche',     2.5,  1),
    (v_empresa_id, v_co_pao, 'Australiano', 3.5,  2),
    (v_empresa_id, v_co_pao, 'Integral',    2.0,  3),
    -- Salsicha
    (v_empresa_id, v_co_salsicha, 'Tradicional', 0,   0),
    (v_empresa_id, v_co_salsicha, 'Artesanal',   4.0, 1),
    (v_empresa_id, v_co_salsicha, 'Suína',       3.0, 2),
    (v_empresa_id, v_co_salsicha, 'Defumada',    3.5, 3),
    -- Molhos
    (v_empresa_id, v_co_molho, 'Ketchup',     0,   0),
    (v_empresa_id, v_co_molho, 'Mostarda',    0,   1),
    (v_empresa_id, v_co_molho, 'Maionese',    0,   2),
    (v_empresa_id, v_co_molho, 'Molho verde', 0,   3),
    (v_empresa_id, v_co_molho, 'Barbecue',    0,   4),
    (v_empresa_id, v_co_molho, 'Picante',     0,   5),
    -- Tamanho de pizza
    (v_empresa_id, v_co_tamanho, 'Pequena (4 fatias)',  0,   0),
    (v_empresa_id, v_co_tamanho, 'Média (6 fatias)',    6,   1),
    (v_empresa_id, v_co_tamanho, 'Grande (8 fatias)',   12,  2),
    -- Borda de pizza
    (v_empresa_id, v_co_borda, 'Sem recheio',  0,    0),
    (v_empresa_id, v_co_borda, 'Catupiry',     5.0,  1),
    (v_empresa_id, v_co_borda, 'Cheddar',      5.0,  2),
    (v_empresa_id, v_co_borda, 'Chocolate',    5.0,  3),
    -- Sabor de suco
    (v_empresa_id, v_co_sabor, 'Laranja',   0, 0),
    (v_empresa_id, v_co_sabor, 'Abacaxi',   0, 1),
    (v_empresa_id, v_co_sabor, 'Uva',       0, 2),
    (v_empresa_id, v_co_sabor, 'Manga',     0, 3),
    (v_empresa_id, v_co_sabor, 'Morango',   0, 4),
    (v_empresa_id, v_co_sabor, 'Maracujá',  0, 5)
  on conflict (categoria_opcao_id, nome) do nothing;
end $$;

-- Mensagem de confirmação
do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.empresas where slug = 'hotdog-do-simao';
  raise notice 'Empresa hotdog-do-simao % — % produtos, % categorias.',
    case when v_count > 0 then 'OK' else 'NÃO ENCONTRADA' end,
    (select count(*) from public.produtos where empresa_id = (select id from public.empresas where slug = 'hotdog-do-simao')),
    (select count(*) from public.categorias where empresa_id = (select id from public.empresas where slug = 'hotdog-do-simao'));
end $$;
