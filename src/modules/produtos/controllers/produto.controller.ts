import { createServerFn } from "@tanstack/react-start";
import { container } from "@/core/container";
import { authTenantAtivo } from "@/core/auth/session";
import "../container";
import "@/modules/empresas/container";
import "@/modules/planos/container";
import "@/modules/pedidos/container";
import type { NovoProdutoInput, ProdutoIngredienteInput } from "../types/produto.types";

export const getProdutoById = createServerFn({ method: "POST" })
  .validator((d: { empresaId: string; produtoId: string }) => d)
  .handler(async ({ data }) => {
    const produtoService = container.resolve("produtoService");
    return produtoService.buscarPorId(data.empresaId, data.produtoId);
  });

export const saveProduto = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string; produto: NovoProdutoInput }) => d)
  .handler(async ({ data: args }) => {
    await authTenantAtivo(args.token, args.empresaId);
    const produtoService = container.resolve("produtoService");

    // Limite de produtos por plano: só checa em CRIAÇÃO de produto novo.
    let limite: number | null = null;
    if (!args.produto.id) {
      const empresaRepository = container.resolve("empresaRepository");
      const planoRepository = container.resolve("planoRepository");
      const planoId = await empresaRepository.buscarPlanoId(args.empresaId);
      if (planoId) {
        limite = await planoRepository.buscarLimiteProdutos(planoId);
      }
    }

    const { id } = await produtoService.salvar(args.empresaId, args.produto, limite);
    return { ok: true as const, id };
  });

export const deleteProduto = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string; produtoId: string }) => d)
  .handler(async ({ data: args }) => {
    await authTenantAtivo(args.token, args.empresaId);
    const produtoService = container.resolve("produtoService");
    await produtoService.remover(args.empresaId, args.produtoId);
    return { ok: true as const };
  });

// Substitui a lista inteira de ingredientes de um produto. Chamado pelo
// painel logo depois de saveProduto (precisa do id do produto, que só
// existe depois do primeiro save no caso de produto novo).
export const saveProdutoIngredientes = createServerFn({ method: "POST" })
  .validator(
    (d: {
      token: string;
      empresaId: string;
      produtoId: string;
      itens: ProdutoIngredienteInput[];
    }) => d,
  )
  .handler(async ({ data: args }) => {
    await authTenantAtivo(args.token, args.empresaId);
    const produtoService = container.resolve("produtoService");
    await produtoService.salvarIngredientes(args.empresaId, args.produtoId, args.itens);
    return { ok: true as const };
  });

export type TopProdutoPlataforma = {
  produtoId: string;
  nome: string;
  precoAtual: number;
  imagemUrl: string | null;
  totalQtd: number;
  empresaId: string;
  empresaNome: string;
  empresaSlug: string;
};

// Público (sem login) — os produtos mais vendidos de CADA empresa Trapeza
// ativa (empresa "externa" não entra: não tem catálogo/produto aqui).
// Usado na home da plataforma ("Mais procurados"). Cruza 3 módulos
// (empresas + pedidos + produtos), por isso mora na camada de controller
// resolvendo os repositories direto — mesmo padrão já usado em
// saveProduto (que também resolve empresaRepository/planoRepository na
// hora, em vez de injetar tudo no construtor de um service só).
export const getTopProdutosPlataforma = createServerFn({ method: "POST" })
  .validator((d: { limitePorEmpresa?: number } | undefined) => d ?? {})
  .handler(async ({ data }): Promise<TopProdutoPlataforma[]> => {
    const limitePorEmpresa = data.limitePorEmpresa ?? 4;
    const empresaRepository = container.resolve("empresaRepository");
    const pedidoRepository = container.resolve("pedidoRepository");
    const produtoRepository = container.resolve("produtoRepository");

    const empresas = (await empresaRepository.listarPublicasAtivas()).filter(
      (e) => e.tipo === "trapeza",
    );

    const resultado: TopProdutoPlataforma[] = [];
    for (const empresa of empresas) {
      const top = await pedidoRepository.topVendidosPorEmpresa(empresa.id, limitePorEmpresa);
      for (const item of top) {
        // Pedido antigo sem produto_id (de antes dessa coluna existir) —
        // sem o id não dá pra buscar foto/preço com segurança, então pula.
        if (!item.produtoId) continue;
        const produto = await produtoRepository.buscarPorId(empresa.id, item.produtoId);
        if (!produto || produto.tipo !== "produto") continue; // item removido, inativo ou que é serviço
        resultado.push({
          produtoId: produto.id,
          nome: produto.nome,
          precoAtual: produto.preco,
          imagemUrl: produto.imagem_url,
          totalQtd: item.totalQtd,
          empresaId: empresa.id,
          empresaNome: empresa.nome,
          empresaSlug: empresa.slug,
        });
      }
    }

    // Ordena globalmente por quantidade vendida (maior primeiro) — mistura
    // produtos de empresas diferentes no mesmo ranking.
    resultado.sort((a, b) => b.totalQtd - a.totalQtd);
    return resultado;
  });

