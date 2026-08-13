import { a as container, t as adminClient } from "./session-DEfiku9J.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/container-BBaES79Y.js
var SupabaseCategoriaRepository = class {
	sb() {
		return adminClient();
	}
	async listarCategoriasAtivas(empresaId) {
		const { data, error } = await this.sb().from("categorias").select("*").eq("empresa_id", empresaId).eq("ativo", true).order("ordem");
		if (error) throw new Error(error.message);
		return data ?? [];
	}
	async listarCategoriasTodas(empresaId) {
		const { data, error } = await this.sb().from("categorias").select("*").eq("empresa_id", empresaId).order("ordem");
		if (error) throw new Error(error.message);
		return data ?? [];
	}
	async salvarCategoria(empresaId, categoria) {
		if (categoria.id) {
			const { id, ...patch } = categoria;
			const { error } = await this.sb().from("categorias").update(patch).eq("id", id).eq("empresa_id", empresaId);
			if (error) throw new Error(error.message);
			return { id };
		}
		const { id: _ignored, ...insertable } = categoria;
		const { data, error } = await this.sb().from("categorias").insert({
			...insertable,
			empresa_id: empresaId
		}).select("id").single();
		if (error) throw new Error(error.message);
		return { id: data.id };
	}
	async removerCategoria(empresaId, categoriaId) {
		const { error } = await this.sb().from("categorias").delete().eq("id", categoriaId).eq("empresa_id", empresaId);
		if (error) throw new Error(error.message);
	}
	async listarCategoriasOpcao(empresaId) {
		const { data, error } = await this.sb().from("categorias_opcao").select("*").eq("empresa_id", empresaId).order("ordem");
		if (error) throw new Error(error.message);
		return data ?? [];
	}
	async salvarCategoriaOpcao(empresaId, categoriaOpcao) {
		if (categoriaOpcao.id) {
			const { id, ...patch } = categoriaOpcao;
			const { error } = await this.sb().from("categorias_opcao").update(patch).eq("id", id).eq("empresa_id", empresaId);
			if (error) throw new Error(error.message);
			return { id };
		}
		const { id: _ignored, ...insertable } = categoriaOpcao;
		const { data, error } = await this.sb().from("categorias_opcao").insert({
			...insertable,
			empresa_id: empresaId
		}).select("id").single();
		if (error) throw new Error(error.message);
		return { id: data.id };
	}
	async removerCategoriaOpcao(empresaId, categoriaOpcaoId) {
		const { error } = await this.sb().from("categorias_opcao").delete().eq("id", categoriaOpcaoId).eq("empresa_id", empresaId);
		if (error) throw new Error(error.message);
	}
	async listarCategoriasComOpcao(empresaId, categoriaOpcaoId) {
		const { data } = await this.sb().from("categorias").select("id, categorias_opcao_ids").eq("empresa_id", empresaId).contains("categorias_opcao_ids", [categoriaOpcaoId]);
		return data ?? [];
	}
	async atualizarCategoriasOpcaoIds(categoriaId, ids) {
		await this.sb().from("categorias").update({ categorias_opcao_ids: ids }).eq("id", categoriaId);
	}
	async listarOpcoes(empresaId) {
		const { data, error } = await this.sb().from("opcoes_personalizacao").select("*").eq("empresa_id", empresaId).order("ordem");
		if (error) throw new Error(error.message);
		return data ?? [];
	}
	async salvarOpcao(empresaId, opcao) {
		if (opcao.id) {
			const { id, ...patch } = opcao;
			const { error } = await this.sb().from("opcoes_personalizacao").update(patch).eq("id", id).eq("empresa_id", empresaId);
			if (error) throw new Error(error.message);
			return { id };
		}
		const { id: _ignored, ...insertable } = opcao;
		const { data, error } = await this.sb().from("opcoes_personalizacao").insert({
			...insertable,
			empresa_id: empresaId
		}).select("id").single();
		if (error) throw new Error(error.message);
		return { id: data.id };
	}
	async removerOpcao(empresaId, opcaoId) {
		const { error } = await this.sb().from("opcoes_personalizacao").delete().eq("id", opcaoId).eq("empresa_id", empresaId);
		if (error) throw new Error(error.message);
	}
};
var CategoriaService = class {
	repository;
	constructor(repository) {
		this.repository = repository;
	}
	listarAtivas(empresaId) {
		return this.repository.listarCategoriasAtivas(empresaId);
	}
	listarTodas(empresaId) {
		return this.repository.listarCategoriasTodas(empresaId);
	}
	salvarCategoria(empresaId, categoria) {
		return this.repository.salvarCategoria(empresaId, categoria);
	}
	async removerCategoria(empresaId, categoriaId) {
		await this.repository.removerCategoria(empresaId, categoriaId);
	}
	listarOpcoesCategoria(empresaId) {
		return this.repository.listarCategoriasOpcao(empresaId);
	}
	salvarCategoriaOpcao(empresaId, categoriaOpcao) {
		return this.repository.salvarCategoriaOpcao(empresaId, categoriaOpcao);
	}
	async removerCategoriaOpcao(empresaId, categoriaOpcaoId) {
		const categorias = await this.repository.listarCategoriasComOpcao(empresaId, categoriaOpcaoId);
		for (const cat of categorias) {
			const novoIds = cat.categorias_opcao_ids.filter((id) => id !== categoriaOpcaoId);
			await this.repository.atualizarCategoriasOpcaoIds(cat.id, novoIds);
		}
		await this.repository.removerCategoriaOpcao(empresaId, categoriaOpcaoId);
	}
	listarOpcoes(empresaId) {
		return this.repository.listarOpcoes(empresaId);
	}
	salvarOpcao(empresaId, opcao) {
		return this.repository.salvarOpcao(empresaId, opcao);
	}
	async removerOpcao(empresaId, opcaoId) {
		await this.repository.removerOpcao(empresaId, opcaoId);
	}
};
container.register("categoriaRepository", () => new SupabaseCategoriaRepository());
container.register("categoriaService", (c) => new CategoriaService(c.resolve("categoriaRepository")));
//#endregion
export {};
