import { adminClient } from "@/core/database/supabase-admin";
import type {
  Empresa,
  EmpresaConfigJson,
  EmpresaDashboardRow,
  NovaEmpresaExternaInput,
  EmpresaPlataformaPatch,
} from "../types/empresa.types";

export type EmpresaPatch = Partial<
  Pick<Empresa, "nome" | "whatsapp" | "endereco" | "pix_chave" | "logo_url" | "categoria" | "cidade">
>;

export type EmpresaPublica = Pick<
  Empresa,
  | "id"
  | "slug"
  | "nome"
  | "whatsapp"
  | "endereco"
  | "logo_url"
  | "status_pagamento"
  | "categoria"
  | "cidade"
  | "tipo"
  | "url_externa"
  | "descricao"
  | "bairro"
  | "capa_url"
  | "destaque"
>;

export interface EmpresaRepository {
  // Lança erro se não encontrar (mesmo comportamento do `.single()` que
  // existia antes) — usado onde a empresa é obrigatória (auth, dashboard
  // do admin, plano).
  buscarPorId(empresaId: string): Promise<Empresa>;
  // Versão silenciosa, só pro checkout público (empresa suspensa/inexistente
  // devolve null pro front tratar como "loja fechada", não erro).
  buscarPorSlug(slug: string): Promise<Empresa | null>;
  // Versão silenciosa que só busca o plano_id, pro check de limite de
  // produtos (se a empresa sumiu, o check é ignorado, não quebra o save).
  buscarPlanoId(empresaId: string): Promise<string | null>;

  listarPublicasAtivas(): Promise<EmpresaPublica[]>;
  listarTodas(): Promise<Empresa[]>;
  listarParaDashboard(): Promise<EmpresaDashboardRow[]>;

  atualizar(empresaId: string, patch: EmpresaPatch): Promise<void>;
  atualizarStatus(empresaId: string, status: Empresa["status_pagamento"]): Promise<void>;
  buscarVencimento(empresaId: string): Promise<string | null>;
  atualizarVencimento(
    empresaId: string,
    proximoVencimento: string,
    status: Empresa["status_pagamento"],
  ): Promise<void>;

  criar(dados: {
    slug: string;
    nome: string;
    whatsapp: string;
    plano_id: string;
    proximo_vencimento: string;
  }): Promise<{ id: string }>;
  // Empresa externa: não cria login/painel, só uma linha no diretório
  // já ativa (não tem cobrança nem vencimento).
  criarExterna(dados: NovaEmpresaExternaInput): Promise<{ id: string }>;
  remover(empresaId: string): Promise<void>;

  // Edição do perfil de diretório (qualquer tipo), só pelo super-admin.
  atualizarPlataforma(empresaId: string, patch: EmpresaPlataformaPatch): Promise<void>;

  buscarConfig(empresaId: string): Promise<EmpresaConfigJson>;
  salvarConfig(empresaId: string, config: EmpresaConfigJson): Promise<void>;
  criarConfigVazia(empresaId: string): Promise<void>;
}

export class SupabaseEmpresaRepository implements EmpresaRepository {
  private sb() {
    return adminClient();
  }

  async buscarPorId(empresaId: string): Promise<Empresa> {
    const { data, error } = await this.sb()
      .from("empresas")
      .select("*")
      .eq("id", empresaId)
      .single();
    if (error || !data) throw new Error(error?.message ?? "Empresa não encontrada");
    return data as Empresa;
  }

  async buscarPorSlug(slug: string): Promise<Empresa | null> {
    const { data, error } = await this.sb()
      .from("empresas")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return data as Empresa;
  }

  async buscarPlanoId(empresaId: string): Promise<string | null> {
    const { data } = await this.sb()
      .from("empresas")
      .select("plano_id")
      .eq("id", empresaId)
      .maybeSingle();
    return data?.plano_id ?? null;
  }

