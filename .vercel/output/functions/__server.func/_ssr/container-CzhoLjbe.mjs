import { a as container, n as authPlatform, o as requireSession, t as adminClient } from "./session-DEfiku9J.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/container-CzhoLjbe.js
async function anonAuthClient() {
	const sbUrl = "https://yfsewnucpnhjrlbmwipc.supabase.co";
	const anonKey = "sb_publishable_Icwk943fZG7oDarl6jKzew_ykn2oual";
	const { createClient } = await import("../_libs/supabase__supabase-js.mjs").then((n) => n.n);
	return createClient(sbUrl, anonKey, { auth: { persistSession: false } });
}
var SupabaseAuthRepository = class {
	async signInWithPassword(email, password) {
		const { data: session, error } = await (await anonAuthClient()).auth.signInWithPassword({
			email,
			password
		});
		if (error || !session.session) return {
			ok: false,
			error: error?.message ?? "Invalid credentials"
		};
		const appMeta = session.user.app_metadata ?? {};
		return {
			ok: true,
			accessToken: session.session.access_token,
			refreshToken: session.session.refresh_token,
			empresaId: appMeta.empresa_id ?? null,
			role: appMeta.role ?? null,
			email: session.user.email ?? email
		};
	}
	async refreshSession(refreshToken) {
		const { data: session, error } = await (await anonAuthClient()).auth.refreshSession({ refresh_token: refreshToken });
		if (error || !session.session || !session.user) return {
			ok: false,
			error: error?.message ?? "Refresh failed"
		};
		const appMeta = session.user.app_metadata ?? {};
		return {
			ok: true,
			accessToken: session.session.access_token,
			refreshToken: session.session.refresh_token,
			empresaId: appMeta.empresa_id ?? null,
			role: appMeta.role ?? null,
			email: session.user.email ?? ""
		};
	}
};
var SupabaseUsuarioRepository = class {
	sb() {
		return adminClient();
	}
	async criarAdmin(email, empresaId) {
		const tempPassword = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase() + "!";
		const { error } = await this.sb().auth.admin.createUser({
			email,
			password: tempPassword,
			email_confirm: true,
			app_metadata: {
				empresa_id: empresaId,
				role: "admin"
			}
		});
		if (error) throw new Error(`Failed to create admin: ${error.message}`);
		return { tempPassword };
	}
	async alterarSenha(userId, novaSenha) {
		const { error } = await this.sb().auth.admin.updateUserById(userId, { password: novaSenha });
		if (error) throw new Error(`Failed to update password: ${error.message}`);
	}
	async buscarAdminPorEmpresa(empresaId) {
		const perPage = 200;
		let page = 1;
		while (true) {
			const { data, error } = await this.sb().auth.admin.listUsers({
				page,
				perPage
			});
			if (error) throw new Error(`Failed to list users: ${error.message}`);
			const found = data.users.find((u) => u.app_metadata?.empresa_id === empresaId);
			if (found) return {
				id: found.id,
				email: found.email ?? ""
			};
			if (data.users.length < perPage) return null;
			page++;
		}
	}
};
var SENHA_MIN_LENGTH = 6;
function validarNovaSenha(novaSenha) {
	if (!novaSenha || novaSenha.length < SENHA_MIN_LENGTH) throw new Error(`A senha precisa ter pelo menos ${SENHA_MIN_LENGTH} caracteres.`);
}
var AuthService = class {
	repository;
	usuarioRepository;
	constructor(repository, usuarioRepository) {
		this.repository = repository;
		this.usuarioRepository = usuarioRepository;
	}
	async loginAdmin(email, password) {
		const result = await this.repository.signInWithPassword(email, password);
		if (!result.ok) return result;
		if (!result.empresaId && result.role !== "super_admin") return {
			ok: false,
			error: "Usuário sem empresa vinculada. Contate o suporte da plataforma."
		};
		return {
			ok: true,
			accessToken: result.accessToken,
			refreshToken: result.refreshToken,
			empresaId: result.empresaId,
			role: result.role ?? "admin",
			email: result.email
		};
	}
	async refresh(refreshToken) {
		const result = await this.repository.refreshSession(refreshToken);
		if (!result.ok) return result;
		return {
			ok: true,
			accessToken: result.accessToken,
			refreshToken: result.refreshToken,
			empresaId: result.empresaId,
			role: result.role ?? "admin",
			email: result.email
		};
	}
	async loginPlatform(email, password) {
		const result = await this.repository.signInWithPassword(email, password);
		if (!result.ok) return result;
		if (result.role !== "super_admin") return {
			ok: false,
			error: "Conta não é da plataforma"
		};
		return {
			ok: true,
			accessToken: result.accessToken,
			refreshToken: result.refreshToken,
			email: result.email
		};
	}
	async alterarSenhaPropria(token, novaSenha) {
		validarNovaSenha(novaSenha);
		const claims = await requireSession(token);
		await this.usuarioRepository.alterarSenha(claims.id, novaSenha);
		return { ok: true };
	}
	async alterarSenhaCliente(token, empresaId, novaSenha) {
		validarNovaSenha(novaSenha);
		await authPlatform(token);
		const admin = await this.usuarioRepository.buscarAdminPorEmpresa(empresaId);
		if (!admin) throw new Error("Nenhum usuário admin encontrado pra essa empresa.");
		await this.usuarioRepository.alterarSenha(admin.id, novaSenha);
		return { ok: true };
	}
};
container.register("authRepository", () => new SupabaseAuthRepository());
container.register("usuarioRepository", () => new SupabaseUsuarioRepository());
container.register("authService", (c) => new AuthService(c.resolve("authRepository"), c.resolve("usuarioRepository")));
//#endregion
export {};
