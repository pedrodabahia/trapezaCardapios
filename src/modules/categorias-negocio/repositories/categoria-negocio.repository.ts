// CAMADA DE REPOSITORY (categorias-negocio) — CRUD puro na tabela
// `categorias_negocio`. Tabela global da plataforma (não é por empresa).
// Mesmo padrão de sempre pro "salvar": se vier `id`, faz UPDATE; senão,
// INSERT.
import { adminClient } from "@/core/database/supabase-admin";
import type { CategoriaNegocioDb, NovaCategoriaNegocioInput } from "../types/categoria-negocio.types";

export interface CategoriaNegocioRepository {
  listarAtivas(): Promise<CategoriaNegocioDb[]>;
  listarTodas(): Promise<CategoriaNegocioDb[]>;
  salvar(dados: NovaCategoriaNegocioInput): Promise<{ id: string }>;
  remover(id: string): Promise<void>;
}

export class SupabaseCategoriaNegocioRepository implements CategoriaNegocioRepository {
  private sb() {
    return adminClient();
  }

  async listarAtivas(): Promise<CategoriaNegocioDb[]> {
    const { data, error } = await this.sb()
      .from("categorias_negocio")
      .select("*")
      .eq("ativo", true)
      .order("ordem");
    if (error) throw new Error(error.message);
    return (data ?? []) as CategoriaNegocioDb[];
  }

  async listarTodas(): Promise<CategoriaNegocioDb[]> {
    const { data, error } = await this.sb()
      .from("categorias_negocio")
      .select("*")
      .order("ordem");
    if (error) throw new Error(error.message);
    return (data ?? []) as CategoriaNegocioDb[];
  }

  async salvar(dados: NovaCategoriaNegocioInput): Promise<{ id: string }> {
    if (dados.id) {
      const { id, ...patch } = dados;
      const { error } = await this.sb().from("categorias_negocio").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { id: _ignored, ...insertable } = dados;
    const { data, error } = await this.sb()
      .from("categorias_negocio")
      .insert(insertable)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: data.id as string };
  }

  async remover(id: string): Promise<void> {
    const { error } = await this.sb().from("categorias_negocio").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}
