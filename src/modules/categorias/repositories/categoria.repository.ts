import { adminClient } from "@/core/database/supabase-admin";
import type {
  Categoria,
  CategoriaOpcao,
  OpcaoPersonalizacao,
  NovaCategoriaInput,
  NovaCategoriaOpcaoInput,
  NovaOpcaoInput,
} from "../types/categoria.types";

export interface CategoriaRepository {
  listarCategoriasAtivas(empresaId: string): Promise<Categoria[]>;
  listarCategoriasTodas(empresaId: string): Promise<Categoria[]>;
  salvarCategoria(empresaId: string, categoria: NovaCategoriaInput): Promise<{ id: string }>;
  removerCategoria(empresaId: string, categoriaId: string): Promise<void>;

  listarCategoriasOpcao(empresaId: string): Promise<CategoriaOpcao[]>;
  salvarCategoriaOpcao(
    empresaId: string,
    categoriaOpcao: NovaCategoriaOpcaoInput,
  ): Promise<{ id: string }>;
  removerCategoriaOpcao(empresaId: string, categoriaOpcaoId: string): Promise<void>;
  // usados só na hora de apagar uma CategoriaOpcao, pra tirar a referência
  // dela de dentro das categorias de produto que a usavam
  listarCategoriasComOpcao(
    empresaId: string,
    categoriaOpcaoId: string,
  ): Promise<{ id: string; categorias_opcao_ids: string[] }[]>;
  atualizarCategoriasOpcaoIds(categoriaId: string, ids: string[]): Promise<void>;

  listarOpcoes(empresaId: string): Promise<OpcaoPersonalizacao[]>;
  // Só as opções com ativo=true — usada no cardápio público, pra não
  // mostrar pro cliente algo que o dono desligou.
  listarOpcoesAtivas(empresaId: string): Promise<OpcaoPersonalizacao[]>;
  salvarOpcao(empresaId: string, opcao: NovaOpcaoInput): Promise<{ id: string }>;
  removerOpcao(empresaId: string, opcaoId: string): Promise<void>;
  // Liga/desliga uma opção sem reescrever o registro inteiro (o "carne do
  // dia": desativa hoje, reativa amanhã, sem perder preço/nome/ordem).
  toggleOpcaoAtiva(empresaId: string, opcaoId: string, ativo: boolean): Promise<void>;
}

export class SupabaseCategoriaRepository implements CategoriaRepository {
  private sb() {
    return adminClient();
  }

  async listarCategoriasAtivas(empresaId: string): Promise<Categoria[]> {
    const { data, error } = await this.sb()
      .from("categorias")
      .select("*")
      .eq("empresa_id", empresaId)
      .eq("ativo", true)
      .order("ordem");
    if (error) throw new Error(error.message);
    return (data ?? []) as Categoria[];
  }

  async listarCategoriasTodas(empresaId: string): Promise<Categoria[]> {
    const { data, error } = await this.sb()
      .from("categorias")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("ordem");
    if (error) throw new Error(error.message);
    return (data ?? []) as Categoria[];
  }

  async salvarCategoria(empresaId: string, categoria: NovaCategoriaInput): Promise<{ id: string }> {
    if (categoria.id) {
      const { id, ...patch } = categoria;
      const { error } = await this.sb()
        .from("categorias")
        .update(patch)
        .eq("id", id)
        .eq("empresa_id", empresaId);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { id: _ignored, ...insertable } = categoria;
    const { data, error } = await this.sb()
      .from("categorias")
      .insert({ ...insertable, empresa_id: empresaId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: data.id as string };
  }

  async removerCategoria(empresaId: string, categoriaId: string): Promise<void> {
    const { error } = await this.sb()
      .from("categorias")
      .delete()
      .eq("id", categoriaId)
      .eq("empresa_id", empresaId);
    if (error) throw new Error(error.message);
  }

  async listarCategoriasOpcao(empresaId: string): Promise<CategoriaOpcao[]> {
    const { data, error } = await this.sb()
      .from("categorias_opcao")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("ordem");
    if (error) throw new Error(error.message);
    return (data ?? []) as CategoriaOpcao[];
  }

  async salvarCategoriaOpcao(
    empresaId: string,
    categoriaOpcao: NovaCategoriaOpcaoInput,
  ): Promise<{ id: string }> {
    if (categoriaOpcao.id) {
      const { id, ...patch } = categoriaOpcao;
      const { error } = await this.sb()
        .from("categorias_opcao")
        .update(patch)
        .eq("id", id)
        .eq("empresa_id", empresaId);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { id: _ignored, ...insertable } = categoriaOpcao;
    const { data, error } = await this.sb()
      .from("categorias_opcao")
      .insert({ ...insertable, empresa_id: empresaId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: data.id as string };
  }

  async removerCategoriaOpcao(empresaId: string, categoriaOpcaoId: string): Promise<void> {
    const { error } = await this.sb()
      .from("categorias_opcao")
      .delete()
      .eq("id", categoriaOpcaoId)
      .eq("empresa_id", empresaId);
    if (error) throw new Error(error.message);
  }

  async listarCategoriasComOpcao(empresaId: string, categoriaOpcaoId: string) {
    const { data } = await this.sb()
      .from("categorias")
      .select("id, categorias_opcao_ids")
      .eq("empresa_id", empresaId)
      .contains("categorias_opcao_ids", [categoriaOpcaoId]);
    return (data ?? []) as { id: string; categorias_opcao_ids: string[] }[];
  }

  async atualizarCategoriasOpcaoIds(categoriaId: string, ids: string[]): Promise<void> {
    await this.sb().from("categorias").update({ categorias_opcao_ids: ids }).eq("id", categoriaId);
  }

  async listarOpcoes(empresaId: string): Promise<OpcaoPersonalizacao[]> {
    const { data, error } = await this.sb()
      .from("opcoes_personalizacao")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("ordem");
    if (error) throw new Error(error.message);
    return (data ?? []) as OpcaoPersonalizacao[];
  }

  async salvarOpcao(empresaId: string, opcao: NovaOpcaoInput): Promise<{ id: string }> {
    if (opcao.id) {
      const { id, ...patch } = opcao;
      const { error } = await this.sb()
        .from("opcoes_personalizacao")
        .update(patch)
        .eq("id", id)
        .eq("empresa_id", empresaId);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { id: _ignored, ...insertable } = opcao;
    const { data, error } = await this.sb()
      .from("opcoes_personalizacao")
      .insert({ ...insertable, empresa_id: empresaId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: data.id as string };
  }

  async listarOpcoesAtivas(empresaId: string): Promise<OpcaoPersonalizacao[]> {
    const { data, error } = await this.sb()
      .from("opcoes_personalizacao")
      .select("*")
      .eq("empresa_id", empresaId)
      .eq("ativo", true)
      .order("ordem");
    if (error) throw new Error(error.message);
    return (data ?? []) as OpcaoPersonalizacao[];
  }

  async removerOpcao(empresaId: string, opcaoId: string): Promise<void> {
    const { error } = await this.sb()
      .from("opcoes_personalizacao")
      .delete()
      .eq("id", opcaoId)
      .eq("empresa_id", empresaId);
    if (error) throw new Error(error.message);
  }

  async toggleOpcaoAtiva(empresaId: string, opcaoId: string, ativo: boolean): Promise<void> {
    const { error } = await this.sb()
      .from("opcoes_personalizacao")
      .update({ ativo })
      .eq("id", opcaoId)
      .eq("empresa_id", empresaId);
    if (error) throw new Error(error.message);
  }
}
