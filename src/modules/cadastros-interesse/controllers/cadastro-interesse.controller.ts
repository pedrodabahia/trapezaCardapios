import { createServerFn } from "@tanstack/react-start";
import { container } from "@/core/container";
import { authPlatform } from "@/core/auth/session";
import "../container";
import type { NovoCadastroInteresseInput } from "../types/cadastro-interesse.types";

export const criarCadastroInteresse = createServerFn({ method: "POST" })
  .validator((d: NovoCadastroInteresseInput) => d)
  .handler(async ({ data }) => {
    const service = container.resolve("cadastroInteresseService");
    return service.criar(data);
  });

export const listarCadastrosInteresseRecentes = createServerFn({ method: "POST" })
  .validator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    await authPlatform(data.token);
    const service = container.resolve("cadastroInteresseService");
    return service.listarRecentes();
  });

export const removerCadastroInteresse = createServerFn({ method: "POST" })
  .validator((d: { token: string; id: string }) => d)
  .handler(async ({ data }) => {
    await authPlatform(data.token);
    const service = container.resolve("cadastroInteresseService");
    await service.remover(data.id);
    return { ok: true as const };
  });
