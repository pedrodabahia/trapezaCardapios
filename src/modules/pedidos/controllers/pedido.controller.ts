import { createServerFn } from "@tanstack/react-start";
import { container } from "@/core/container";
import { authTenant } from "@/core/auth/session";
import "../container"; // garante que os bindings do módulo pedidos já foram registrados
import type { CriarPedidoInput, PedidoStatus } from "../types/pedido.types";

// Chamada pelo checkout público (sem login) na hora de fechar o pedido. Não
// precisa de token: qualquer cliente pode registrar um pedido pra uma
// empresa ativa. O número curto é só pra exibir/rastrear, não é chave.
export const createPedido = createServerFn({ method: "POST" })
  .validator((d: CriarPedidoInput) => d)
  .handler(async ({ data }) => {
    const pedidoService = container.resolve("pedidoService");
    return pedidoService.criar(data);
  });

// Público (sem login) — só devolve um número agregado (total de pedidos
// de todas as empresas), usado no contador de "pedidos realizados" da home.
// Não expõe nenhum dado de cliente ou de empresa específica.
export const contarPedidosTotal = createServerFn({ method: "POST" })
  .validator((d: Record<string, never> | undefined) => d ?? {})
  .handler(async () => {
    const pedidoService = container.resolve("pedidoService");
    return pedidoService.contarTotalPublico();
  });

export const listPedidosEmpresa = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string }) => d)
  .handler(async ({ data }) => {
    await authTenant(data.token, data.empresaId);
    const pedidoService = container.resolve("pedidoService");
    return pedidoService.listarPorEmpresa(data.empresaId);
  });

export const updatePedidoStatus = createServerFn({ method: "POST" })
  .validator(
    (d: {
      token: string;
      empresaId: string;
      pedidoId: string;
      status: PedidoStatus;
    }) => d,
  )
  .handler(async ({ data }) => {
    await authTenant(data.token, data.empresaId);
    const pedidoService = container.resolve("pedidoService");
    await pedidoService.atualizarStatus(data.pedidoId, data.empresaId, data.status);
    return { ok: true as const };
  });
