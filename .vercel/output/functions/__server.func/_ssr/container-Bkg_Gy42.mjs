import { a as container, t as adminClient } from "./session-DEfiku9J.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/container-Bkg_Gy42.js
var SupabasePedidoRepository = class {
	sb() {
		return adminClient();
	}
	async criar(pedido) {
		const { data, error } = await this.sb().from("pedidos").insert(pedido).select("id, numero").single();
		if (error) throw new Error(error.message);
		return {
			id: data.id,
			numero: data.numero
		};
	}
	async listarPorEmpresa(empresaId, limite = 200) {
		const { data, error } = await this.sb().from("pedidos").select("*").eq("empresa_id", empresaId).order("criado_em", { ascending: false }).limit(limite);
		if (error) throw new Error(error.message);
		return data ?? [];
	}
	async atualizarStatus(pedidoId, empresaId, status) {
		const { error } = await this.sb().from("pedidos").update({ status }).eq("id", pedidoId).eq("empresa_id", empresaId);
		if (error) throw new Error(error.message);
	}
	async contarDesde(data) {
		const { count } = await this.sb().from("pedidos").select("id", {
			count: "exact",
			head: true
		}).gte("criado_em", data.toISOString());
		return count ?? 0;
	}
};
var SupabasePedidoPricingRepository = class {
	sb() {
		return adminClient();
	}
	async buscarStatusEmpresa(empresaId) {
		const { data } = await this.sb().from("empresas").select("status_pagamento").eq("id", empresaId).maybeSingle();
		return data?.status_pagamento ?? null;
	}
	async buscarProdutosPorIds(empresaId, produtoIds) {
		const { data, error } = await this.sb().from("produtos").select("id, nome, preco, ativo").eq("empresa_id", empresaId).in("id", produtoIds);
		if (error) throw new Error(error.message);
		return data ?? [];
	}
	async buscarOpcoesPorNome(empresaId) {
		const { data, error } = await this.sb().from("opcoes_personalizacao").select("nome, preco_adicional").eq("empresa_id", empresaId);
		if (error) throw new Error(error.message);
		return data ?? [];
	}
	async buscarConfigEmpresa(empresaId) {
		const { data } = await this.sb().from("empresa_config").select("data").eq("empresa_id", empresaId).maybeSingle();
		return data?.data ?? {};
	}
};
var FORMAS_VALIDAS = [
	"pix",
	"cartao",
	"dinheiro"
];
var PedidoService = class {
	repository;
	pricing;
	constructor(repository, pricing) {
		this.repository = repository;
		this.pricing = pricing;
	}
	async criar(data) {
		const clienteNome = data.clienteNome.trim().slice(0, 120);
		const clienteTelefone = data.clienteTelefone.trim().slice(0, 40);
		if (!clienteNome || !clienteTelefone) throw new Error("Nome e telefone são obrigatórios");
		if (!data.itens.length) throw new Error("Carrinho vazio");
		const formaPagamento = data.formaPagamento && FORMAS_VALIDAS.includes(data.formaPagamento) ? data.formaPagamento : null;
		const trocoPara = formaPagamento === "dinheiro" && data.trocoPara != null && data.trocoPara > 0 ? Number(data.trocoPara) : null;
		const statusEmpresa = await this.pricing.buscarStatusEmpresa(data.empresaId);
		if (!statusEmpresa || statusEmpresa === "suspenso") throw new Error("Empresa indisponível no momento");
		const produtoIds = [...new Set(data.itens.map((i) => i.produtoId))];
		const produtos = await this.pricing.buscarProdutosPorIds(data.empresaId, produtoIds);
		const produtoMap = new Map(produtos.map((p) => [p.id, p]));
		const opcoes = await this.pricing.buscarOpcoesPorNome(data.empresaId);
		const precoOpcaoPorNome = new Map(opcoes.map((o) => [o.nome, Number(o.preco_adicional)]));
		const cfg = await this.pricing.buscarConfigEmpresa(data.empresaId);
		const itensCalculados = [];
		let subtotal = 0;
		for (const it of data.itens) {
			const produto = produtoMap.get(it.produtoId);
			if (!produto || !produto.ativo) throw new Error("Um dos itens do carrinho não está mais disponível");
			const qtd = Math.max(1, Math.min(50, Math.floor(it.qtd)));
			let precoUnit = Number(produto.preco);
			for (const nomeEscolhido of it.customization?.opcoes ?? []) if (precoOpcaoPorNome.has(nomeEscolhido)) precoUnit += precoOpcaoPorNome.get(nomeEscolhido);
			subtotal += precoUnit * qtd;
			itensCalculados.push({
				nome: produto.nome,
				qtd,
				preco_unit: precoUnit,
				obs: it.obs,
				ingredientes_removidos: it.customization?.ingredientesRemovidos?.length ? it.customization.ingredientesRemovidos : void 0
			});
		}
		const frete = cfg.frete ?? {
			taxa: 0,
			gratis_acima_de: null,
			gratis_habilitado: false
		};
		const bairros = cfg.bairros ?? [];
		let taxaEntregaBase;
		if (bairros.length > 0) {
			const bairro = bairros.find((b) => b.id === data.bairroId);
			if (!bairro) throw new Error("Escolha um bairro válido pra calcular a entrega");
			taxaEntregaBase = Number(bairro.fee);
		} else taxaEntregaBase = Number(frete.taxa ?? 0);
		const entregaGratis = !!frete.gratis_habilitado && frete.gratis_acima_de != null && subtotal >= Number(frete.gratis_acima_de);
		const taxaEntrega = subtotal > 0 && !entregaGratis ? taxaEntregaBase : 0;
		let desconto = 0;
		let cupomAplicado;
		if (data.cupom) {
			const found = (cfg.cupons ?? []).find((c) => c.code.toUpperCase() === data.cupom.toUpperCase());
			if (found) {
				desconto = subtotal * Number(found.discount) / 100;
				cupomAplicado = found.code;
			}
		}
		const valorTotal = Math.max(0, subtotal + taxaEntrega - desconto);
		const trocoParaFinal = trocoPara != null && trocoPara >= valorTotal ? trocoPara : null;
		const numero = `P${Date.now().toString(36).toUpperCase().slice(-6)}`;
		const criado = await this.repository.criar({
			empresa_id: data.empresaId,
			numero,
			cliente_nome: clienteNome,
			cliente_telefone: clienteTelefone,
			endereco: data.endereco ?? null,
			itens: itensCalculados,
			subtotal,
			taxa_entrega: taxaEntrega,
			desconto,
			valor_total: valorTotal,
			cupom: cupomAplicado ?? null,
			forma_pagamento: formaPagamento,
			troco_para: trocoParaFinal
		});
		return {
			ok: true,
			id: criado.id,
			numero: criado.numero,
			itens: itensCalculados,
			subtotal,
			taxaEntrega,
			desconto,
			valorTotal,
			cupom: cupomAplicado,
			formaPagamento,
			trocoPara: trocoParaFinal
		};
	}
	async listarPorEmpresa(empresaId) {
		return this.repository.listarPorEmpresa(empresaId, 200);
	}
	async atualizarStatus(pedidoId, empresaId, status) {
		await this.repository.atualizarStatus(pedidoId, empresaId, status);
	}
};
container.register("pedidoRepository", () => new SupabasePedidoRepository());
container.register("pedidoPricingRepository", () => new SupabasePedidoPricingRepository());
container.register("pedidoService", (c) => new PedidoService(c.resolve("pedidoRepository"), c.resolve("pedidoPricingRepository")));
//#endregion
export {};
