import { adminClient } from "@/core/database/supabase-admin";
import type { Plano } from "../types/plano.types";

export interface PlanoRepository {
  listarTodos(): Promise<Plano[]>;
  // Lança erro se o plano não existir (mesmo comportamento de antes, que
  // usava `.single()`).
  buscarPorId(planoId: string): Promise<Plano>;
  // Versão "silenciosa" só pra checar limite de produtos — se o plano
  // sumiu ou não tem limite definido, retorna null (não é erro).
  buscarLimiteProdutos(planoId: string): Promise<number | null>;
}

export class SupabasePlanoRepository implements PlanoRepository {
  private sb() {
    return adminClient();
  }

  async listarTodos(): Promise<Plano[]> {
    const { data, error } = await this.sb().from("planos").select("*").order("preco_mensal");
    if (error) throw new Error(error.message);
    return (data ?? []) as Plano[];
  }

  async buscarPorId(planoId: string): Promise<Plano> {
    const { data, error } = await this.sb().from("planos").select("*").eq("id", planoId).single();
    if (error) throw new Error(error.message);
    return data as Plano;
  }

  async buscarLimiteProdutos(planoId: string): Promise<number | null> {
    const { data } = await this.sb()
      .from("planos")
      .select("limite_produtos")
      .eq("id", planoId)
      .maybeSingle();
    return data?.limite_produtos ?? null;
  }
}
