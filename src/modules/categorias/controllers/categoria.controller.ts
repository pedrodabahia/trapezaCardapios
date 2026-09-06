// CAMADA DE CONTROLLER (categorias) — as "server functions" que o
// front-end realmente chama (via admin-server.ts). Cada uma faz 3
// coisas, sempre nessa ordem: 1) autentica/autoriza (authTenantAtivo
// confere se o token pertence a essa empresa E se ela está ativa), 2)
// chama o service, 3) devolve um formato simples pro front. Nenhuma
// dessas funções fala com o banco diretamente.
import { createServerFn } from "@tanstack/react-start";
import { container } from "@/core/container";
import { authTenantAtivo } from "@/core/auth/session";
import "../container";
import type {
  NovaCategoriaInput,
  NovaCategoriaOpcaoInput,
  NovaOpcaoInput,
} from "../types/categoria.types";

export const saveCategoria = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string; categoria: NovaCategoriaInput }) => d)
  .handler(async ({ data: args }) => {
    await authTenantAtivo(args.token, args.empresaId);
    const categoriaService = container.resolve("categoriaService");
    const { id } = await categoriaService.salvarCategoria(args.empresaId, args.categoria);
    return { ok: true as const, id };
  });

export const deleteCategoria = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string; categoriaId: string }) => d)
  .handler(async ({ data: args }) => {
    await authTenantAtivo(args.token, args.empresaId);
    const categoriaService = container.resolve("categoriaService");
    await categoriaService.removerCategoria(args.empresaId, args.categoriaId);
    return { ok: true as const };
  });

export const saveCategoriaOpcao = createServerFn({ method: "POST" })
  .validator(
    (d: { token: string; empresaId: string; categoriaOpcao: NovaCategoriaOpcaoInput }) => d,
  )
  .handler(async ({ data: args }) => {
    await authTenantAtivo(args.token, args.empresaId);
    const categoriaService = container.resolve("categoriaService");
    const { id } = await categoriaService.salvarCategoriaOpcao(args.empresaId, args.categoriaOpcao);
    return { ok: true as const, id };
  });

export const deleteCategoriaOpcao = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string; categoriaOpcaoId: string }) => d)
  .handler(async ({ data: args }) => {
    await authTenantAtivo(args.token, args.empresaId);
    const categoriaService = container.resolve("categoriaService");
    await categoriaService.removerCategoriaOpcao(args.empresaId, args.categoriaOpcaoId);
    return { ok: true as const };
  });

export const saveOpcao = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string; opcao: NovaOpcaoInput }) => d)
  .handler(async ({ data: args }) => {
    await authTenantAtivo(args.token, args.empresaId);
    const categoriaService = container.resolve("categoriaService");
    const { id } = await categoriaService.salvarOpcao(args.empresaId, args.opcao);
    return { ok: true as const, id };
  });

export const deleteOpcao = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string; opcaoId: string }) => d)
  .handler(async ({ data: args }) => {
    await authTenantAtivo(args.token, args.empresaId);
    const categoriaService = container.resolve("categoriaService");
    await categoriaService.removerOpcao(args.empresaId, args.opcaoId);
    return { ok: true as const };
  });

// Liga/desliga uma opção (ex: "acabou a carne hoje") sem reescrever o
// registro inteiro — usado tanto na aba Personalização quanto no widget
// "carne do dia" da home do painel.
export const toggleOpcaoAtiva = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string; opcaoId: string; ativo: boolean }) => d)
  .handler(async ({ data: args }) => {
    await authTenantAtivo(args.token, args.empresaId);
    const categoriaService = container.resolve("categoriaService");
    await categoriaService.toggleOpcaoAtiva(args.empresaId, args.opcaoId, args.ativo);
    return { ok: true as const };
  });
