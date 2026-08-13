import type { ProdutoRepository } from "../repositories/produto.repository";
import type { ProdutoIngredienteRepository } from "../repositories/produto-ingrediente.repository";
import type { NovoProdutoInput, ProdutoIngrediente, ProdutoIngredienteInput } from "../types/produto.types";

export class ProdutoService {
  constructor(
    private repository: ProdutoRepository,
    private ingredienteRepository: ProdutoIngredienteRepository,
  ) {}

  buscarPorId(empresaId: string, produtoId: string) {
    return this.repository.buscarPorId(empresaId, produtoId);
  }

  listarAtivos(empresaId: string) {
    return this.repository.listarAtivosPorEmpresa(empresaId);
  }

  listarTodos(empresaId: string) {
    return this.repository.listarTodosPorEmpresa(empresaId);
  }

  // limiteProdutosDoPlano vem de fora (módulo planos, via empresa) porque
  // isso não é responsabilidade de produtos saber sobre planos — o
  // controller é quem monta esse número antes de chamar salvar().
  async salvar(empresaId: string, produto: NovoProdutoInput, limiteProdutosDoPlano: number | null) {
    if (!produto.id && limiteProdutosDoPlano != null) {
      const total = await this.repository.contarPorEmpresa(empresaId);
      if (total >= limiteProdutosDoPlano) {
        throw new Error(
          `Limite de ${limiteProdutosDoPlano} produtos do seu plano atingido. Faça upgrade pra cadastrar mais.`,
        );
      }
    }
    return this.repository.salvar(empresaId, produto);
  }

  async remover(empresaId: string, produtoId: string) {
    await this.repository.remover(empresaId, produtoId);
  }

  // Ingredientes por produto — usados pra montar o EmpresaCompleta inteiro
  // (busca em lote, por vários produtos de uma vez).
  async listarIngredientesPorProdutos(
    produtoIds: string[],
  ): Promise<Record<string, ProdutoIngrediente[]>> {
    const todos = await this.ingredienteRepository.listarPorProdutoIds(produtoIds);
    const mapa: Record<string, ProdutoIngrediente[]> = {};
    for (const item of todos) {
      (mapa[item.produto_id] ??= []).push(item);
    }
    return mapa;
  }

  // Substitui a lista de ingredientes de UM produto (chamado pelo painel
  // ao salvar o formulário de produto). Confere que o produto é mesmo da
  // empresa antes de mexer, pra não vazar entre tenants.
  async salvarIngredientes(
    empresaId: string,
    produtoId: string,
    itens: ProdutoIngredienteInput[],
  ): Promise<void> {
    const produto = await this.repository.buscarPorIdIgnorandoAtivo(empresaId, produtoId);
    if (!produto) throw new Error("Produto não encontrado");
    await this.ingredienteRepository.substituirDoProduto(produtoId, itens);
  }
}
