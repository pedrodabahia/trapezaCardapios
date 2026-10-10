import { createServerFn } from "@tanstack/react-start";

import { authPlatform } from "@/core/auth/session";
import { container } from "@/core/container";

import { getCategoriasNegocioFiltradas } from "@/modules/categorias-negocio/controllers/categoria-negocio.controller";

import "../container";

import type { NovaPromocaoInput } from "../types/promocao.types";

// Público — feed de promoções válidas neste momento.
export const listarPromocoes = createServerFn({ method: "POST" })
  .validator((d: { limite?: number } | undefined) => d ?? {})
  .handler(async ({ data }) => {
    return container
      .resolve("promocaoService")
      .listarAtivas(data.limite ?? 30);
  });

// Público — detalhe de uma promoção publicada.
export const getPromocaoPorSlug = createServerFn({ method: "POST" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    return container
      .resolve("promocaoService")
      .buscarAtivaPorSlug(data.slug);
  });

// Público — ofertas ativas de uma empresa.
export const listarPromocoesPorEmpresa = createServerFn({ method: "POST" })
  .validator((d: { empresaId: string }) => d)
  .handler(async ({ data }) => {
    return container
      .resolve("promocaoService")
      .listarAtivasPorEmpresa(data.empresaId);
  });

// Super-admin — gerenciamento inicial das promoções.
export const listarPromocoesAdmin = createServerFn({ method: "POST" })
  .validator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    await authPlatform(data.token);

    return container
      .resolve("promocaoService")
      .listarTodas();
  });

// Público — categorias disponíveis para promoções.

export const listarCategoriasPromocao = createServerFn({
  method: "POST",
})
  .validator((d: Record<string, never> | undefined) => d ?? {})
  .handler(async () => {
    const categorias = await getCategoriasNegocioFiltradas({
      data: {},
    });

    return categorias.map((categoria) => ({
      id: categoria.id,
      nome: categoria.label,
      slug: categoria.valor,
      emoji: null,
      ativo: categoria.ativo,
      ordem: categoria.ordem,
      created_at: categoria.criado_em ?? "",
    }));
  });

// Super-admin — criar/editar promoção.
export const savePromocao = createServerFn({ method: "POST" })
  .validator(
    (d: {
      token: string;
      promocao: NovaPromocaoInput;
    }) => d,
  )
  .handler(async ({ data }) => {
    await authPlatform(data.token);

    return container
      .resolve("promocaoService")
      .salvar(data.promocao);
  });

// Super-admin — excluir promoção.
export const deletePromocao = createServerFn({ method: "POST" })
  .validator(
    (d: {
      token: string;
      id: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    await authPlatform(data.token);

    await container
      .resolve("promocaoService")
      .remover(data.id);

    return { ok: true as const };
  });