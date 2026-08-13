import { createRequire } from "node:module";
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
var __require = /* #__PURE__ */ (() => createRequire(import.meta.url))();
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-RQ4HTkDC.js
var manifest = {
	"13507aeda2343367cbb4dce494db3add3c471f9d0860e83c08afbaef1e1e238c": {
		functionName: "listPedidosEmpresa_createServerFn_handler",
		importer: () => import("./_ssr/pedido.controller-DMqVghf1.mjs")
	},
	"1f9d2f5d98086325923975f5f2c156d0dc1be2c719485ece61a6ed5e40d4548b": {
		functionName: "getProdutoById_createServerFn_handler",
		importer: () => import("./_ssr/produto.controller-DH4wmMCJ.mjs")
	},
	"241adb6fcb1448978786d7f8c42c588e18dd642a070f3b1f4feb688031722199": {
		functionName: "getEmpresaById_createServerFn_handler",
		importer: () => import("./_ssr/empresa.controller-CEdPO6fm.mjs")
	},
	"2b7879f4d8c0771131cee89e860337c7b8a73629df83e1f8452652c714f295e6": {
		functionName: "refreshAdminSession_createServerFn_handler",
		importer: () => import("./_ssr/auth.controller-CR9epmh9.mjs")
	},
	"2bdf6a74e6357cc8ff42efa5c2548a5a84c77bb765e73d92ca4f865dd20758d4": {
		functionName: "deleteCategoria_createServerFn_handler",
		importer: () => import("./_ssr/categoria.controller-jsIfzX-h.mjs")
	},
	"2d295819431050779b7804c3ab727a5ede716aa85d5b0679bddbba94566f9d3c": {
		functionName: "getEmpresaCompletaAuth_createServerFn_handler",
		importer: () => import("./_ssr/empresa.controller-CEdPO6fm.mjs")
	},
	"2e3617712acafe716affcc9522fe3b185e0c2c961a3f276f879e118c9493f182": {
		functionName: "changeClientPassword_createServerFn_handler",
		importer: () => import("./_ssr/auth.controller-CR9epmh9.mjs")
	},
	"33c6dc0de50ef43e4996d12b6e285f786409978446e8ea7b58361aee074138cf": {
		functionName: "uploadImagem_createServerFn_handler",
		importer: () => import("./_ssr/midia.controller-BAcHQFQe.mjs")
	},
	"345d1d5db58b0eb64c47bb4379699312caa7efa25dbe238a9f130c48400013f0": {
		functionName: "renovarAssinatura_createServerFn_handler",
		importer: () => import("./_ssr/empresa.controller-CEdPO6fm.mjs")
	},
	"3687be9505a0fa14d06dee159030afb7297b1ca97f31bbcc0e6f039b4a4003c8": {
		functionName: "listEmpresasAdmin_createServerFn_handler",
		importer: () => import("./_ssr/empresa.controller-CEdPO6fm.mjs")
	},
	"3b60bd2b28051440eb5ae7e1121d4861df8859f164d004b96b63d9c670e48bf4": {
		functionName: "saveCategoriaOpcao_createServerFn_handler",
		importer: () => import("./_ssr/categoria.controller-jsIfzX-h.mjs")
	},
	"3cfbb44be2aff76575a265297dfa40d13cc35ad5bcf824467862168dc6dd8780": {
		functionName: "deleteEmpresa_createServerFn_handler",
		importer: () => import("./_ssr/empresa.controller-CEdPO6fm.mjs")
	},
	"4ce2766800d651f3076ac10b5ee0583470e42d0b8c0a56bd2eaf3462aa870696": {
		functionName: "saveProdutoIngredientes_createServerFn_handler",
		importer: () => import("./_ssr/produto.controller-DH4wmMCJ.mjs")
	},
	"4f77d60e0497f31580e0d7e49c565e064b7a00263edea423d0036b21e260af08": {
		functionName: "updateEmpresa_createServerFn_handler",
		importer: () => import("./_ssr/empresa.controller-CEdPO6fm.mjs")
	},
	"505eaba48c5b6469e48b41baae42bfee4ec28a74828f48f5842b717b6843a3bf": {
		functionName: "deleteOpcao_createServerFn_handler",
		importer: () => import("./_ssr/categoria.controller-jsIfzX-h.mjs")
	},
	"5de3a93d98cf34e035e16d4f2933f7dd6ed81c63a080ad4c06ed60a196a9b292": {
		functionName: "updateEmpresaStatus_createServerFn_handler",
		importer: () => import("./_ssr/empresa.controller-CEdPO6fm.mjs")
	},
	"5efaa99e9b3ac3b713e3095fa0cf51fb3e79779eaab71df88668f659cff89c49": {
		functionName: "saveOpcao_createServerFn_handler",
		importer: () => import("./_ssr/categoria.controller-jsIfzX-h.mjs")
	},
	"5fb9c17a7f65e824ca15449d35eb2df903d46a6552c2f94421ba35f6ba342305": {
		functionName: "adminLogin_createServerFn_handler",
		importer: () => import("./_ssr/auth.controller-CR9epmh9.mjs")
	},
	"63032f8bd5f9ffd5d9565109280793d4bef00cd07960981d2a61a5e35f207617": {
		functionName: "platformLogin_createServerFn_handler",
		importer: () => import("./_ssr/auth.controller-CR9epmh9.mjs")
	},
	"6ea2d98a1ecfad98f8484399c1a7d0a510e6b3747dfec77d30830be64f91e56d": {
		functionName: "getEmpresaBySlug_createServerFn_handler",
		importer: () => import("./_ssr/empresa.controller-CEdPO6fm.mjs")
	},
	"91ec63f35e1d1ef8a60aa883b532f7e88b6e2c24f7c4c713b3deda4c5967488a": {
		functionName: "changeOwnPassword_createServerFn_handler",
		importer: () => import("./_ssr/auth.controller-CR9epmh9.mjs")
	},
	"92416fb2fa11d21dd9fa1c4f919aa13f2c0045f241cd82d47971dea648a397bb": {
		functionName: "listEmpresasPublicas_createServerFn_handler",
		importer: () => import("./_ssr/empresa.controller-CEdPO6fm.mjs")
	},
	"924a5c648d95bd03df0735ce12f5d19a979664db56157e9e9b9ba52b123831c6": {
		functionName: "createPedido_createServerFn_handler",
		importer: () => import("./_ssr/pedido.controller-DMqVghf1.mjs")
	},
	"b08d2730b39d7bf3e00a4166a4d6af0642fe2cffd9493b553421b0e4a7951351": {
		functionName: "deleteProduto_createServerFn_handler",
		importer: () => import("./_ssr/produto.controller-DH4wmMCJ.mjs")
	},
	"b5d80d80521796800eb58e4af63d6f825ecd3e3bf9138505f719576634947db9": {
		functionName: "updatePedidoStatus_createServerFn_handler",
		importer: () => import("./_ssr/pedido.controller-DMqVghf1.mjs")
	},
	"b7b30b624f88b5e4470babb7277aef8d4daf64caa6559d3b5c101b90cdb46631": {
		functionName: "saveEmpresaConfig_createServerFn_handler",
		importer: () => import("./_ssr/empresa.controller-CEdPO6fm.mjs")
	},
	"b920b277ab64e44a347e2283871330378a8a43017a8445cc0131467bae80a178": {
		functionName: "getPlanoDaEmpresa_createServerFn_handler",
		importer: () => import("./_ssr/plano.controller-nYYtgGmX.mjs")
	},
	"c817796febe6c6ef85a304e6d3cffda27de3fa7a399f4fe39b47a5490b63e100": {
		functionName: "saveCategoria_createServerFn_handler",
		importer: () => import("./_ssr/categoria.controller-jsIfzX-h.mjs")
	},
	"cc771878d76a004fc06dd11c235d5d6a7309aea75e073f6bd84cfce0753b7d8d": {
		functionName: "getDashboardStats_createServerFn_handler",
		importer: () => import("./_ssr/empresa.controller-CEdPO6fm.mjs")
	},
	"d3002c7ac2300d6b3faf55868eed773ce66dc0dbd32033eda7bd716726b1c336": {
		functionName: "saveProduto_createServerFn_handler",
		importer: () => import("./_ssr/produto.controller-DH4wmMCJ.mjs")
	},
	"e11acc85f284c21ed9af0a36d20ec40e9d3a53cf459161962f1f35fcccda4f0f": {
		functionName: "deleteCategoriaOpcao_createServerFn_handler",
		importer: () => import("./_ssr/categoria.controller-jsIfzX-h.mjs")
	},
	"f7b2690e84c389d5b7764ea782c14107331524bf592de17d10cefb8714d3dcf8": {
		functionName: "createEmpresa_createServerFn_handler",
		importer: () => import("./_ssr/empresa.controller-CEdPO6fm.mjs")
	},
	"f96a317ecccbff5fe44206eb282123875246525248201e5de2b854602f171c38": {
		functionName: "listPlanos_createServerFn_handler",
		importer: () => import("./_ssr/plano.controller-nYYtgGmX.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { __toESM as a, __require as i, __commonJSMin as n, __exportAll as r, getServerFnById as t };
