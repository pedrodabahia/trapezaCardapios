import { createServerFn } from "@tanstack/react-start";
import { container } from "@/core/container";
import "../container"; // garante que os bindings do módulo usuarios já foram registrados

export const adminLogin = createServerFn({ method: "POST" })
  .validator((d: { email: string; password: string }) => d)
  .handler(async ({ data }) => {
    const usuarioService = container.resolve("usuarioService");
    return usuarioService.loginAdmin(data.email, data.password);
  });

// Renova o access token usando o refresh token guardado no browser.
// Chamado automaticamente pelo hook useAutoRefreshSession antes do access
// token expirar, pra admin não cair da sessão no meio do uso.
export const refreshAdminSession = createServerFn({ method: "POST" })
  .validator((d: { refreshToken: string }) => d)
  .handler(async ({ data }) => {
    const usuarioService = container.resolve("usuarioService");
    return usuarioService.refreshSession(data.refreshToken);
  });

export const platformLogin = createServerFn({ method: "POST" })
  .validator((d: { email: string; password: string }) => d)
  .handler(async ({ data }) => {
    const usuarioService = container.resolve("usuarioService");
    return usuarioService.loginPlatform(data.email, data.password);
  });
