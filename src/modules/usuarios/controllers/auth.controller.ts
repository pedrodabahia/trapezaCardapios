import { createServerFn } from "@tanstack/react-start";
import { container } from "@/core/container";
import "../container";

export const adminLogin = createServerFn({ method: "POST" })
  .validator((d: { email: string; password: string }) => d)
  .handler(async ({ data }) => {
    const authService = container.resolve("authService");
    return authService.loginAdmin(data.email, data.password);
  });

export const refreshAdminSession = createServerFn({ method: "POST" })
  .validator((d: { refreshToken: string }) => d)
  .handler(async ({ data }) => {
    const authService = container.resolve("authService");
    return authService.refresh(data.refreshToken);
  });

export const platformLogin = createServerFn({ method: "POST" })
  .validator((d: { email: string; password: string }) => d)
  .handler(async ({ data }) => {
    const authService = container.resolve("authService");
    return authService.loginPlatform(data.email, data.password);
  });

// Admin da empresa (ou super-admin) troca a própria senha, de dentro do
// painel em que já está logado.
export const changeOwnPassword = createServerFn({ method: "POST" })
  .validator((d: { token: string; novaSenha: string }) => d)
  .handler(async ({ data }) => {
    const authService = container.resolve("authService");
    return authService.alterarSenhaPropria(data.token, data.novaSenha);
  });

// Super-admin troca a senha do admin de uma empresa cliente (ex: reset da
// senha padrão gerada na criação, ou suporte).
export const changeClientPassword = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string; novaSenha: string }) => d)
  .handler(async ({ data }) => {
    const authService = container.resolve("authService");
    return authService.alterarSenhaCliente(data.token, data.empresaId, data.novaSenha);
  });