export type AnuncioPromocao = {
  empresaId: string;
  empresaSlug: string;
  empresaNome: string;
  produtoId: string;
  produtoNome: string;
  precoAtual: number;
  precoAntigo: number | null;
  imagemUrl: string | null;
};

// Público (sem login) — sorteia até 4 empresas Trapeza ativas que tenham
// pelo menos 1 produto marcado com a tag "promocao", e pega 1 produto em
// promoção de cada uma (também sorteado, se a empresa tiver mais de um).
// Usado no carrossel de anúncios da home da plataforma (substitui o
// banner genérico por propaganda de verdade das empresas do sistema).
// Sorteia de novo a cada chamada — não guarda ordem fixa em lugar nenhum.
export const getAnunciosPromocao = createServerFn({ method: "POST" })
  .validator((d: { limite?: number } | undefined) => d ?? {})
  .handler(async ({ data }): Promise<AnuncioPromocao[]> => {
    const limite = data.limite ?? 4;
    const empresaRepository = container.resolve("empresaRepository");
    const produtoRepository = container.resolve("produtoRepository");

    const empresas = (await empresaRepository.listarPublicasAtivas()).filter(
      (e) => e.tipo === "trapeza",
    );
    // Embaralha (Fisher-Yates simplificado via sort aleatório — tá bom pro
    // tamanho de lista que a gente tem aqui) pra sortear qual empresa entra.
    const embaralhadas = [...empresas].sort(() => Math.random() - 0.5);

    const anuncios: AnuncioPromocao[] = [];
    for (const empresa of embaralhadas) {
      if (anuncios.length >= limite) break;
      const produtos = await produtoRepository.listarAtivosPorEmpresa(empresa.id);
      const promocoes = produtos.filter((p) => p.tipo === "produto" && p.tag === "promocao");
      if (promocoes.length === 0) continue;
      const escolhido = promocoes[Math.floor(Math.random() * promocoes.length)];
      anuncios.push({
        empresaId: empresa.id,
        empresaSlug: empresa.slug,
        empresaNome: empresa.nome,
        produtoId: escolhido.id,
        produtoNome: escolhido.nome,
        precoAtual: escolhido.preco,
        precoAntigo: escolhido.preco_antigo ?? null,
        imagemUrl: escolhido.imagem_url,
      });
    }

    return anuncios;
  });

export type ProdutoBuscaGlobal = {
  produtoId: string;
  nome: string;
  precoAtual: number;
  imagemUrl: string | null;
  empresaId: string;
  empresaNome: string;
  empresaSlug: string;
};

export type ProdutoCategoriaPlataforma = {
  produtoId: string;
  nome: string;
  descricaoCurta: string | null;
  precoAtual: number;
  imagemUrl: string | null;
  empresaId: string;
  empresaNome: string;
  empresaSlug: string;
};

// Produtos de empresas que pertencem a uma ou mais categorias de negócio.
// É a base da página de uma categoria-pai: o front manda os valores das
// subcategorias selecionadas, e o servidor reúne só cardápios Trapeza ativos.
export const listarProdutosPorCategoriasNegocio = createServerFn({ method: "POST" })
  .validator((d: { categorias: string[] }) => d)
  .handler(async ({ data }): Promise<ProdutoCategoriaPlataforma[]> => {
    const categorias = [...new Set(data.categorias.filter(Boolean))];
    if (categorias.length === 0) return [];

    const empresaRepository = container.resolve("empresaRepository");
    const produtoRepository = container.resolve("produtoRepository");
    const empresas = (await empresaRepository.listarPublicasAtivas()).filter(
      (empresa) => empresa.tipo === "trapeza" && empresa.categorias?.some((categoria) => categorias.includes(categoria)),
    );
    const empresaPorId = new Map(empresas.map((empresa) => [empresa.id, empresa]));
    const produtos = await produtoRepository.listarAtivosPorEmpresas(empresas.map((empresa) => empresa.id));

    return produtos.filter((produto) => produto.tipo === "produto").map((produto) => {
      const empresa = empresaPorId.get(produto.empresa_id)!;
      return {
        produtoId: produto.id,
        nome: produto.nome,
        descricaoCurta: produto.descricao_curta ?? null,
        precoAtual: produto.preco,
        imagemUrl: produto.imagem_url ?? null,
        empresaId: empresa.id,
        empresaNome: empresa.nome,
        empresaSlug: empresa.slug,
      };
    });
  });

