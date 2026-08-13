import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { a as container } from "./session-DEfiku9J.mjs";
import "./container-CzhoLjbe.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.controller-CR9epmh9.js
var adminLogin_createServerFn_handler = createServerRpc({
	id: "5fb9c17a7f65e824ca15449d35eb2df903d46a6552c2f94421ba35f6ba342305",
	name: "adminLogin",
	filename: "src/modules/usuarios/controllers/auth.controller.ts"
}, (opts) => adminLogin.__executeServer(opts));
var adminLogin = createServerFn({ method: "POST" }).validator((d) => d).handler(adminLogin_createServerFn_handler, async ({ data }) => {
	return container.resolve("authService").loginAdmin(data.email, data.password);
});
var refreshAdminSession_createServerFn_handler = createServerRpc({
	id: "2b7879f4d8c0771131cee89e860337c7b8a73629df83e1f8452652c714f295e6",
	name: "refreshAdminSession",
	filename: "src/modules/usuarios/controllers/auth.controller.ts"
}, (opts) => refreshAdminSession.__executeServer(opts));
var refreshAdminSession = createServerFn({ method: "POST" }).validator((d) => d).handler(refreshAdminSession_createServerFn_handler, async ({ data }) => {
	return container.resolve("authService").refresh(data.refreshToken);
});
var platformLogin_createServerFn_handler = createServerRpc({
	id: "63032f8bd5f9ffd5d9565109280793d4bef00cd07960981d2a61a5e35f207617",
	name: "platformLogin",
	filename: "src/modules/usuarios/controllers/auth.controller.ts"
}, (opts) => platformLogin.__executeServer(opts));
var platformLogin = createServerFn({ method: "POST" }).validator((d) => d).handler(platformLogin_createServerFn_handler, async ({ data }) => {
	return container.resolve("authService").loginPlatform(data.email, data.password);
});
var changeOwnPassword_createServerFn_handler = createServerRpc({
	id: "91ec63f35e1d1ef8a60aa883b532f7e88b6e2c24f7c4c713b3deda4c5967488a",
	name: "changeOwnPassword",
	filename: "src/modules/usuarios/controllers/auth.controller.ts"
}, (opts) => changeOwnPassword.__executeServer(opts));
var changeOwnPassword = createServerFn({ method: "POST" }).validator((d) => d).handler(changeOwnPassword_createServerFn_handler, async ({ data }) => {
	return container.resolve("authService").alterarSenhaPropria(data.token, data.novaSenha);
});
var changeClientPassword_createServerFn_handler = createServerRpc({
	id: "2e3617712acafe716affcc9522fe3b185e0c2c961a3f276f879e118c9493f182",
	name: "changeClientPassword",
	filename: "src/modules/usuarios/controllers/auth.controller.ts"
}, (opts) => changeClientPassword.__executeServer(opts));
var changeClientPassword = createServerFn({ method: "POST" }).validator((d) => d).handler(changeClientPassword_createServerFn_handler, async ({ data }) => {
	return container.resolve("authService").alterarSenhaCliente(data.token, data.empresaId, data.novaSenha);
});
//#endregion
export { adminLogin_createServerFn_handler, changeClientPassword_createServerFn_handler, changeOwnPassword_createServerFn_handler, platformLogin_createServerFn_handler, refreshAdminSession_createServerFn_handler };
