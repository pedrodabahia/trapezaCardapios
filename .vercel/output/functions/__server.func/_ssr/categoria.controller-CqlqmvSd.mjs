import { r as createServerFn } from "./server-dox-0I6C.mjs";
import { a as container, i as authTenantAtivo } from "./session-DEfiku9J.mjs";
import "./container-BBaES79Y.mjs";
import { t as createServerRpc } from "./createServerRpc-B2ym-H6g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/categoria.controller-CqlqmvSd.js
var saveCategoria_createServerFn_handler = createServerRpc({
	id: "c817796febe6c6ef85a304e6d3cffda27de3fa7a399f4fe39b47a5490b63e100",
	name: "saveCategoria",
	filename: "src/modules/categorias/controllers/categoria.controller.ts"
}, (opts) => saveCategoria.__executeServer(opts));
var saveCategoria = createServerFn({ method: "POST" }).validator((d) => d).handler(saveCategoria_createServerFn_handler, async ({ data: args }) => {
	await authTenantAtivo(args.token, args.empresaId);
	const { id } = await container.resolve("categoriaService").salvarCategoria(args.empresaId, args.categoria);
	return {
		ok: true,
		id
	};
});
var deleteCategoria_createServerFn_handler = createServerRpc({
	id: "2bdf6a74e6357cc8ff42efa5c2548a5a84c77bb765e73d92ca4f865dd20758d4",
	name: "deleteCategoria",
	filename: "src/modules/categorias/controllers/categoria.controller.ts"
}, (opts) => deleteCategoria.__executeServer(opts));
var deleteCategoria = createServerFn({ method: "POST" }).validator((d) => d).handler(deleteCategoria_createServerFn_handler, async ({ data: args }) => {
	await authTenantAtivo(args.token, args.empresaId);
	await container.resolve("categoriaService").removerCategoria(args.empresaId, args.categoriaId);
	return { ok: true };
});
var saveCategoriaOpcao_createServerFn_handler = createServerRpc({
	id: "3b60bd2b28051440eb5ae7e1121d4861df8859f164d004b96b63d9c670e48bf4",
	name: "saveCategoriaOpcao",
	filename: "src/modules/categorias/controllers/categoria.controller.ts"
}, (opts) => saveCategoriaOpcao.__executeServer(opts));
var saveCategoriaOpcao = createServerFn({ method: "POST" }).validator((d) => d).handler(saveCategoriaOpcao_createServerFn_handler, async ({ data: args }) => {
	await authTenantAtivo(args.token, args.empresaId);
	const { id } = await container.resolve("categoriaService").salvarCategoriaOpcao(args.empresaId, args.categoriaOpcao);
	return {
		ok: true,
		id
	};
});
var deleteCategoriaOpcao_createServerFn_handler = createServerRpc({
	id: "e11acc85f284c21ed9af0a36d20ec40e9d3a53cf459161962f1f35fcccda4f0f",
	name: "deleteCategoriaOpcao",
	filename: "src/modules/categorias/controllers/categoria.controller.ts"
}, (opts) => deleteCategoriaOpcao.__executeServer(opts));
var deleteCategoriaOpcao = createServerFn({ method: "POST" }).validator((d) => d).handler(deleteCategoriaOpcao_createServerFn_handler, async ({ data: args }) => {
	await authTenantAtivo(args.token, args.empresaId);
	await container.resolve("categoriaService").removerCategoriaOpcao(args.empresaId, args.categoriaOpcaoId);
	return { ok: true };
});
var saveOpcao_createServerFn_handler = createServerRpc({
	id: "5efaa99e9b3ac3b713e3095fa0cf51fb3e79779eaab71df88668f659cff89c49",
	name: "saveOpcao",
	filename: "src/modules/categorias/controllers/categoria.controller.ts"
}, (opts) => saveOpcao.__executeServer(opts));
var saveOpcao = createServerFn({ method: "POST" }).validator((d) => d).handler(saveOpcao_createServerFn_handler, async ({ data: args }) => {
	await authTenantAtivo(args.token, args.empresaId);
	const { id } = await container.resolve("categoriaService").salvarOpcao(args.empresaId, args.opcao);
	return {
		ok: true,
		id
	};
});
var deleteOpcao_createServerFn_handler = createServerRpc({
	id: "505eaba48c5b6469e48b41baae42bfee4ec28a74828f48f5842b717b6843a3bf",
	name: "deleteOpcao",
	filename: "src/modules/categorias/controllers/categoria.controller.ts"
}, (opts) => deleteOpcao.__executeServer(opts));
var deleteOpcao = createServerFn({ method: "POST" }).validator((d) => d).handler(deleteOpcao_createServerFn_handler, async ({ data: args }) => {
	await authTenantAtivo(args.token, args.empresaId);
	await container.resolve("categoriaService").removerOpcao(args.empresaId, args.opcaoId);
	return { ok: true };
});
//#endregion
export { deleteCategoriaOpcao_createServerFn_handler, deleteCategoria_createServerFn_handler, deleteOpcao_createServerFn_handler, saveCategoriaOpcao_createServerFn_handler, saveCategoria_createServerFn_handler, saveOpcao_createServerFn_handler };
