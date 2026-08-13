import type { UsuarioAuthRepository } from "../repositories/usuario.repository";
import type { AdminLoginResult, PlatformLoginResult } from "../types/usuario.types";

// Toda a regra de negócio de autenticação vive aqui. Nada de Supabase
// direto — só chamadas ao repository injetado pelo construtor.
export class UsuarioService {
  constructor(private repository: UsuarioAuthRepository) {}

  // Login do painel do admin da empresa (ou super-admin, que também pode
  // entrar por aqui). Exige que o usuário tenha empresa vinculada OU seja
  // super_admin — senão é uma conta "solta" e não deveria conseguir logar
  // no painel de tenant.
  async loginAdmin(email: string, password: string): Promise<AdminLoginResult> {
    const result = await this.repository.signInComSenha(email, password);
    if (!result.ok) return { ok: false, error: result.error };

    const { appMetadata } = result;
    if (!appMetadata.empresa_id && appMetadata.role !== "super_admin") {
      return {
        ok: false,
        error: "Usuário sem empresa vinculada. Contate o suporte da plataforma.",
      };
    }

    return {
      ok: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      empresaId: appMetadata.empresa_id ?? null,
      role: appMetadata.role ?? "admin",
      email: result.email,
    };
  }

  // Renova o access token a partir do refresh token guardado no browser.
  // Não reaplica a checagem de "precisa ter empresa vinculada" — se a
  // sessão original já passou por loginAdmin, presumimos que continua
  // válida (mesmo comportamento do handler original).
  async refreshSession(refreshToken: string): Promise<AdminLoginResult> {
    const result = await this.repository.refreshSession(refreshToken);
    if (!result.ok) return { ok: false, error: result.error };

    return {
      ok: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      empresaId: result.appMetadata.empresa_id ?? null,
      role: (result.appMetadata.role ?? "admin") as "admin" | "super_admin",
      email: result.email,
    };
  }

  // Login da área da plataforma — só quem tem role "super_admin" entra.
  async loginPlatform(email: string, password: string): Promise<PlatformLoginResult> {
    const result = await this.repository.signInComSenha(email, password);
    if (!result.ok) return { ok: false, error: result.error };

    if (result.appMetadata.role !== "super_admin") {
      return { ok: false, error: "Conta não é da plataforma" };
    }

    return {
      ok: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      email: result.email,
    };
  }
}
