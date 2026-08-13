import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-RQ4HTkDC.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import "./container-BBaES79Y.mjs";
import "./container-CzhoLjbe.mjs";
import "./container-Bkg_Gy42.mjs";
import "./container-GNCTH5N9.mjs";
import "./container-B4HhuSXe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-server-CnyVybEG.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var adminLogin = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("5fb9c17a7f65e824ca15449d35eb2df903d46a6552c2f94421ba35f6ba342305"));
var refreshAdminSession = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("2b7879f4d8c0771131cee89e860337c7b8a73629df83e1f8452652c714f295e6"));
var platformLogin = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("63032f8bd5f9ffd5d9565109280793d4bef00cd07960981d2a61a5e35f207617"));
var changeOwnPassword = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("91ec63f35e1d1ef8a60aa883b532f7e88b6e2c24f7c4c713b3deda4c5967488a"));
var changeClientPassword = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("2e3617712acafe716affcc9522fe3b185e0c2c961a3f276f879e118c9493f182"));
var getEmpresaBySlug = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("6ea2d98a1ecfad98f8484399c1a7d0a510e6b3747dfec77d30830be64f91e56d"));
var getEmpresaById = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("241adb6fcb1448978786d7f8c42c588e18dd642a070f3b1f4feb688031722199"));
var listEmpresasPublicas = createServerFn({ method: "POST" }).validator((d) => d ?? {}).handler(createSsrRpc("92416fb2fa11d21dd9fa1c4f919aa13f2c0045f241cd82d47971dea648a397bb"));
var getEmpresaCompletaAuth = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("2d295819431050779b7804c3ab727a5ede716aa85d5b0679bddbba94566f9d3c"));
var updateEmpresa = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("4f77d60e0497f31580e0d7e49c565e064b7a00263edea423d0036b21e260af08"));
var saveEmpresaConfig = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("b7b30b624f88b5e4470babb7277aef8d4daf64caa6559d3b5c101b90cdb46631"));
var listEmpresasAdmin = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("3687be9505a0fa14d06dee159030afb7297b1ca97f31bbcc0e6f039b4a4003c8"));
var createEmpresa = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("f7b2690e84c389d5b7764ea782c14107331524bf592de17d10cefb8714d3dcf8"));
var updateEmpresaStatus = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("5de3a93d98cf34e035e16d4f2933f7dd6ed81c63a080ad4c06ed60a196a9b292"));
createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("345d1d5db58b0eb64c47bb4379699312caa7efa25dbe238a9f130c48400013f0"));
createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("cc771878d76a004fc06dd11c235d5d6a7309aea75e073f6bd84cfce0753b7d8d"));
var deleteEmpresa = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("3cfbb44be2aff76575a265297dfa40d13cc35ad5bcf824467862168dc6dd8780"));
createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("1f9d2f5d98086325923975f5f2c156d0dc1be2c719485ece61a6ed5e40d4548b"));
var saveProduto = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("d3002c7ac2300d6b3faf55868eed773ce66dc0dbd32033eda7bd716726b1c336"));
var deleteProduto = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("b08d2730b39d7bf3e00a4166a4d6af0642fe2cffd9493b553421b0e4a7951351"));
var saveProdutoIngredientes = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("4ce2766800d651f3076ac10b5ee0583470e42d0b8c0a56bd2eaf3462aa870696"));
var uploadImagem = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("33c6dc0de50ef43e4996d12b6e285f786409978446e8ea7b58361aee074138cf"));
var saveCategoria = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("c817796febe6c6ef85a304e6d3cffda27de3fa7a399f4fe39b47a5490b63e100"));
createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("2bdf6a74e6357cc8ff42efa5c2548a5a84c77bb765e73d92ca4f865dd20758d4"));
var saveCategoriaOpcao = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("3b60bd2b28051440eb5ae7e1121d4861df8859f164d004b96b63d9c670e48bf4"));
var deleteCategoriaOpcao = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("e11acc85f284c21ed9af0a36d20ec40e9d3a53cf459161962f1f35fcccda4f0f"));
var saveOpcao = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("5efaa99e9b3ac3b713e3095fa0cf51fb3e79779eaab71df88668f659cff89c49"));
var deleteOpcao = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("505eaba48c5b6469e48b41baae42bfee4ec28a74828f48f5842b717b6843a3bf"));
var listPlanos = createServerFn({ method: "POST" }).validator((d) => d ?? {}).handler(createSsrRpc("f96a317ecccbff5fe44206eb282123875246525248201e5de2b854602f171c38"));
var getPlanoDaEmpresa = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("b920b277ab64e44a347e2283871330378a8a43017a8445cc0131467bae80a178"));
var createPedido = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("924a5c648d95bd03df0735ce12f5d19a979664db56157e9e9b9ba52b123831c6"));
var listPedidosEmpresa = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("13507aeda2343367cbb4dce494db3add3c471f9d0860e83c08afbaef1e1e238c"));
var updatePedidoStatus = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("b5d80d80521796800eb58e4af63d6f825ecd3e3bf9138505f719576634947db9"));
//#endregion
export { saveOpcao as C, updateEmpresaStatus as D, updateEmpresa as E, updatePedidoStatus as O, saveEmpresaConfig as S, saveProdutoIngredientes as T, listPlanos as _, createPedido as a, saveCategoria as b, deleteOpcao as c, getEmpresaBySlug as d, getEmpresaCompletaAuth as f, listPedidosEmpresa as g, listEmpresasPublicas as h, createEmpresa as i, uploadImagem as k, deleteProduto as l, listEmpresasAdmin as m, changeClientPassword as n, deleteCategoriaOpcao as o, getPlanoDaEmpresa as p, changeOwnPassword as r, deleteEmpresa as s, adminLogin as t, getEmpresaById as u, platformLogin as v, saveProduto as w, saveCategoriaOpcao as x, refreshAdminSession as y };
