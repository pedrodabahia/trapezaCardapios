import { adminClient } from "@/core/database/supabase-admin";
import type { Produto, NovoProdutoInput } from "../types/produto.types";

export interface ProdutoRepository {
  buscarPorId(empresaId: string, produtoId: string): Promise<Produto | null>;
  // Igual buscarPorId, mas sem exigir ativo=true — usado no painel (admin
  // precisa poder editar/salvar ingredientes de produtos pausados também).
  buscarPorIdIgnorandoAtivo(empresaId: string, produtoId: string): Promise<Produto | null>;
  // Só produtos ativos — usado no cardápio público.
  listarAtivosPorEmpresa(empresaId: string): Promise<Produto[]>;
  // Todos, ativos ou não — usado no painel autenticado (admin precisa ver
  // os que estão pausados também).
  listarTodosPorEmpresa(empresaId: string): Promise<Produto[]>;
  contarPorEmpresa(empresaId: string): Promise<number>;
  salvar(empresaId: string, produto: NovoProdutoInput): Promise<{ id: string }>;
  remover(empresaId: string, produtoId: string): Promise<void>;
}

export class SupabaseProdutoRepository implements ProdutoRepository {
  private sb() {
    return adminClient();
  }

  async buscarPorId(empresaId: string, produtoId: string): Promise<Produto | null> {
    const { data, error } = await this.sb()
      .from("produtos")
      .select("*")
      .eq("id", produtoId)
      .eq("empresa_id", empresaId)
      .eq("ativo", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Produto | null) ?? null;
  }

  async buscarPorIdIgnorandoAtivo(empresaId: string, produtoId: string): Promise<Produto | null> {
    const { data, error } = await this.sb()
      .from("produtos")
      .select("*")
      .eq("id", produtoId)
      .eq("empresa_id", empresaId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Produto | null) ?? null;
  }

  async listarAtivosPorEmpresa(empresaId: string): Promise<Produto[]> {
    const { data, error } = await this.sb()
      .from("produtos")
      .select("*")
      .eq("empresa_id", empresaId)
      .eq("ativo", true)
      .order("ordem");
    if (error) throw new Error(error.message);
    return (data ?? []) as Produto[];
  }

  async listarTodosPorEmpresa(empresaId: string): Promise<Produto[]> {
    const { data, error } = await this.sb()
      .from("produtos")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("ordem");
    if (error) throw new Error(error.message);
    return (data ?? []) as Produto[];
  }

  async contarPorEmpresa(empresaId: string): Promise<number> {
    const { count } = await this.sb()
      .from("produtos")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresaId);
    return count ?? 0;
  }

  async salvar(empresaId: string, produto: NovoProdutoInput): Promise<{ id: string }> {
    if (produto.id) {
      const { id, ...patch } = produto;
      const { error } = await this.sb()
        .from("produtos")
        .update(patch)
        .eq("id", id)
        .eq("empresa_id", empresaId);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { id: _ignored, ...insertable } = produto;
    const { data, error } = await this.sb()
      .from("produtos")
      .insert({ ...insertable, empresa_id: empresaId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: data.id as string };
  }

  async remover(empresaId: string, produtoId: string): Promise<void> {
    const { error } = await this.sb()
      .from("produtos")
      .delete()
      .eq("id", produtoId)
      .eq("empresa_id", empresaId);
    if (error) throw new Error(error.message);
  }
}
