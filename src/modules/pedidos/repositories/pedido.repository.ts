import { adminClient } from "@/core/database/supabase-admin";
import type { Pedido, PedidoStatus } from "../types/pedido.types";

export type NovoPedido = {
  empresa_id: string;
  numero: string;
  cliente_nome: string;
  cliente_telefone: string;
  endereco: string | null;
  itens: Pedido["itens"];
  subtotal: number;
  taxa_entrega: number;
  desconto: number;
  valor_total: number;
  cupom: string | null;
  forma_pagamento: Pedido["forma_pagamento"];
  troco_para: number | null;
};

export interface PedidoRepository {
  criar(pedido: NovoPedido): Promise<{ id: string; numero: string }>;
  listarPorEmpresa(empresaId: string, limite?: number): Promise<Pedido[]>;
  atualizarStatus(
    pedidoId: string,
    empresaId: string,
    status: PedidoStatus,
  ): Promise<void>;
  // Conta pedidos (todas as empresas) criados a partir de uma data — usado
  // pelo dashboard do super-admin.
  contarDesde(data: Date): Promise<number>;
  // Conta TODOS os pedidos de TODAS as empresas, sem filtro de data — usado
  // só pra estimativa pública de "pedidos realizados" na home. Só expõe um
  // número agregado, nenhum dado de cliente/empresa.
  contarTotal(): Promise<number>;
  // Ranking de produtos mais vendidos de UMA empresa, somando a
  // quantidade pedida em todos os pedidos não cancelados. Agrupa por
  // produto_id quando o item tem esse dado (pedidos novos); pedidos
  // antigos, sem produto_id, agrupam pelo nome normalizado (trim +
  // minúsculas) — quem chama isso ainda deve preferir casar pelo
  // produtoId quando ele vier preenchido, só caindo pro nome como reserva.
  topVendidosPorEmpresa(
    empresaId: string,
    limite: number,
  ): Promise<{ produtoId: string | null; nome: string; totalQtd: number }[]>;
}

// Único lugar do sistema que acessa a tabela `pedidos` no Supabase.
// Nenhuma regra de negócio deve chamar Supabase diretamente — isso fica
// todo dentro do PedidoService, que recebe este repository pelo construtor.
export class SupabasePedidoRepository implements PedidoRepository {
  private sb() {
    return adminClient();
  }

  async criar(pedido: NovoPedido): Promise<{ id: string; numero: string }> {
    const { data, error } = await this.sb()
      .from("pedidos")
      .insert(pedido)
      .select("id, numero")
      .single();
    if (error) throw new Error(error.message);
    return { id: data.id as string, numero: data.numero as string };
  }

  async listarPorEmpresa(empresaId: string, limite = 200): Promise<Pedido[]> {
    const { data, error } = await this.sb()
      .from("pedidos")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("criado_em", { ascending: false })
      .limit(limite);
    if (error) throw new Error(error.message);
    return (data ?? []) as Pedido[];
  }

  async atualizarStatus(
    pedidoId: string,
    empresaId: string,
    status: PedidoStatus,
  ): Promise<void> {
    const { error } = await this.sb()
      .from("pedidos")
      .update({ status })
      .eq("id", pedidoId)
      .eq("empresa_id", empresaId);
    if (error) throw new Error(error.message);
  }

  async contarDesde(data: Date): Promise<number> {
    const { count } = await this.sb()
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .gte("criado_em", data.toISOString());
    return count ?? 0;
  }

  async contarTotal(): Promise<number> {
    const { count } = await this.sb()
      .from("pedidos")
      .select("id", { count: "exact", head: true });
    return count ?? 0;
  }

  async topVendidosPorEmpresa(
    empresaId: string,
    limite: number,
  ): Promise<{ produtoId: string | null; nome: string; totalQtd: number }[]> {
    // Só traz a coluna itens (jsonb) — a soma por produto é feita aqui em
    // JS porque itens é um array dentro de jsonb (não dá pra usar SUM/GROUP
    // BY do SQL direto sem uma view/função extra), e pro volume de pedidos
    // de um comércio local isso é barato o suficiente.
    const { data, error } = await this.sb()
      .from("pedidos")
      .select("itens")
      .eq("empresa_id", empresaId)
      .neq("status", "cancelado");
    if (error) throw new Error(error.message);

    type Agregado = { produtoId: string | null; nome: string; totalQtd: number };
    const porChave = new Map<string, Agregado>();
    for (const row of data ?? []) {
      const itens = (row.itens ?? []) as Array<{
        nome: string;
        qtd: number;
        produto_id?: string;
      }>;
      for (const item of itens) {
        // Chave prioriza produto_id (pedidos novos); sem ele, cai pro nome
        // normalizado — assim "Fardo Heineken" e "fardo heineken " (com
        // espaço/maiúscula diferente) somam junto em vez de virar duas
        // entradas separadas.
        const chave = item.produto_id ?? `nome:${item.nome.trim().toLowerCase()}`;
        const atual = porChave.get(chave);
        if (atual) {
          atual.totalQtd += item.qtd ?? 0;
        } else {
          porChave.set(chave, {
            produtoId: item.produto_id ?? null,
            nome: item.nome,
            totalQtd: item.qtd ?? 0,
          });
        }
      }
    }

    return Array.from(porChave.values())
      .sort((a, b) => b.totalQtd - a.totalQtd)
      .slice(0, limite);
  }
}
