// CAMADA DE CONTROLLER (categorias-negocio) — leitura pública (a home e
// os formulários de categoria não exigem login pra ler a lista);
// escrita/gerenciamento exige `authPlatform` (só o super-admin cria ou
// edita categoria de negócio).
import { createServerFn } from "@tanstack/react-start";
import { container } from "@/core/container";
import { authPlatform } from "@/core/auth/session";
import "../container";
import type { NovaCategoriaNegocioInput } from "../types/categoria-negocio.types";
import { Filter } from "lucide-react";

// Público (sem login) — categorias ativas, na ordem definida. É o que
// tanto a home quanto os formulários de categoria (painel/plataforma)
// devem usar como fonte, pra sempre bater com o que o super-admin
// cadastrou.
export const getCategoriasNegocio = createServerFn({ method: "POST" })
  .validator((d: Record<string, never> | undefined) => d ?? {})
  .handler(async () => {
    const categoriaNegocioService = container.resolve("categoriaNegocioService");
    return categoriaNegocioService.listarAtivas();
  });

export const getCategoriasNegocioFiltradas = createServerFn({ method: "POST" })
  .validator((d: Record<string, never> | undefined) => d ?? {})
  .handler(async () => {
    const categoriaNegocioService = container.resolve("categoriaNegocioService");
    const categorias = await categoriaNegocioService.listarAtivas();
    return categorias.filter(
      (categoria) => categoria.categoria_pai_id !== null
    )
  });


// Super-admin — todas (ativa ou não), pra tela de gerenciamento.
export const listCategoriasNegocioAdmin = createServerFn({ method: "POST" })
  .validator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    await authPlatform(data.token);
    const categoriaNegocioService = container.resolve("categoriaNegocioService");
    return categoriaNegocioService.listarTodas();
  });

export const saveCategoriaNegocio = createServerFn({ method: "POST" })
  .validator((d: { token: string; categoria: NovaCategoriaNegocioInput }) => d)
  .handler(async ({ data }) => {
    await authPlatform(data.token);
    const categoriaNegocioService = container.resolve("categoriaNegocioService");
    return categoriaNegocioService.salvar(data.categoria);
  });

export const deleteCategoriaNegocio = createServerFn({ method: "POST" })
  .validator((d: { token: string; id: string }) => d)
  .handler(async ({ data }) => {
    await authPlatform(data.token);
    const categoriaNegocioService = container.resolve("categoriaNegocioService");
    await categoriaNegocioService.remover(data.id);
    return { ok: true as const };
  });
