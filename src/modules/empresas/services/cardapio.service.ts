import type { EmpresaRepository } from "../repositories/empresa.repository";
import type { ProdutoRepository } from "@/modules/produtos/repositories/produto.repository";
import type { ProdutoService } from "@/modules/produtos/services/produto.service";
import type { CategoriaRepository } from "@/modules/categorias/repositories/categoria.repository";
import type { EmpresaCompleta } from "../types/empresa.types";

// Compõe o "pacote completo" de uma empresa (dados dela + config +
// categorias + produtos + opções + ingredientes) pra montar o cardápio —
// tanto a versão pública (só o que está ativo) quanto a autenticada (tudo,
// pro admin editar mesmo o que está pausado).
export class CardapioService {
  constructor(
    private empresaRepository: EmpresaRepository,
    private produtoRepository: ProdutoRepository,
    private categoriaRepository: CategoriaRepository,
    private produtoService: ProdutoService,
  ) {}

  async buscarPublicoPorSlug(slug: string): Promise<EmpresaCompleta | null> {
    const empresa = await this.empresaRepository.buscarPorSlug(slug);
    if (!empresa || empresa.status_pagamento === "suspenso") return null;

    const [config, categorias, categoriasOpcao, produtos, opcoes] = await Promise.all([
      this.empresaRepository.buscarConfig(empresa.id),
      this.categoriaRepository.listarCategoriasAtivas(empresa.id),
      this.categoriaRepository.listarCategoriasOpcao(empresa.id),
      this.produtoRepository.listarAtivosPorEmpresa(empresa.id),
      this.categoriaRepository.listarOpcoes(empresa.id),
    ]);
    const produtoIngredientes = await this.produtoService.listarIngredientesPorProdutos(
      produtos.map((p) => p.id),
    );

    return { empresa, config, categorias, categoriasOpcao, produtos, opcoes, produtoIngredientes };
  }

  async buscarCompletoAutenticado(empresaId: string): Promise<EmpresaCompleta> {
    const empresa = await this.empresaRepository.buscarPorId(empresaId);

    const [config, categorias, categoriasOpcao, produtos, opcoes] = await Promise.all([
      this.empresaRepository.buscarConfig(empresaId),
      this.categoriaRepository.listarCategoriasTodas(empresaId),
      this.categoriaRepository.listarCategoriasOpcao(empresaId),
      this.produtoRepository.listarTodosPorEmpresa(empresaId),
      this.categoriaRepository.listarOpcoes(empresaId),
    ]);
    const produtoIngredientes = await this.produtoService.listarIngredientesPorProdutos(
      produtos.map((p) => p.id),
    );

    return { empresa, config, categorias, categoriasOpcao, produtos, opcoes, produtoIngredientes };
  }
}
