import { adminClient } from "@/core/database/supabase-admin";
import type { AnuncioHome, NovoAnuncioInput } from "../types/anuncio.types";

export interface AnuncioRepository {
  listarAtivos(): Promise<AnuncioHome[]>;
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

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as AnuncioHome[];
  }

  async listarTodos(): Promise<AnuncioHome[]> {
    const { data, error } = await this.sb()
      .from("anuncios_home")
      .select("*")
      .order("ordem");

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as AnuncioHome[];
  }

  async salvar(dados: NovoAnuncioInput): Promise<{ id: string }> {
  // Atualização
  if (dados.id) {
    const { id, ...patch } = dados;

    const { error } = await this.sb()
      .from("anuncios_home")
      .update(patch)
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return { id };
  }

  // Inserção
  const { id: _ignored, ...insertable } = dados;

  console.log("INSERT ANUNCIOS_HOME:", insertable);

  const { data, error } = await this.sb()
    .from("anuncios_home")
    .insert(insertable)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.id) {
    throw new Error("Anúncio criado, mas o ID não foi retornado.");
  }

  return { id: data.id as string };
}
  async remover(id: string): Promise<void> {
    const { error } = await this.sb()
      .from("anuncios_home")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }
}