  async listarPublicasAtivas(): Promise<EmpresaPublica[]> {
    const { data, error } = await this.sb()
      .from("empresas")
      .select(
        "id, slug, nome, whatsapp, endereco, logo_url, status_pagamento, categoria, cidade, tipo, url_externa, descricao, bairro, capa_url, destaque",
      )
      .eq("status_pagamento", "ativo")
      .order("criado_em", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as EmpresaPublica[];
  }

  async listarTodas(): Promise<Empresa[]> {
    const { data, error } = await this.sb()
      .from("empresas")
      .select("*")
      .order("criado_em", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Empresa[];
  }

  async listarParaDashboard(): Promise<EmpresaDashboardRow[]> {
    const { data, error } = await this.sb()
      .from("empresas")
      .select("id, status_pagamento, plano_id, criado_em, proximo_vencimento");
    if (error) throw new Error(error.message);
    return (data ?? []) as EmpresaDashboardRow[];
  }

  async atualizar(empresaId: string, patch: EmpresaPatch): Promise<void> {
    const { error } = await this.sb().from("empresas").update(patch).eq("id", empresaId);
    if (error) throw new Error(error.message);
  }

  async atualizarStatus(empresaId: string, status: Empresa["status_pagamento"]): Promise<void> {
    const { error } = await this.sb()
      .from("empresas")
      .update({ status_pagamento: status })
      .eq("id", empresaId);
    if (error) throw new Error(error.message);
  }

  async buscarVencimento(empresaId: string): Promise<string | null> {
    const { data, error } = await this.sb()
      .from("empresas")
      .select("proximo_vencimento")
      .eq("id", empresaId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data?.proximo_vencimento ?? null;
  }

  async atualizarVencimento(
    empresaId: string,
    proximoVencimento: string,
    status: Empresa["status_pagamento"],
  ): Promise<void> {
    const { error } = await this.sb()
      .from("empresas")
      .update({ proximo_vencimento: proximoVencimento, status_pagamento: status })
      .eq("id", empresaId);
    if (error) throw new Error(error.message);
  }

  async criar(dados: {
    slug: string;
    nome: string;
    whatsapp: string;
    plano_id: string;
    proximo_vencimento: string;
  }): Promise<{ id: string }> {
    const { data, error } = await this.sb()
      .from("empresas")
      .insert({
        slug: dados.slug,
        nome: dados.nome,
        whatsapp: dados.whatsapp,
        plano_id: dados.plano_id,
        status_pagamento: "ativo",
        proximo_vencimento: dados.proximo_vencimento,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to create empresa");
    return { id: data.id as string };
  }

  async remover(empresaId: string): Promise<void> {
    // cascade deleta config, categorias, produtos, opcoes via FK on delete cascade
    const { error } = await this.sb().from("empresas").delete().eq("id", empresaId);
    if (error) throw new Error(error.message);
  }

  async criarExterna(dados: NovaEmpresaExternaInput): Promise<{ id: string }> {
    const { data, error } = await this.sb()
      .from("empresas")
      .insert({
        slug: dados.slug,
        nome: dados.nome,
        whatsapp: dados.whatsapp || null,
        categoria: dados.categoria,
        cidade: dados.cidade,
        bairro: dados.bairro,
        logo_url: dados.logoUrl,
        capa_url: dados.capaUrl,
        descricao: dados.descricao,
        url_externa: dados.urlExterna,
        destaque: dados.destaque,
        tipo: "externa",
        status_pagamento: "ativo",
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to create empresa externa");
    return { id: data.id as string };
  }

  async atualizarPlataforma(empresaId: string, patch: EmpresaPlataformaPatch): Promise<void> {
    const { error } = await this.sb().from("empresas").update(patch).eq("id", empresaId);
    if (error) throw new Error(error.message);
  }

  async buscarConfig(empresaId: string): Promise<EmpresaConfigJson> {
    const { data } = await this.sb()
      .from("empresa_config")
      .select("data")
      .eq("empresa_id", empresaId)
      .maybeSingle();
    return (data?.data ?? {}) as EmpresaConfigJson;
  }

  async salvarConfig(empresaId: string, config: EmpresaConfigJson): Promise<void> {
    const { error } = await this.sb()
      .from("empresa_config")
      .upsert({ empresa_id: empresaId, data: config });
    if (error) throw new Error(error.message);
  }

  async criarConfigVazia(empresaId: string): Promise<void> {
    await this.sb().from("empresa_config").insert({ empresa_id: empresaId, data: {} });
  }
}
