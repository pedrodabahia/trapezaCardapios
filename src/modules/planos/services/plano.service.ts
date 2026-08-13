import type { PlanoRepository } from "../repositories/plano.repository";
import type { EmpresaRepository } from "@/modules/empresas/repositories/empresa.repository";
import type { ProdutoRepository } from "@/modules/produtos/repositories/produto.repository";

export class PlanoService {
  constructor(
    private planoRepository: PlanoRepository,
    private empresaRepository: EmpresaRepository,
    private produtoRepository: ProdutoRepository,
  ) {}

  listarTodos() {
    return this.planoRepository.listarTodos();
  }

  // Devolve o plano atual da empresa (nome, limites, features) pra tela
  // de Conta/Plano do painel do cliente.
  async buscarPlanoDaEmpresa(empresaId: string) {
    const empresa = await this.empresaRepository.buscarPorId(empresaId);
    const plano = await this.planoRepository.buscarPorId(empresa.plano_id);
    const produtosUsados = await this.produtoRepository.contarPorEmpresa(empresaId);
    return {
      plano,
      status_pagamento: empresa.status_pagamento,
      produtos_usados: produtosUsados,
    };
  }
}
