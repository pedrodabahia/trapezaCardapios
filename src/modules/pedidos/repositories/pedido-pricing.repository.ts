import { adminClient } from "@/core/database/supabase-admin";
import type {
  ProdutoParaPrecificacao,
  OpcaoParaPrecificacao,
  EmpresaConfigParaPrecificacao,
} from "../types/pedido.types";

// TODO(migração incremental): quando os módulos "produtos" e "empresas"
// existirem, este repository deve ser substituído pela injeção direta de
// ProdutoRepository/EmpresaRepository no PedidoService, ao invés de acessar
// essas tabelas por fora do domínio de pedidos. Por enquanto isolamos isso
// aqui (em vez de espalhar `adminClient()` pelo service) justamente pra
// deixar essa fronteira fácil de cortar depois.
export interface PedidoPricingRepository {
  buscarStatusEmpresa(
    empresaId: string,
  ): Promise<"ativo" | "atrasado" | "suspenso" | null>;
  buscarProdutosPorIds(
    empresaId: string,
    produtoIds: string[],
  ): Promise<ProdutoParaPrecificacao[]>;
  buscarOpcoesPorNome(empresaId: string): Promise<OpcaoParaPrecificacao[]>;
  buscarConfigEmpresa(empresaId: string): Promise<EmpresaConfigParaPrecificacao>;
}

export class SupabasePedidoPricingRepository implements PedidoPricingRepository {
  private sb() {
    return adminClient();
  }

  async buscarStatusEmpresa(
    empresaId: string,
  ): Promise<"ativo" | "atrasado" | "suspenso" | null> {
    const { data } = await this.sb()
      .from("empresas")
      .select("status_pagamento")
      .eq("id", empresaId)
      .maybeSingle();
    return (
      (data?.status_pagamento as "ativo" | "atrasado" | "suspenso" | undefined) ??
      null
    );
  }

  async buscarProdutosPorIds(
    empresaId: string,
    produtoIds: string[],
  ): Promise<ProdutoParaPrecificacao[]> {
    const { data, error } = await this.sb()
      .from("produtos")
      .select("id, nome, preco, ativo")
      .eq("empresa_id", empresaId)
      .in("id", produtoIds);
    if (error) throw new Error(error.message);
    return (data ?? []) as ProdutoParaPrecificacao[];
  }

  async buscarOpcoesPorNome(empresaId: string): Promise<OpcaoParaPrecificacao[]> {
    const { data, error } = await this.sb()
      .from("opcoes_personalizacao")
      .select("nome, preco_adicional")
      .eq("empresa_id", empresaId);
    if (error) throw new Error(error.message);
    return (data ?? []) as OpcaoParaPrecificacao[];
  }

  async buscarConfigEmpresa(
    empresaId: string,
  ): Promise<EmpresaConfigParaPrecificacao> {
    const { data } = await this.sb()
      .from("empresa_config")
      .select("data")
      .eq("empresa_id", empresaId)
      .maybeSingle();
    return (data?.data ?? {}) as EmpresaConfigParaPrecificacao;
  }
}
