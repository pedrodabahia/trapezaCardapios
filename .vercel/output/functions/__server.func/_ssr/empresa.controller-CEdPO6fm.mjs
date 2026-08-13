import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { a as container, i as authTenantAtivo, n as authPlatform, o as requireSession, r as authTenant } from "./session-DEfiku9J.mjs";
import "./container-GNCTH5N9.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/empresa.controller-CEdPO6fm.js
var getEmpresaBySlug_createServerFn_handler = createServerRpc({
	id: "6ea2d98a1ecfad98f8484399c1a7d0a510e6b3747dfec77d30830be64f91e56d",
	name: "getEmpresaBySlug",
	filename: "src/modules/empresas/controllers/empresa.controller.ts"
}, (opts) => getEmpresaBySlug.__executeServer(opts));
var getEmpresaBySlug = createServerFn({ method: "POST" }).validator((d) => d).handler(getEmpresaBySlug_createServerFn_handler, async ({ data }) => {
	return container.resolve("cardapioService").buscarPublicoPorSlug(data.slug);
});
var getEmpresaById_createServerFn_handler = createServerRpc({
	id: "241adb6fcb1448978786d7f8c42c588e18dd642a070f3b1f4feb688031722199",
	name: "getEmpresaById",
	filename: "src/modules/empresas/controllers/empresa.controller.ts"
}, (opts) => getEmpresaById.__executeServer(opts));
var getEmpresaById = createServerFn({ method: "POST" }).validator((d) => d).handler(getEmpresaById_createServerFn_handler, async ({ data: args }) => {
	const claims = await requireSession(args.token);
	if (claims.role !== "super_admin" && claims.empresa_id !== args.empresaId) throw new Error("Forbidden");
	return container.resolve("empresaService").buscarPorId(args.empresaId);
});
var listEmpresasPublicas_createServerFn_handler = createServerRpc({
	id: "92416fb2fa11d21dd9fa1c4f919aa13f2c0045f241cd82d47971dea648a397bb",
	name: "listEmpresasPublicas",
	filename: "src/modules/empresas/controllers/empresa.controller.ts"
}, (opts) => listEmpresasPublicas.__executeServer(opts));
var listEmpresasPublicas = createServerFn({ method: "POST" }).validator((d) => d ?? {}).handler(listEmpresasPublicas_createServerFn_handler, async () => {
	return container.resolve("empresaService").listarPublicasAtivas();
});
var getEmpresaCompletaAuth_createServerFn_handler = createServerRpc({
	id: "2d295819431050779b7804c3ab727a5ede716aa85d5b0679bddbba94566f9d3c",
	name: "getEmpresaCompletaAuth",
	filename: "src/modules/empresas/controllers/empresa.controller.ts"
}, (opts) => getEmpresaCompletaAuth.__executeServer(opts));
var getEmpresaCompletaAuth = createServerFn({ method: "POST" }).validator((d) => d).handler(getEmpresaCompletaAuth_createServerFn_handler, async ({ data }) => {
	await authTenant(data.token, data.empresaId);
	return container.resolve("cardapioService").buscarCompletoAutenticado(data.empresaId);
});
var updateEmpresa_createServerFn_handler = createServerRpc({
	id: "4f77d60e0497f31580e0d7e49c565e064b7a00263edea423d0036b21e260af08",
	name: "updateEmpresa",
	filename: "src/modules/empresas/controllers/empresa.controller.ts"
}, (opts) => updateEmpresa.__executeServer(opts));
var updateEmpresa = createServerFn({ method: "POST" }).validator((d) => d).handler(updateEmpresa_createServerFn_handler, async ({ data }) => {
	await authTenantAtivo(data.token, data.empresaId);
	await container.resolve("empresaService").atualizar(data.empresaId, data.patch);
	return { ok: true };
});
var saveEmpresaConfig_createServerFn_handler = createServerRpc({
	id: "b7b30b624f88b5e4470babb7277aef8d4daf64caa6559d3b5c101b90cdb46631",
	name: "saveEmpresaConfig",
	filename: "src/modules/empresas/controllers/empresa.controller.ts"
}, (opts) => saveEmpresaConfig.__executeServer(opts));
var saveEmpresaConfig = createServerFn({ method: "POST" }).validator((d) => d).handler(saveEmpresaConfig_createServerFn_handler, async ({ data: args }) => {
	await authTenantAtivo(args.token, args.empresaId);
	await container.resolve("empresaService").salvarConfig(args.empresaId, args.data);
	return { ok: true };
});
var listEmpresasAdmin_createServerFn_handler = createServerRpc({
	id: "3687be9505a0fa14d06dee159030afb7297b1ca97f31bbcc0e6f039b4a4003c8",
	name: "listEmpresasAdmin",
	filename: "src/modules/empresas/controllers/empresa.controller.ts"
}, (opts) => listEmpresasAdmin.__executeServer(opts));
var listEmpresasAdmin = createServerFn({ method: "POST" }).validator((d) => d).handler(listEmpresasAdmin_createServerFn_handler, async ({ data: args }) => {
	await authPlatform(args.token);
	return container.resolve("empresaService").listarTodas();
});
var createEmpresa_createServerFn_handler = createServerRpc({
	id: "f7b2690e84c389d5b7764ea782c14107331524bf592de17d10cefb8714d3dcf8",
	name: "createEmpresa",
	filename: "src/modules/empresas/controllers/empresa.controller.ts"
}, (opts) => createEmpresa.__executeServer(opts));
var createEmpresa = createServerFn({ method: "POST" }).validator((d) => d).handler(createEmpresa_createServerFn_handler, async ({ data: args }) => {
	await authPlatform(args.token);
	const empresaService = container.resolve("empresaService");
	const input = {
		slug: args.slug,
		nome: args.nome,
		whatsapp: args.whatsapp,
		planoId: args.plano_id,
		adminEmail: args.adminEmail
	};
	return empresaService.criar(input);
});
var updateEmpresaStatus_createServerFn_handler = createServerRpc({
	id: "5de3a93d98cf34e035e16d4f2933f7dd6ed81c63a080ad4c06ed60a196a9b292",
	name: "updateEmpresaStatus",
	filename: "src/modules/empresas/controllers/empresa.controller.ts"
}, (opts) => updateEmpresaStatus.__executeServer(opts));
var updateEmpresaStatus = createServerFn({ method: "POST" }).validator((d) => d).handler(updateEmpresaStatus_createServerFn_handler, async ({ data: args }) => {
	await authPlatform(args.token);
	await container.resolve("empresaService").atualizarStatus(args.empresaId, args.status);
	return { ok: true };
});
var renovarAssinatura_createServerFn_handler = createServerRpc({
	id: "345d1d5db58b0eb64c47bb4379699312caa7efa25dbe238a9f130c48400013f0",
	name: "renovarAssinatura",
	filename: "src/modules/empresas/controllers/empresa.controller.ts"
}, (opts) => renovarAssinatura.__executeServer(opts));
var renovarAssinatura = createServerFn({ method: "POST" }).validator((d) => d).handler(renovarAssinatura_createServerFn_handler, async ({ data: args }) => {
	await authPlatform(args.token);
	return container.resolve("empresaService").renovarAssinatura(args.empresaId);
});
var getDashboardStats_createServerFn_handler = createServerRpc({
	id: "cc771878d76a004fc06dd11c235d5d6a7309aea75e073f6bd84cfce0753b7d8d",
	name: "getDashboardStats",
	filename: "src/modules/empresas/controllers/empresa.controller.ts"
}, (opts) => getDashboardStats.__executeServer(opts));
var getDashboardStats = createServerFn({ method: "POST" }).validator((d) => d).handler(getDashboardStats_createServerFn_handler, async ({ data: args }) => {
	await authPlatform(args.token);
	return container.resolve("dashboardService").buscarStats();
});
var deleteEmpresa_createServerFn_handler = createServerRpc({
	id: "3cfbb44be2aff76575a265297dfa40d13cc35ad5bcf824467862168dc6dd8780",
	name: "deleteEmpresa",
	filename: "src/modules/empresas/controllers/empresa.controller.ts"
}, (opts) => deleteEmpresa.__executeServer(opts));
var deleteEmpresa = createServerFn({ method: "POST" }).validator((d) => d).handler(deleteEmpresa_createServerFn_handler, async ({ data: args }) => {
	await authPlatform(args.token);
	await container.resolve("empresaService").remover(args.empresaId);
	return { ok: true };
});
//#endregion
export { createEmpresa_createServerFn_handler, deleteEmpresa_createServerFn_handler, getDashboardStats_createServerFn_handler, getEmpresaById_createServerFn_handler, getEmpresaBySlug_createServerFn_handler, getEmpresaCompletaAuth_createServerFn_handler, listEmpresasAdmin_createServerFn_handler, listEmpresasPublicas_createServerFn_handler, renovarAssinatura_createServerFn_handler, saveEmpresaConfig_createServerFn_handler, updateEmpresaStatus_createServerFn_handler, updateEmpresa_createServerFn_handler };
