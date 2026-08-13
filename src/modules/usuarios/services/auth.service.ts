import type { AuthRepository } from "../repositories/auth.repository";
import type { UsuarioRepository } from "../repositories/usuario.repository";
import type { LoginResult, RefreshResult, PlatformLoginResult } from "../types/auth.types";
import { requireSession, authPlatform } from "@/core/auth/session";

const SENHA_MIN_LENGTH = 6;

function validarNovaSenha(novaSenha: string) {
  if (!novaSenha || novaSenha.length < SENHA_MIN_LENGTH) {
    throw new Error(`A senha precisa ter pelo menos ${SENHA_MIN_LENGTH} caracteres.`);
  }
}

export class AuthService {
  constructor(
    private repository: AuthRepository,
    private usuarioRepository: UsuarioRepository,
  ) {}

  async loginAdmin(email: string, password: string): Promise<LoginResult> {
    const result = await this.repository.signInWithPassword(email, password);
    if (!result.ok) return result;
    if (!result.empresaId && result.role !== "super_admin") {
      return {
        ok: false,
        error: "Usuário sem empresa vinculada. Contate o suporte da plataforma.",
      };
    }
    return {
      ok: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      empresaId: result.empresaId,
      role: (result.role as "admin" | "super_admin" | null) ?? "admin",
      email: result.email,
    };
  }

  // Renova o access token usando o refresh token guardado no browser.
  // Chamado automaticamente antes do access token expirar.
  async refresh(refreshToken: string): Promise<RefreshResult> {
    const result = await this.repository.refreshSession(refreshToken);
    if (!result.ok) return result;
    return {
      ok: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      empresaId: result.empresaId,
      role: (result.role as "admin" | "super_admin" | null) ?? "admin",
      email: result.email,
    };
  }

  async loginPlatform(email: string, password: string): Promise<PlatformLoginResult> {
    const result = await this.repository.signInWithPassword(email, password);
    if (!result.ok) return result;
    if (result.role !== "super_admin") {
      return { ok: false, error: "Conta não é da plataforma" };
    }
    return {
      ok: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      email: result.email,
    };
  }

  // Admin da empresa (ou super-admin) troca a própria senha. Basta estar
  // logado — não precisa saber a senha antiga porque já provou identidade
  // com o access token válido da sessão atual.
  async alterarSenhaPropria(token: string, novaSenha: string) {
    validarNovaSenha(novaSenha);
    const claims = await requireSession(token);
    await this.usuarioRepository.alterarSenha(claims.id, novaSenha);
    return { ok: true as const };
  }

  // Super-admin troca a senha de um cliente (empresa) — usado tanto pra
  // resetar a senha padrão gerada na criação quanto pra suporte.
  async alterarSenhaCliente(token: string, empresaId: string, novaSenha: string) {
    validarNovaSenha(novaSenha);
    await authPlatform(token);
    const admin = await this.usuarioRepository.buscarAdminPorEmpresa(empresaId);
    if (!admin) {
      throw new Error("Nenhum usuário admin encontrado pra essa empresa.");
    }
    await this.usuarioRepository.alterarSenha(admin.id, novaSenha);
    return { ok: true as const };
  }
}
