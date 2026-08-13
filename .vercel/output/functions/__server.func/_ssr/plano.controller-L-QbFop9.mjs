import { r as createServerFn } from "./server-dox-0I6C.mjs";
import { a as container, r as authTenant } from "./session-DEfiku9J.mjs";
import "./container-GNCTH5N9.mjs";
import { t as createServerRpc } from "./createServerRpc-B2ym-H6g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plano.controller-L-QbFop9.js
var listPlanos_createServerFn_handler = createServerRpc({
	id: "f96a317ecccbff5fe44206eb282123875246525248201e5de2b854602f171c38",
	name: "listPlanos",
	filename: "src/modules/planos/controllers/plano.controller.ts"
}, (opts) => listPlanos.__executeServer(opts));
var listPlanos = createServerFn({ method: "POST" }).validator((d) => d ?? {}).handler(listPlanos_createServerFn_handler, async () => {
	return container.resolve("planoService").listarTodos();
});
var getPlanoDaEmpresa_createServerFn_handler = createServerRpc({
	id: "b920b277ab64e44a347e2283871330378a8a43017a8445cc0131467bae80a178",
	name: "getPlanoDaEmpresa",
	filename: "src/modules/planos/controllers/plano.controller.ts"
}, (opts) => getPlanoDaEmpresa.__executeServer(opts));
var getPlanoDaEmpresa = createServerFn({ method: "POST" }).validator((d) => d).handler(getPlanoDaEmpresa_createServerFn_handler, async ({ data }) => {
	await authTenant(data.token, data.empresaId);
	return container.resolve("planoService").buscarPlanoDaEmpresa(data.empresaId);
});
//#endregion
export { getPlanoDaEmpresa_createServerFn_handler, listPlanos_createServerFn_handler };
