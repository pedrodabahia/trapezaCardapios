import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { a as container, i as authTenantAtivo } from "./session-DEfiku9J.mjs";
import "./container-B4HhuSXe.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/midia.controller-BAcHQFQe.js
var uploadImagem_createServerFn_handler = createServerRpc({
	id: "33c6dc0de50ef43e4996d12b6e285f786409978446e8ea7b58361aee074138cf",
	name: "uploadImagem",
	filename: "src/modules/midia/controllers/midia.controller.ts"
}, (opts) => uploadImagem.__executeServer(opts));
var uploadImagem = createServerFn({ method: "POST" }).validator((d) => d).handler(uploadImagem_createServerFn_handler, async ({ data }) => {
	await authTenantAtivo(data.token, data.empresaId);
	const { url } = await container.resolve("midiaService").uploadImagem({
		empresaId: data.empresaId,
		pasta: data.pasta,
		contentType: data.contentType,
		base64Data: data.base64Data
	});
	return {
		ok: true,
		url
	};
});
//#endregion
export { uploadImagem_createServerFn_handler };
