import { createServerFn } from "@tanstack/react-start";
import { container } from "@/core/container";
import { authTenantAtivo } from "@/core/auth/session";
import "../container";
import "@/modules/empresas/container";
import "@/modules/planos/container";
import type { NovoProdutoInput, ProdutoIngredienteInput } from "../types/produto.types";

export const getProdutoById = createServerFn({ method: "POST" })
  .validator((d: { empresaId: string; produtoId: string }) => d)
  .handler(async ({ data }) => {
    const produtoService = container.resolve("produtoService");
    return produtoService.buscarPorId(data.empresaId, data.produtoId);
  });

export const saveProduto = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string; produto: NovoProdutoInput }) => d)
  .handler(async ({ data: args }) => {
    await authTenantAtivo(args.token, args.empresaId);
    const produtoService = container.resolve("produtoService");

    // Limite de produtos por plano: só checa em CRIAÇÃO de produto novo.
    let limite: number | null = null;
    if (!args.produto.id) {
      const empresaRepository = container.resolve("empresaRepository");
      const planoRepository = container.resolve("planoRepository");
      const planoId = await empresaRepository.buscarPlanoId(args.empresaId);
      if (planoId) {
        limite = await planoRepository.buscarLimiteProdutos(planoId);
      }
    }

    const { id } = await produtoService.salvar(args.empresaId, args.produto, limite);
    return { ok: true as const, id };
  });

export const deleteProduto = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string; produtoId: string }) => d)
  .handler(async ({ data: args }) => {
    await authTenantAtivo(args.token, args.empresaId);
    const produtoService = container.resolve("produtoService");
    await produtoService.remover(args.empresaId, args.produtoId);
    return { ok: true as const };
  });

// Substitui a lista inteira de ingredientes de um produto. Chamado pelo
// painel logo depois de saveProduto (precisa do id do produto, que só
// existe depois do primeiro save no caso de produto novo).
export const saveProdutoIngredientes = createServerFn({ method: "POST" })
  .validator(
    (d: {
      token: string;
      empresaId: string;
      produtoId: string;
      itens: ProdutoIngredienteInput[];
    }) => d,
  )
  .handler(async ({ data: args }) => {
    await authTenantAtivo(args.token, args.empresaId);
    const produtoService = container.resolve("produtoService");
    await produtoService.salvarIngredientes(args.empresaId, args.produtoId, args.itens);
    return { ok: true as const };
  });
