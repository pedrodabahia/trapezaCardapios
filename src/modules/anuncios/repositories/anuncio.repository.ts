// CAMADA DE REPOSITORY (anuncios) — CRUD puro na tabela `anuncios_home`.
// Diferente dos outros módulos, essa tabela NÃO é isolada por empresa —
// é global da plataforma (o super-admin cadastra os slides que aparecem
// pra todo mundo na home). Mesmo padrão de sempre pro "salvar": se vier
// `id`, faz UPDATE; senão, INSERT.
import { adminClient } from "@/core/database/supabase-admin";
import type { AnuncioHome, NovoAnuncioInput } from "../types/anuncio.types";

export interface AnuncioRepository {
  // Só os ativos, ordenados — usado pelo carrossel público da home.
  listarAtivos(): Promise<AnuncioHome[]>;
  // Todos (ativo ou não) — usado na tela de gerenciamento do super-admin.
  listarTodos(): Promise<AnuncioHome[]>;
  salvar(dados: NovoAnuncioInput): Promise<{ id: string }>;
  remover(id: string): Promise<void>;
}

export class SupabaseAnuncioRepository implements AnuncioRepository {
  private sb() {
    return adminClient();
  }

  async listarAtivos(): Promise<AnuncioHome[]> {
    const { data, error } = await this.sb()
      .from("anuncios_home")
      .select("*")
      .eq("ativo", true)
      .order("ordem");
    if (error) throw new Error(error.message);
    return (data ?? []) as AnuncioHome[];
  }

  async listarTodos(): Promise<AnuncioHome[]> {
    const { data, error } = await this.sb().from("anuncios_home").select("*").order("ordem");
    if (error) throw new Error(error.message);
    return (data ?? []) as AnuncioHome[];
  }

  async salvar(dados: NovoAnuncioInput): Promise<{ id: string }> {
    if (dados.id) {
      const { id, ...patch } = dados;
      const { error } = await this.sb().from("anuncios_home").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { id: _ignored, ...insertable } = dados;
    const { data, error } = await this.sb()
      .from("anuncios_home")
      .insert(insertable)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: data.id as string };
  }

  async remover(id: string): Promise<void> {
    const { error } = await this.sb().from("anuncios_home").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}
