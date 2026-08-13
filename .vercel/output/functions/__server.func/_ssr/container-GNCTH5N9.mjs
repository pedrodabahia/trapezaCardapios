import { a as container, t as adminClient } from "./session-DEfiku9J.mjs";
import "./container-BBaES79Y.mjs";
import "./container-CzhoLjbe.mjs";
import "./container-Bkg_Gy42.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/container-GNCTH5N9.js
var SupabaseEmpresaRepository = class {
	sb() {
		return adminClient();
	}
	async buscarPorId(empresaId) {
		const { data, error } = await this.sb().from("empresas").select("*").eq("id", empresaId).single();
		if (error || !data) throw new Error(error?.message ?? "Empresa não encontrada");
		return data;
	}
	async buscarPorSlug(slug) {
		const { data, error } = await this.sb().from("empresas").select("*").eq("slug", slug).maybeSingle();
		if (error || !data) return null;
		return data;
	}
	async buscarPlanoId(empresaId) {
		const { data } = await this.sb().from("empresas").select("plano_id").eq("id", empresaId).maybeSingle();
		return data?.plano_id ?? null;
	}
	async listarPublicasAtivas() {
		const { data, error } = await this.sb().from("empresas").select("id, slug, nome, whatsapp, endereco, logo_url, status_pagamento").eq("status_pagamento", "ativo").order("criado_em", { ascending: false });
		if (error) throw new Error(error.message);
		return data ?? [];
	}
	async listarTodas() {
		const { data, error } = await this.sb().from("empresas").select("*").order("criado_em", { ascending: false });
		if (error) throw new Error(error.message);
		return data ?? [];
	}
	async listarParaDashboard() {
		const { data, error } = await this.sb().from("empresas").select("id, status_pagamento, plano_id, criado_em, proximo_vencimento");
		if (error) throw new Error(error.message);
		return data ?? [];
	}
	async atualizar(empresaId, patch) {
		const { error } = await this.sb().from("empresas").update(patch).eq("id", empresaId);
		if (error) throw new Error(error.message);
	}
	async atualizarStatus(empresaId, status) {
		const { error } = await this.sb().from("empresas").update({ status_pagamento: status }).eq("id", empresaId);
		if (error) throw new Error(error.message);
	}
	async buscarVencimento(empresaId) {
		const { data, error } = await this.sb().from("empresas").select("proximo_vencimento").eq("id", empresaId).maybeSingle();
		if (error) throw new Error(error.message);
		return data?.proximo_vencimento ?? null;
	}
	async atualizarVencimento(empresaId, proximoVencimento, status) {
		const { error } = await this.sb().from("empresas").update({
			proximo_vencimento: proximoVencimento,
			status_pagamento: status
		}).eq("id", empresaId);
		if (error) throw new Error(error.message);
	}
	async criar(dados) {
		const { data, error } = await this.sb().from("empresas").insert({
			slug: dados.slug,
			nome: dados.nome,
			whatsapp: dados.whatsapp,
			plano_id: dados.plano_id,
			status_pagamento: "ativo",
			proximo_vencimento: dados.proximo_vencimento
		}).select("id").single();
		if (error || !data) throw new Error(error?.message ?? "Failed to create empresa");
		return { id: data.id };
	}
	async remover(empresaId) {
		const { error } = await this.sb().from("empresas").delete().eq("id", empresaId);
		if (error) throw new Error(error.message);
	}
	async buscarConfig(empresaId) {
		const { data } = await this.sb().from("empresa_config").select("data").eq("empresa_id", empresaId).maybeSingle();
		return data?.data ?? {};
	}
	async salvarConfig(empresaId, config) {
		const { error } = await this.sb().from("empresa_config").upsert({
			empresa_id: empresaId,
			data: config
		});
		if (error) throw new Error(error.message);
	}
	async criarConfigVazia(empresaId) {
		await this.sb().from("empresa_config").insert({
			empresa_id: empresaId,
			data: {}
		});
	}
};
var EmpresaService = class {
	repository;
	usuarioRepository;
	constructor(repository, usuarioRepository) {
		this.repository = repository;
		this.usuarioRepository = usuarioRepository;
	}
	buscarPorId(empresaId) {
		return this.repository.buscarPorId(empresaId);
	}
	listarPublicasAtivas() {
		return this.repository.listarPublicasAtivas();
	}
	listarTodas() {
		return this.repository.listarTodas();
	}
	async atualizar(empresaId, patch) {
		await this.repository.atualizar(empresaId, patch);
	}
	async salvarConfig(empresaId, config) {
		await this.repository.salvarConfig(empresaId, config);
	}
	async criar(input) {
		const primeiroVencimento = /* @__PURE__ */ new Date();
		primeiroVencimento.setDate(primeiroVencimento.getDate() + 30);
		const empresa = await this.repository.criar({
			slug: input.slug,
			nome: input.nome,
			whatsapp: input.whatsapp,
			plano_id: input.planoId,
			proximo_vencimento: primeiroVencimento.toISOString().slice(0, 10)
		});
		await this.repository.criarConfigVazia(empresa.id);
		try {
			const { tempPassword } = await this.usuarioRepository.criarAdmin(input.adminEmail, empresa.id);
			return {
				ok: true,
				empresaId: empresa.id,
				tempPassword
			};
		} catch (err) {
			await this.repository.remover(empresa.id);
			throw err;
		}
	}
	async atualizarStatus(empresaId, status) {
		await this.repository.atualizarStatus(empresaId, status);
	}
	async renovarAssinatura(empresaId) {
		const vencimentoAtualStr = await this.repository.buscarVencimento(empresaId);
		const hoje = /* @__PURE__ */ new Date();
		const vencimentoAtual = vencimentoAtualStr ? /* @__PURE__ */ new Date(vencimentoAtualStr + "T00:00:00") : hoje;
		const base = vencimentoAtual > hoje ? vencimentoAtual : hoje;
		base.setDate(base.getDate() + 30);
		const proximoVencimento = base.toISOString().slice(0, 10);
		await this.repository.atualizarVencimento(empresaId, proximoVencimento, "ativo");
		return {
			ok: true,
			proximoVencimento
		};
	}
	async remover(empresaId) {
		await this.repository.remover(empresaId);
	}
};
var CardapioService = class {
	empresaRepository;
	produtoRepository;
	categoriaRepository;
	produtoService;
	constructor(empresaRepository, produtoRepository, categoriaRepository, produtoService) {
		this.empresaRepository = empresaRepository;
		this.produtoRepository = produtoRepository;
		this.categoriaRepository = categoriaRepository;
		this.produtoService = produtoService;
	}
	async buscarPublicoPorSlug(slug) {
		const empresa = await this.empresaRepository.buscarPorSlug(slug);
		if (!empresa || empresa.status_pagamento === "suspenso") return null;
		const [config, categorias, categoriasOpcao, produtos, opcoes] = await Promise.all([
			this.empresaRepository.buscarConfig(empresa.id),
			this.categoriaRepository.listarCategoriasAtivas(empresa.id),
			this.categoriaRepository.listarCategoriasOpcao(empresa.id),
			this.produtoRepository.listarAtivosPorEmpresa(empresa.id),
			this.categoriaRepository.listarOpcoes(empresa.id)
		]);
		return {
			empresa,
			config,
			categorias,
			categoriasOpcao,
			produtos,
			opcoes,
			produtoIngredientes: await this.produtoService.listarIngredientesPorProdutos(produtos.map((p) => p.id))
		};
	}
	async buscarCompletoAutenticado(empresaId) {
		const empresa = await this.empresaRepository.buscarPorId(empresaId);
		const [config, categorias, categoriasOpcao, produtos, opcoes] = await Promise.all([
			this.empresaRepository.buscarConfig(empresaId),
			this.categoriaRepository.listarCategoriasTodas(empresaId),
			this.categoriaRepository.listarCategoriasOpcao(empresaId),
			this.produtoRepository.listarTodosPorEmpresa(empresaId),
			this.categoriaRepository.listarOpcoes(empresaId)
		]);
		return {
			empresa,
			config,
			categorias,
			categoriasOpcao,
			produtos,
			opcoes,
			produtoIngredientes: await this.produtoService.listarIngredientesPorProdutos(produtos.map((p) => p.id))
		};
	}
};
var DashboardService = class {
	empresaRepository;
	planoRepository;
	pedidoRepository;
	constructor(empresaRepository, planoRepository, pedidoRepository) {
		this.empresaRepository = empresaRepository;
		this.planoRepository = planoRepository;
		this.pedidoRepository = pedidoRepository;
	}
	async buscarStats() {
		const [empresas, planos] = await Promise.all([this.empresaRepository.listarParaDashboard(), this.planoRepository.listarTodos()]);
		const planoMap = new Map(planos.map((p) => [p.id, p]));
		const hoje = /* @__PURE__ */ new Date();
		const em7dias = /* @__PURE__ */ new Date();
		em7dias.setDate(hoje.getDate() + 7);
		const ha30dias = /* @__PURE__ */ new Date();
		ha30dias.setDate(hoje.getDate() - 30);
		const porStatus = {
			ativo: 0,
			atrasado: 0,
			suspenso: 0
		};
		const porPlano = /* @__PURE__ */ new Map();
		let mrr = 0;
		let pertoDeVencer = 0;
		let novasUltimos30d = 0;
		for (const e of empresas) {
			const status = e.status_pagamento;
			if (status in porStatus) porStatus[status]++;
			const plano = planoMap.get(e.plano_id);
			if (plano) {
				if (status === "ativo") mrr += Number(plano.preco_mensal);
				const atual = porPlano.get(e.plano_id) ?? {
					planoId: e.plano_id,
					nome: plano.nome,
					count: 0
				};
				atual.count++;
				porPlano.set(e.plano_id, atual);
			}
			if (status === "ativo" && e.proximo_vencimento && /* @__PURE__ */ new Date(e.proximo_vencimento + "T00:00:00") <= em7dias) pertoDeVencer++;
			if (new Date(e.criado_em) >= ha30dias) novasUltimos30d++;
		}
		const pedidosUltimos30d = await this.pedidoRepository.contarDesde(ha30dias);
		return {
			total: empresas.length,
			porStatus,
			pertoDeVencer,
			mrr,
			porPlano: [...porPlano.values()].sort((a, b) => b.count - a.count),
			novasUltimos30d,
			pedidosUltimos30d
		};
	}
};
var SupabaseProdutoRepository = class {
	sb() {
		return adminClient();
	}
	async buscarPorId(empresaId, produtoId) {
		const { data, error } = await this.sb().from("produtos").select("*").eq("id", produtoId).eq("empresa_id", empresaId).eq("ativo", true).maybeSingle();
		if (error) throw new Error(error.message);
		return data ?? null;
	}
	async buscarPorIdIgnorandoAtivo(empresaId, produtoId) {
		const { data, error } = await this.sb().from("produtos").select("*").eq("id", produtoId).eq("empresa_id", empresaId).maybeSingle();
		if (error) throw new Error(error.message);
		return data ?? null;
	}
	async listarAtivosPorEmpresa(empresaId) {
		const { data, error } = await this.sb().from("produtos").select("*").eq("empresa_id", empresaId).eq("ativo", true).order("ordem");
		if (error) throw new Error(error.message);
		return data ?? [];
	}
	async listarTodosPorEmpresa(empresaId) {
		const { data, error } = await this.sb().from("produtos").select("*").eq("empresa_id", empresaId).order("ordem");
		if (error) throw new Error(error.message);
		return data ?? [];
	}
	async contarPorEmpresa(empresaId) {
		const { count } = await this.sb().from("produtos").select("id", {
			count: "exact",
			head: true
		}).eq("empresa_id", empresaId);
		return count ?? 0;
	}
	async salvar(empresaId, produto) {
		if (produto.id) {
			const { id, ...patch } = produto;
			const { error } = await this.sb().from("produtos").update(patch).eq("id", id).eq("empresa_id", empresaId);
			if (error) throw new Error(error.message);
			return { id };
		}
		const { id: _ignored, ...insertable } = produto;
		const { data, error } = await this.sb().from("produtos").insert({
			...insertable,
			empresa_id: empresaId
		}).select("id").single();
		if (error) throw new Error(error.message);
		return { id: data.id };
	}
	async remover(empresaId, produtoId) {
		const { error } = await this.sb().from("produtos").delete().eq("id", produtoId).eq("empresa_id", empresaId);
		if (error) throw new Error(error.message);
	}
};
var SupabaseProdutoIngredienteRepository = class {
	sb() {
		return adminClient();
	}
	async listarPorProdutoIds(produtoIds) {
		if (produtoIds.length === 0) return [];
		const { data, error } = await this.sb().from("produto_ingredientes").select("*").in("produto_id", produtoIds).order("ordem");
		if (error) throw new Error(error.message);
		return data ?? [];
	}
	async substituirDoProduto(produtoId, itens) {
		const { error: errDelete } = await this.sb().from("produto_ingredientes").delete().eq("produto_id", produtoId);
		if (errDelete) throw new Error(errDelete.message);
		if (itens.length === 0) return;
		const linhas = itens.map((it, i) => ({
			produto_id: produtoId,
			nome: it.nome.trim(),
			removivel: it.removivel,
			ordem: i
		}));
		const { error: errInsert } = await this.sb().from("produto_ingredientes").insert(linhas);
		if (errInsert) throw new Error(errInsert.message);
	}
};
var ProdutoService = class {
	repository;
	ingredienteRepository;
	constructor(repository, ingredienteRepository) {
		this.repository = repository;
		this.ingredienteRepository = ingredienteRepository;
	}
	buscarPorId(empresaId, produtoId) {
		return this.repository.buscarPorId(empresaId, produtoId);
	}
	listarAtivos(empresaId) {
		return this.repository.listarAtivosPorEmpresa(empresaId);
	}
	listarTodos(empresaId) {
		return this.repository.listarTodosPorEmpresa(empresaId);
	}
	async salvar(empresaId, produto, limiteProdutosDoPlano) {
		if (!produto.id && limiteProdutosDoPlano != null) {
			if (await this.repository.contarPorEmpresa(empresaId) >= limiteProdutosDoPlano) throw new Error(`Limite de ${limiteProdutosDoPlano} produtos do seu plano atingido. Faça upgrade pra cadastrar mais.`);
		}
		return this.repository.salvar(empresaId, produto);
	}
	async remover(empresaId, produtoId) {
		await this.repository.remover(empresaId, produtoId);
	}
	async listarIngredientesPorProdutos(produtoIds) {
		const todos = await this.ingredienteRepository.listarPorProdutoIds(produtoIds);
		const mapa = {};
		for (const item of todos) (mapa[item.produto_id] ??= []).push(item);
		return mapa;
	}
	async salvarIngredientes(empresaId, produtoId, itens) {
		if (!await this.repository.buscarPorIdIgnorandoAtivo(empresaId, produtoId)) throw new Error("Produto não encontrado");
		await this.ingredienteRepository.substituirDoProduto(produtoId, itens);
	}
};
container.register("produtoRepository", () => new SupabaseProdutoRepository());
container.register("produtoIngredienteRepository", () => new SupabaseProdutoIngredienteRepository());
container.register("produtoService", (c) => new ProdutoService(c.resolve("produtoRepository"), c.resolve("produtoIngredienteRepository")));
var SupabasePlanoRepository = class {
	sb() {
		return adminClient();
	}
	async listarTodos() {
		const { data, error } = await this.sb().from("planos").select("*").order("preco_mensal");
		if (error) throw new Error(error.message);
		return data ?? [];
	}
	async buscarPorId(planoId) {
		const { data, error } = await this.sb().from("planos").select("*").eq("id", planoId).single();
		if (error) throw new Error(error.message);
		return data;
	}
	async buscarLimiteProdutos(planoId) {
		const { data } = await this.sb().from("planos").select("limite_produtos").eq("id", planoId).maybeSingle();
		return data?.limite_produtos ?? null;
	}
};
var PlanoService = class {
	planoRepository;
	empresaRepository;
	produtoRepository;
	constructor(planoRepository, empresaRepository, produtoRepository) {
		this.planoRepository = planoRepository;
		this.empresaRepository = empresaRepository;
		this.produtoRepository = produtoRepository;
	}
	listarTodos() {
		return this.planoRepository.listarTodos();
	}
	async buscarPlanoDaEmpresa(empresaId) {
		const empresa = await this.empresaRepository.buscarPorId(empresaId);
		const plano = await this.planoRepository.buscarPorId(empresa.plano_id);
		const produtosUsados = await this.produtoRepository.contarPorEmpresa(empresaId);
		return {
			plano,
			status_pagamento: empresa.status_pagamento,
			produtos_usados: produtosUsados
		};
	}
};
container.register("planoRepository", () => new SupabasePlanoRepository());
container.register("planoService", (c) => new PlanoService(c.resolve("planoRepository"), c.resolve("empresaRepository"), c.resolve("produtoRepository")));
container.register("empresaRepository", () => new SupabaseEmpresaRepository());
container.register("empresaService", (c) => new EmpresaService(c.resolve("empresaRepository"), c.resolve("usuarioRepository")));
container.register("cardapioService", (c) => new CardapioService(c.resolve("empresaRepository"), c.resolve("produtoRepository"), c.resolve("categoriaRepository"), c.resolve("produtoService")));
container.register("dashboardService", (c) => new DashboardService(c.resolve("empresaRepository"), c.resolve("planoRepository"), c.resolve("pedidoRepository")));
//#endregion
export {};
