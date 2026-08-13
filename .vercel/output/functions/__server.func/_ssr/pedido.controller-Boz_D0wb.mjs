import { r as createServerFn } from "./server-dox-0I6C.mjs";
import { a as container, r as authTenant } from "./session-DEfiku9J.mjs";
import "./container-Bkg_Gy42.mjs";
import { t as createServerRpc } from "./createServerRpc-B2ym-H6g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pedido.controller-Boz_D0wb.js
var createPedido_createServerFn_handler = createServerRpc({
	id: "924a5c648d95bd03df0735ce12f5d19a979664db56157e9e9b9ba52b123831c6",
	name: "createPedido",
	filename: "src/modules/pedidos/controllers/pedido.controller.ts"
}, (opts) => createPedido.__executeServer(opts));
var createPedido = createServerFn({ method: "POST" }).validator((d) => d).handler(createPedido_createServerFn_handler, async ({ data }) => {
	return container.resolve("pedidoService").criar(data);
});
var listPedidosEmpresa_createServerFn_handler = createServerRpc({
	id: "13507aeda2343367cbb4dce494db3add3c471f9d0860e83c08afbaef1e1e238c",
	name: "listPedidosEmpresa",
	filename: "src/modules/pedidos/controllers/pedido.controller.ts"
}, (opts) => listPedidosEmpresa.__executeServer(opts));
var listPedidosEmpresa = createServerFn({ method: "POST" }).validator((d) => d).handler(listPedidosEmpresa_createServerFn_handler, async ({ data }) => {
	await authTenant(data.token, data.empresaId);
	return container.resolve("pedidoService").listarPorEmpresa(data.empresaId);
});
var updatePedidoStatus_createServerFn_handler = createServerRpc({
	id: "b5d80d80521796800eb58e4af63d6f825ecd3e3bf9138505f719576634947db9",
	name: "updatePedidoStatus",
	filename: "src/modules/pedidos/controllers/pedido.controller.ts"
}, (opts) => updatePedidoStatus.__executeServer(opts));
var updatePedidoStatus = createServerFn({ method: "POST" }).validator((d) => d).handler(updatePedidoStatus_createServerFn_handler, async ({ data }) => {
	await authTenant(data.token, data.empresaId);
	await container.resolve("pedidoService").atualizarStatus(data.pedidoId, data.empresaId, data.status);
	return { ok: true };
});
//#endregion
export { createPedido_createServerFn_handler, listPedidosEmpresa_createServerFn_handler, updatePedidoStatus_createServerFn_handler };
