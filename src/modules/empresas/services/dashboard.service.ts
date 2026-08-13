import type { EmpresaRepository } from "../repositories/empresa.repository";
import type { PlanoRepository } from "@/modules/planos/repositories/plano.repository";
import type { PedidoRepository } from "@/modules/pedidos/repositories/pedido.repository";
import type { DashboardStats } from "../types/empresa.types";

// Estatísticas agregadas pro dashboard do super-admin: quantidade de
// contas por status, quantas estão perto de vencer (próximos 7 dias e
// ainda ativas), MRR estimado, distribuição por plano, novas empresas e
// pedidos nos últimos 30 dias.
export class DashboardService {
  constructor(
    private empresaRepository: EmpresaRepository,
    private planoRepository: PlanoRepository,
    private pedidoRepository: PedidoRepository,
  ) {}

  async buscarStats(): Promise<DashboardStats> {
    const [empresas, planos] = await Promise.all([
      this.empresaRepository.listarParaDashboard(),
      this.planoRepository.listarTodos(),
    ]);
    const planoMap = new Map(planos.map((p) => [p.id, p]));

    const hoje = new Date();
    const em7dias = new Date();
    em7dias.setDate(hoje.getDate() + 7);
    const ha30dias = new Date();
    ha30dias.setDate(hoje.getDate() - 30);

    const porStatus = { ativo: 0, atrasado: 0, suspenso: 0 };
    const porPlano = new Map<string, { planoId: string; nome: string; count: number }>();
    let mrr = 0;
    let pertoDeVencer = 0;
    let novasUltimos30d = 0;

    for (const e of empresas) {
      const status = e.status_pagamento as keyof typeof porStatus;
      if (status in porStatus) porStatus[status]++;

      const plano = planoMap.get(e.plano_id);
      if (plano) {
        if (status === "ativo") mrr += Number(plano.preco_mensal);
        const atual = porPlano.get(e.plano_id) ?? {
          planoId: e.plano_id,
          nome: plano.nome,
          count: 0,
        };
        atual.count++;
        porPlano.set(e.plano_id, atual);
      }

      if (
        status === "ativo" &&
        e.proximo_vencimento &&
        new Date(e.proximo_vencimento + "T00:00:00") <= em7dias
      ) {
        pertoDeVencer++;
      }

      if (new Date(e.criado_em) >= ha30dias) novasUltimos30d++;
    }

    const pedidosUltimos30d = await this.pedidoRepository.contarDesde(ha30dias);

    return {
      total: empresas.length,
      porStatus,
      pertoDeVencer,
      mrr,
      porPlano: [...porPlano.values()].sort((a, b) => b.count - a.count),
      novasUltimos30d,
      pedidosUltimos30d,
    };
  }
}
