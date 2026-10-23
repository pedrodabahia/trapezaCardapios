// CAMADA DE REPOSITORY (produtos) — CRUD puro na tabela `produtos`.
// Toda query por empresa mantém empresa_id como trava de isolamento de tenant.
import { Produto, NovoProdutoInput } from "../types/produto.types";
import { adminClient } from "@/core/database/supabase-admin";

export interface ProdutoRepository {
  buscarPorId(empresaId: string, produtoId: string): Promise<Produto | null>;
  buscarPorIdIgnorandoAtivo(empresaId: string, produtoId: string): Promise<Produto | null>;
  listarAtivosPorEmpresa(empresaId: string): Promise<Produto[]>;
  listarAtivosPorEmpresas(empresaIds: string[]): Promise<Produto[]>;
  listarTodosPorEmpresa(empresaId: string): Promise<Produto[]>;
  contarPorEmpresa(empresaId: string): Promise<number>;
  buscarPorNomeGlobal(termo: string, limite: number): Promise<Produto[]>;
  salvar(empresaId: string, produto: NovoProdutoInput): Promise<{ id: string }>;
  remover(empresaId: string, produtoId: string): Promise<void>;
}

export class SupabaseProdutoRepository implements ProdutoRepository {
  private sb() { return adminClient(); }

  async buscarPorId(empresaId: string, produtoId: string): Promise<Produto | null> {
    const { data, error } = await this.sb().from("produtos").select("*")
      .eq("id", produtoId).eq("empresa_id", empresaId).eq("ativo", true).maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Produto | null) ?? null;
  }

  async buscarPorIdIgnorandoAtivo(empresaId: string, produtoId: string): Promise<Produto | null> {
    const { data, error } = await this.sb().from("produtos").select("*")
      .eq("id", produtoId).eq("empresa_id", empresaId).maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Produto | null) ?? null;
  }

  // Esta listagem inclui produtos e serviços ativos para o perfil da empresa.
  async listarAtivosPorEmpresa(empresaId: string): Promise<Produto[]> {
    const { data, error } = await this.sb().from("produtos").select("*")
      .eq("empresa_id", empresaId).eq("ativo", true).order("ordem");
    if (error) throw new Error(error.message);
    return (data ?? []) as Produto[];
  }

  async listarAtivosPorEmpresas(empresaIds: string[]): Promise<Produto[]> {
    if (empresaIds.length === 0) return [];
    const { data, error } = await this.sb().from("produtos").select("*")
      .in("empresa_id", empresaIds).eq("ativo", true).order("ordem");
    if (error) throw new Error(error.message);
    return (data ?? []) as Produto[];
  }

  async listarTodosPorEmpresa(empresaId: string): Promise<Produto[]> {
    const { data, error } = await this.sb().from("produtos").select("*")
      .eq("empresa_id", empresaId).order("ordem");
    if (error) throw new Error(error.message);
    return (data ?? []) as Produto[];
  }

  async contarPorEmpresa(empresaId: string): Promise<number> {
    const { count, error } = await this.sb().from("produtos")
      .select("id", { count: "exact", head: true }).eq("empresa_id", empresaId);
    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  // Busca global exclusiva de produtos. Serviços não devem entrar no autocomplete de compra.
  async buscarPorNomeGlobal(termo: string, limite: number): Promise<Produto[]> {
    const busca = termo.trim();
    if (!busca) return [];
    const supabase = this.sb();

    const { data: categorias, error: erroCategorias } = await supabase
      .from("categorias").select("id").ilike("nome", `%${busca}%`).eq("ativo", true);
    if (erroCategorias) throw new Error(erroCategorias.message);
    const categoriaIds = (categorias ?? []).map((categoria) => categoria.id);

    const consultaNome = supabase.from("produtos").select("*")
      .ilike("nome", `%${busca}%`).eq("tipo", "produto").eq("ativo", true).limit(limite);
    const consultaCategoria = categoriaIds.length > 0
      ? supabase.from("produtos").select("*").in("categoria_id", categoriaIds)
          .eq("tipo", "produto").eq("ativo", true).limit(limite)
      : Promise.resolve({ data: [], error: null });

    const [resultadoNome, resultadoCategoria] = await Promise.all([consultaNome, consultaCategoria]);
    if (resultadoNome.error) throw new Error(resultadoNome.error.message);
    if (resultadoCategoria.error) throw new Error(resultadoCategoria.error.message);

    const produtos = new Map<string, Produto>();
    for (const produto of [...(resultadoNome.data ?? []), ...(resultadoCategoria.data ?? [])]) {
      produtos.set(produto.id, produto as Produto);
    }
    return Array.from(produtos.values()).slice(0, limite);
  }

  async salvar(empresaId: string, produto: NovoProdutoInput): Promise<{ id: string }> {
    const tipo = produto.tipo ?? "produto";
    if (produto.id) {
      const { id, ...patch } = produto;
      const { error } = await this.sb().from("produtos")
        .update({ ...patch, tipo }).eq("id", id).eq("empresa_id", empresaId);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { id: _ignored, ...insertable } = produto;
    const { data, error } = await this.sb().from("produtos")
      .insert({ ...insertable, tipo, empresa_id: empresaId }).select("id").single();
    if (error) throw new Error(error.message);
    return { id: data.id as string };
  }

  async remover(empresaId: string, produtoId: string): Promise<void> {
    const { error } = await this.sb().from("produtos").delete()
      .eq("id", produtoId).eq("empresa_id", empresaId);
    if (error) throw new Error(error.message);
  }
}