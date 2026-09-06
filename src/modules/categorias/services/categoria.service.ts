// CAMADA DE SERVICE (categorias) — regra de negócio. A maioria dos
// métodos aqui só repassa pro repository (não tem regra nenhuma pra
// aplicar), mas manter essa camada existindo já deixa o controller
// desacoplado do Supabase — se um dia precisar validar algo antes de
// salvar, o lugar certo pra isso é aqui, sem mexer no controller nem no
// repository.
import type { CategoriaRepository } from "../repositories/categoria.repository";
import type {
  NovaCategoriaInput,
  NovaCategoriaOpcaoInput,
  NovaOpcaoInput,
} from "../types/categoria.types";

export class CategoriaService {
  constructor(private repository: CategoriaRepository) {}

  listarAtivas(empresaId: string) {
    return this.repository.listarCategoriasAtivas(empresaId);
  }

  listarTodas(empresaId: string) {
    return this.repository.listarCategoriasTodas(empresaId);
  }

  salvarCategoria(empresaId: string, categoria: NovaCategoriaInput) {
    return this.repository.salvarCategoria(empresaId, categoria);
  }

  async removerCategoria(empresaId: string, categoriaId: string) {
    await this.repository.removerCategoria(empresaId, categoriaId);
  }

  listarOpcoesCategoria(empresaId: string) {
    return this.repository.listarCategoriasOpcao(empresaId);
  }

  salvarCategoriaOpcao(empresaId: string, categoriaOpcao: NovaCategoriaOpcaoInput) {
    return this.repository.salvarCategoriaOpcao(empresaId, categoriaOpcao);
  }

  // Apaga a categoria de adicional e tira o id dela de qualquer categoria
  // de produto que estivesse usando (as opções dentro dela somem via FK
  // on delete cascade no banco).
  async removerCategoriaOpcao(empresaId: string, categoriaOpcaoId: string) {
    const categorias = await this.repository.listarCategoriasComOpcao(empresaId, categoriaOpcaoId);
    for (const cat of categorias) {
      const novoIds = cat.categorias_opcao_ids.filter((id) => id !== categoriaOpcaoId);
      await this.repository.atualizarCategoriasOpcaoIds(cat.id, novoIds);
    }
    await this.repository.removerCategoriaOpcao(empresaId, categoriaOpcaoId);
  }

  listarOpcoes(empresaId: string) {
    return this.repository.listarOpcoes(empresaId);
  }

  listarOpcoesAtivas(empresaId: string) {
    return this.repository.listarOpcoesAtivas(empresaId);
  }

  salvarOpcao(empresaId: string, opcao: NovaOpcaoInput) {
    return this.repository.salvarOpcao(empresaId, opcao);
  }

  async removerOpcao(empresaId: string, opcaoId: string) {
    await this.repository.removerOpcao(empresaId, opcaoId);
  }

  async toggleOpcaoAtiva(empresaId: string, opcaoId: string, ativo: boolean) {
    await this.repository.toggleOpcaoAtiva(empresaId, opcaoId, ativo);
  }
}
