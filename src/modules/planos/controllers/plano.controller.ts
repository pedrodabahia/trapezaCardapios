import { createServerFn } from "@tanstack/react-start";
import { container } from "@/core/container";
import { authTenant } from "@/core/auth/session";
import "../container";
import "@/modules/empresas/container";
import "@/modules/produtos/container";

export const listPlanos = createServerFn({ method: "POST" })
  .validator((d: Record<string, never> | undefined) => d ?? {})
  .handler(async () => {
    const planoService = container.resolve("planoService");
    return planoService.listarTodos();
  });

export const getPlanoDaEmpresa = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string }) => d)
  .handler(async ({ data }) => {
    await authTenant(data.token, data.empresaId);
    const planoService = container.resolve("planoService");
    return planoService.buscarPlanoDaEmpresa(data.empresaId);
  });