// Público (sem login) — busca produto pelo nome em TODAS as empresas
// Trapeza ativas ao mesmo tempo ("digitei 'skol', onde vende?"). Usado na
// lista suspensa de busca da home, junto com o resultado de empresas.
export const buscarProdutosPlataforma = createServerFn({ method: "POST" })
  .validator((d: { termo: string; limite?: number }) => d)
  .handler(async ({ data }): Promise<ProdutoBuscaGlobal[]> => {
    const termo = data.termo.trim();
    const limite = data.limite ?? 8;
    if (!termo) return [];

    const produtoRepository = container.resolve("produtoRepository");
    const empresaRepository = container.resolve("empresaRepository");

    // Busca uma folga a mais (limite*3) porque parte dos achados pode
    // pertencer a empresa suspensa/externa e vai ser descartada abaixo.
    const produtos = await produtoRepository.buscarPorNomeGlobal(termo, limite * 3);
    if (produtos.length === 0) return [];

    const empresasAtivas = (await empresaRepository.listarPublicasAtivas()).filter(
      (e) => e.tipo === "trapeza",
    );
    const empresaPorId = new Map(empresasAtivas.map((e) => [e.id, e]));

    const resultado: ProdutoBuscaGlobal[] = [];
    for (const p of produtos) {
      const empresa = empresaPorId.get(p.empresa_id);
      if (!empresa) continue; // empresa suspensa/inativa — não mostra
      resultado.push({
        produtoId: p.id,
        nome: p.nome,
        precoAtual: p.preco,
        imagemUrl: p.imagem_url,
        empresaId: empresa.id,
        empresaNome: empresa.nome,
        empresaSlug: empresa.slug,
      });
      if (resultado.length >= limite) break;
    }
    return resultado;
  });

  export type ItemCatalogoHome = {
  id: string;
  tipo: "produto" | "servico";
  nome: string;
  descricaoCurta: string | null;
  preco: number;
  precoAntigo: number | null;
  imagemUrl: string | null;
  tag: string | null;
  empresaId: string;
  empresaNome: string;
  empresaSlug: string;
  empresaCidade: string | null;
  categoriasEmpresa: string[];
};

export const listarCatalogoHome = createServerFn({ method: "POST" })
  .validator((d: { limite?: number } | undefined) => d ?? {})
  .handler(async ({ data }): Promise<ItemCatalogoHome[]> => {
    const limite = Math.min(Math.max(data.limite ?? 240, 1), 500);

    const empresaRepository = container.resolve("empresaRepository");
    const produtoRepository = container.resolve("produtoRepository");

    const empresas = (
      await empresaRepository.listarPublicasAtivas()
    ).filter((empresa) => empresa.tipo === "trapeza");

    if (empresas.length === 0) return [];

    const empresaPorId = new Map(
      empresas.map((empresa) => [empresa.id, empresa]),
    );

    const itens = await produtoRepository.listarAtivosPorEmpresas(
      empresas.map((empresa) => empresa.id),
    );

    const porEmpresa = new Map<string, ItemCatalogoHome[]>();

    for (const item of itens) {
      if (item.tipo !== "produto" && item.tipo !== "servico") {
        continue;
      }

      const empresa = empresaPorId.get(item.empresa_id);
      if (!empresa) continue;

      const lista = porEmpresa.get(empresa.id) ?? [];

      lista.push({
        id: item.id,
        tipo: item.tipo,
        nome: item.nome,
        descricaoCurta: item.descricao_curta ?? null,
        preco: item.preco,
        precoAntigo: item.preco_antigo ?? null,
        imagemUrl: item.imagem_url ?? null,
        tag: item.tag ?? null,
        empresaId: empresa.id,
        empresaNome: empresa.nome,
        empresaSlug: empresa.slug,
        empresaCidade: empresa.cidade ?? null,
        categoriasEmpresa: empresa.categorias ?? [],
      });

      porEmpresa.set(empresa.id, lista);
    }

    // Distribui os itens entre empresas antes de repetir uma empresa.
    const resultado: ItemCatalogoHome[] = [];
    const listas = [...porEmpresa.values()];
    let indice = 0;

    while (resultado.length < limite) {
      let adicionou = false;

      for (const lista of listas) {
        const item = lista[indice];
        if (!item) continue;

        resultado.push(item);
        adicionou = true;

        if (resultado.length >= limite) break;
      }

      if (!adicionou) break;

      indice += 1;
    }

    return resultado;
  });