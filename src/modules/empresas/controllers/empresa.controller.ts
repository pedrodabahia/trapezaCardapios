import { createServerFn } from "@tanstack/react-start";
import { container } from "@/core/container";
import { authTenant, authTenantAtivo, authPlatform, requireSession } from "@/core/auth/session";
import "../container";
import type { Empresa, EmpresaConfigJson, NovaEmpresaInput, NovaEmpresaExternaInput, EmpresaPlataformaPatch } from "../types/empresa.types";
import type { EmpresaPatch } from "../repositories/empresa.repository";

// ============================================================================
// Leitura — público (cardápio)
// ============================================================================

export const getEmpresaBySlug = createServerFn({ method: "POST" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const cardapioService = container.resolve("cardapioService");
    return cardapioService.buscarPublicoPorSlug(data.slug);
  });

export const getEmpresaById = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string }) => d)
  .handler(async ({ data: args }) => {
    // Tanto admin da empresa quanto super-admin podem chamar.
    const claims = await requireSession(args.token);
    if (claims.role !== "super_admin" && claims.empresa_id !== args.empresaId) {
      throw new Error("Forbidden");
    }
    const empresaService = container.resolve("empresaService");
    return empresaService.buscarPorId(args.empresaId);
  });

export const listEmpresasPublicas = createServerFn({ method: "POST" })
  .validator((d: Record<string, never> | undefined) => d ?? {})
  .handler(async () => {
    const empresaService = container.resolve("empresaService");
    return empresaService.listarPublicasAtivas();
  });

// ============================================================================
// Leitura — autenticada (admin da empresa)
// ============================================================================

export const getEmpresaCompletaAuth = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string }) => d)
  .handler(async ({ data }) => {
    await authTenant(data.token, data.empresaId);
    const cardapioService = container.resolve("cardapioService");
    return cardapioService.buscarCompletoAutenticado(data.empresaId);
  });

// ============================================================================
// Mutations — admin da empresa
// ============================================================================

export const updateEmpresa = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string; patch: EmpresaPatch }) => d)
  .handler(async ({ data }) => {
    await authTenantAtivo(data.token, data.empresaId);
    const empresaService = container.resolve("empresaService");
    await empresaService.atualizar(data.empresaId, data.patch);
    return { ok: true as const };
  });

export const saveEmpresaConfig = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string; data: EmpresaConfigJson }) => d)
  .handler(async ({ data: args }) => {
    await authTenantAtivo(args.token, args.empresaId);
    const empresaService = container.resolve("empresaService");
    await empresaService.salvarConfig(args.empresaId, args.data);
    return { ok: true as const };
  });

// ============================================================================
// Super-admin
// ============================================================================

export const listEmpresasAdmin = createServerFn({ method: "POST" })
  .validator((d: { token: string }) => d)
  .handler(async ({ data: args }) => {
    await authPlatform(args.token);
    const empresaService = container.resolve("empresaService");
    return empresaService.listarTodas();
  });

export const createEmpresa = createServerFn({ method: "POST" })
  .validator(
    (d: {
      token: string;
      slug: string;
      nome: string;
      whatsapp: string;
      plano_id: string;
      adminEmail: string;
    }) => d,
  )
  .handler(async ({ data: args }) => {
    await authPlatform(args.token);
    const empresaService = container.resolve("empresaService");
    const input: NovaEmpresaInput = {
      slug: args.slug,
      nome: args.nome,
      whatsapp: args.whatsapp,
      planoId: args.plano_id,
      adminEmail: args.adminEmail,
    };
    return empresaService.criar(input);
  });

export const updateEmpresaStatus = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string; status: Empresa["status_pagamento"] }) => d)
  .handler(async ({ data: args }) => {
    await authPlatform(args.token);
    const empresaService = container.resolve("empresaService");
    await empresaService.atualizarStatus(args.empresaId, args.status);
    return { ok: true as const };
  });

export const renovarAssinatura = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string }) => d)
  .handler(async ({ data: args }) => {
    await authPlatform(args.token);
    const empresaService = container.resolve("empresaService");
    return empresaService.renovarAssinatura(args.empresaId);
  });

export const getDashboardStats = createServerFn({ method: "POST" })
  .validator((d: { token: string }) => d)
  .handler(async ({ data: args }) => {
    await authPlatform(args.token);
    const dashboardService = container.resolve("dashboardService");
    return dashboardService.buscarStats();
  });

export const deleteEmpresa = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string }) => d)
  .handler(async ({ data: args }) => {
    await authPlatform(args.token);
    const empresaService = container.resolve("empresaService");
    await empresaService.remover(args.empresaId);
    return { ok: true as const };
  });

// Empresa "externa": cliente com site/sistema próprio que só entra no
// diretório da home. Não cria usuário/login — não tem painel pra acessar.
export const createEmpresaExterna = createServerFn({ method: "POST" })
  .validator((d: { token: string } & NovaEmpresaExternaInput) => d)
  .handler(async ({ data: args }) => {
    await authPlatform(args.token);
    const empresaService = container.resolve("empresaService");
    const { token: _token, ...input } = args;
    return empresaService.criarExterna(input);
  });

// Edita o perfil de diretório de QUALQUER empresa (trapeza ou externa) —
// nome, categoria, cidade, bairro, logo, capa, descrição, url externa e
// destaque. Só super-admin: nunca expõe isso pro endpoint de tenant
// (updateEmpresa), que continua sem esses campos.
export const updateEmpresaPlataforma = createServerFn({ method: "POST" })
  .validator((d: { token: string; empresaId: string; patch: EmpresaPlataformaPatch }) => d)
  .handler(async ({ data: args }) => {
    await authPlatform(args.token);
    const empresaService = container.resolve("empresaService");
    await empresaService.atualizarPlataforma(args.empresaId, args.patch);
    return { ok: true as const };
  });
