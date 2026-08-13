import { adminClient } from "@/core/database/supabase-admin";
import type { ProdutoIngrediente, ProdutoIngredienteInput } from "../types/produto.types";

export interface ProdutoIngredienteRepository {
  // Busca os ingredientes de vários produtos de uma vez — usado pra montar
  // o EmpresaCompleta inteiro numa query só, em vez de uma por produto.
  listarPorProdutoIds(produtoIds: string[]): Promise<ProdutoIngrediente[]>;
  // Substitui a lista inteira de ingredientes de UM produto de uma vez
  // (delete-all + insert-all — a lista é pequena, não precisa de diff fino).
  substituirDoProduto(produtoId: string, itens: ProdutoIngredienteInput[]): Promise<void>;
}

export class SupabaseProdutoIngredienteRepository implements ProdutoIngredienteRepository {
  private sb() {
    return adminClient();
  }

  async listarPorProdutoIds(produtoIds: string[]): Promise<ProdutoIngrediente[]> {
    if (produtoIds.length === 0) return [];
    const { data, error } = await this.sb()
      .from("produto_ingredientes")
      .select("*")
      .in("produto_id", produtoIds)
      .order("ordem");
    if (error) throw new Error(error.message);
    return (data ?? []) as ProdutoIngrediente[];
  }

  async substituirDoProduto(produtoId: string, itens: ProdutoIngredienteInput[]): Promise<void> {
    const { error: errDelete } = await this.sb()
      .from("produto_ingredientes")
      .delete()
      .eq("produto_id", produtoId);
    if (errDelete) throw new Error(errDelete.message);

    if (itens.length === 0) return;

    const linhas = itens.map((it, i) => ({
      produto_id: produtoId,
      nome: it.nome.trim(),
      removivel: it.removivel,
      ordem: i,
    }));
    const { error: errInsert } = await this.sb().from("produto_ingredientes").insert(linhas);
    if (errInsert) throw new Error(errInsert.message);
  }
}
