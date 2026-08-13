// Guards de autenticação/autorização usados por todos os módulos.
// Comportamento e mensagens de erro são idênticos aos que existiam antes
// (dentro de src/lib/admin-server.ts) — só movidos pra cá pra virar
// infraestrutura compartilhada de verdade, ao invés de helpers privados de
// um único arquivo.

import { requireSession as requireSessionRaw, type AppMetadata } from "@/lib/supabase-server-auth";
import { adminClient } from "@/core/database/supabase-admin";

export type { AppMetadata };
export const requireSession = requireSessionRaw;

// Garante que quem está chamando é o dono da empresa (ou super_admin).
export async function authTenant(token: string, empresaId: string): Promise<AppMetadata> {
  const claims = await requireSession(token);
  if (claims.role !== "super_admin" && claims.empresa_id !== empresaId) {
    throw new Error("Forbidden: tenant mismatch");
  }
  return claims;
}

// Mesma checagem de tenant, mas também bloqueia ESCRITA se a assinatura da
// empresa não estiver ativa (gate de assinatura do MVP). Super-admin sempre
// passa, mesmo com a empresa suspensa/atrasada, pra poder corrigir as
// coisas. Erro com esse texto específico ("ASSINATURA_PENDENTE") pra o
// front reconhecer e mostrar a tela de "regularize seu pagamento" — não
// mude essa string sem atualizar o front também.
export async function authTenantAtivo(token: string, empresaId: string): Promise<AppMetadata> {
  const claims = await requireSession(token);
  if (claims.role !== "super_admin" && claims.empresa_id !== empresaId) {
    throw new Error("Forbidden: tenant mismatch");
  }
  if (claims.role !== "super_admin") {
    const { data: emp } = await adminClient()
      .from("empresas")
      .select("status_pagamento")
      .eq("id", empresaId)
      .maybeSingle();
    if (emp && emp.status_pagamento !== "ativo") {
      throw new Error("ASSINATURA_PENDENTE");
    }
  }
  return claims;
}

// Garante que quem está chamando é super_admin (área da plataforma).
export async function authPlatform(token: string): Promise<AppMetadata> {
  const claims = await requireSession(token);
  if (claims.role !== "super_admin") {
    throw new Error("Forbidden: super_admin required");
  }
  return claims;
}
