import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { a as container, i as authTenantAtivo } from "./session-DEfiku9J.mjs";
import "./container-GNCTH5N9.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/produto.controller-DH4wmMCJ.js
var getProdutoById_createServerFn_handler = createServerRpc({
	id: "1f9d2f5d98086325923975f5f2c156d0dc1be2c719485ece61a6ed5e40d4548b",
	name: "getProdutoById",
	filename: "src/modules/produtos/controllers/produto.controller.ts"
}, (opts) => getProdutoById.__executeServer(opts));
var getProdutoById = createServerFn({ method: "POST" }).validator((d) => d).handler(getProdutoById_createServerFn_handler, async ({ data }) => {
	return container.resolve("produtoService").buscarPorId(data.empresaId, data.produtoId);
});
var saveProduto_createServerFn_handler = createServerRpc({
	id: "d3002c7ac2300d6b3faf55868eed773ce66dc0dbd32033eda7bd716726b1c336",
	name: "saveProduto",
	filename: "src/modules/produtos/controllers/produto.controller.ts"
}, (opts) => saveProduto.__executeServer(opts));
var saveProduto = createServerFn({ method: "POST" }).validator((d) => d).handler(saveProduto_createServerFn_handler, async ({ data: args }) => {
	await authTenantAtivo(args.token, args.empresaId);
	const produtoService = container.resolve("produtoService");
	let limite = null;
	if (!args.produto.id) {
		const empresaRepository = container.resolve("empresaRepository");
		const planoRepository = container.resolve("planoRepository");
		const planoId = await empresaRepository.buscarPlanoId(args.empresaId);
		if (planoId) limite = await planoRepository.buscarLimiteProdutos(planoId);
	}
	const { id } = await produtoService.salvar(args.empresaId, args.produto, limite);
	return {
		ok: true,
		id
	};
});
var deleteProduto_createServerFn_handler = createServerRpc({
	id: "b08d2730b39d7bf3e00a4166a4d6af0642fe2cffd9493b553421b0e4a7951351",
	name: "deleteProduto",
	filename: "src/modules/produtos/controllers/produto.controller.ts"
}, (opts) => deleteProduto.__executeServer(opts));
var deleteProduto = createServerFn({ method: "POST" }).validator((d) => d).handler(deleteProduto_createServerFn_handler, async ({ data: args }) => {
	await authTenantAtivo(args.token, args.empresaId);
	await container.resolve("produtoService").remover(args.empresaId, args.produtoId);
	return { ok: true };
});
var saveProdutoIngredientes_createServerFn_handler = createServerRpc({
	id: "4ce2766800d651f3076ac10b5ee0583470e42d0b8c0a56bd2eaf3462aa870696",
	name: "saveProdutoIngredientes",
	filename: "src/modules/produtos/controllers/produto.controller.ts"
}, (opts) => saveProdutoIngredientes.__executeServer(opts));
var saveProdutoIngredientes = createServerFn({ method: "POST" }).validator((d) => d).handler(saveProdutoIngredientes_createServerFn_handler, async ({ data: args }) => {
	await authTenantAtivo(args.token, args.empresaId);
	await container.resolve("produtoService").salvarIngredientes(args.empresaId, args.produtoId, args.itens);
	return { ok: true };
});
//#endregion
export { deleteProduto_createServerFn_handler, getProdutoById_createServerFn_handler, saveProdutoIngredientes_createServerFn_handler, saveProduto_createServerFn_handler };
