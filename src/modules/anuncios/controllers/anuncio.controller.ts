// CAMADA DE CONTROLLER (anuncios) — as "server functions" que o front-end
// chama (via admin-server.ts). A leitura é pública (a home não exige
// login); escrita/gerenciamento exige `authPlatform` (só o super-admin
// mexe nos an\u00fancios).
import { createServerFn } from "@tanstack/react-start";
import { container } from "@/core/container";
import { authPlatform } from "@/core/auth/session";
import "../container";
import type { NovoAnuncioInput } from "../types/anuncio.types";

// Público (sem login) — os slides ativos, pro carrossel da home.
export const getAnunciosHome = createServerFn({ method: "POST" })
  .validator((d: Record<string, never> | undefined) => d ?? {})
  .handler(async () => {
    const anuncioService = container.resolve("anuncioService");
    return anuncioService.listarAtivos();
  });

// Super-admin — todos os slides (ativo ou não), pra tela de gerenciamento.
export const listAnunciosAdmin = createServerFn({ method: "POST" })
  .validator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    await authPlatform(data.token);
    const anuncioService = container.resolve("anuncioService");
    return anuncioService.listarTodos();
  });

export const saveAnuncioHome = createServerFn({ method: "POST" })
  .validator((d: { token: string; anuncio: NovoAnuncioInput }) => d)
  .handler(async ({ data }) => {
    await authPlatform(data.token);
    const anuncioService = container.resolve("anuncioService");
    return anuncioService.salvar(data.anuncio);
  });

export const deleteAnuncioHome = createServerFn({ method: "POST" })
  .validator((d: { token: string; id: string }) => d)
  .handler(async ({ data }) => {
    await authPlatform(data.token);
    const anuncioService = container.resolve("anuncioService");
    await anuncioService.remover(data.id);
    return { ok: true as const };
  });
