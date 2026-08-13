import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/session-DEfiku9J.js
var Container = class {
	registrations = /* @__PURE__ */ new Map();
	register(key, factory, options = {}) {
		this.registrations.set(key, {
			factory,
			singleton: options.singleton ?? true
		});
	}
	resolve(key) {
		const registration = this.registrations.get(key);
		if (!registration) throw new Error(`[container] Nada registrado para "${String(key)}". Confira se o módulo dono dessa dependência foi importado (o registro acontece como side-effect do import do container do módulo).`);
		if (registration.singleton) {
			if (registration.instance === void 0) registration.instance = registration.factory(this);
			return registration.instance;
		}
		return registration.factory(this);
	}
};
var container = new Container();
function adminClient() {
	const url = "https://yfsewnucpnhjrlbmwipc.supabase.co";
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!serviceKey) {
		const hasProcessEnv = typeof process !== "undefined" && !!process.env;
		const relatedKeys = hasProcessEnv ? Object.keys(process.env).filter((k) => /SUPABASE|VERCEL|CF_|NITRO|CLOUDFLARE/i.test(k)) : [];
		throw new Error(`Missing Supabase server env vars — url present: true, serviceKey present: ${!!serviceKey}, process.env available: ${hasProcessEnv}, related env keys seen: [${relatedKeys.join(", ")}]`);
	}
	return createClient(url, serviceKey, { auth: { persistSession: false } });
}
async function requireSession$1(token) {
	const { data, error } = await adminClient().auth.getUser(token);
	if (error || !data.user) throw new Error("Invalid session");
	return {
		id: data.user.id,
		...data.user.app_metadata ?? {}
	};
}
var requireSession = requireSession$1;
async function authTenant(token, empresaId) {
	const claims = await requireSession(token);
	if (claims.role !== "super_admin" && claims.empresa_id !== empresaId) throw new Error("Forbidden: tenant mismatch");
	return claims;
}
async function authTenantAtivo(token, empresaId) {
	const claims = await requireSession(token);
	if (claims.role !== "super_admin" && claims.empresa_id !== empresaId) throw new Error("Forbidden: tenant mismatch");
	if (claims.role !== "super_admin") {
		const { data: emp } = await adminClient().from("empresas").select("status_pagamento").eq("id", empresaId).maybeSingle();
		if (emp && emp.status_pagamento !== "ativo") throw new Error("ASSINATURA_PENDENTE");
	}
	return claims;
}
async function authPlatform(token) {
	const claims = await requireSession(token);
	if (claims.role !== "super_admin") throw new Error("Forbidden: super_admin required");
	return claims;
}
//#endregion
export { container as a, authTenantAtivo as i, authPlatform as n, requireSession as o, authTenant as r, adminClient as t };
