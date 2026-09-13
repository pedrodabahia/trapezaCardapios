// CAMADA DE SERVICE (anuncios) — regra de negócio. A única regra real
// hoje é exigir um título (o resto é opcional); se crescer, é aqui que
// entra sem mexer no controller nem no repository.
import type { AnuncioRepository } from "../repositories/anuncio.repository";
import type { NovoAnuncioInput } from "../types/anuncio.types";

export class AnuncioService {
  constructor(private repository: AnuncioRepository) {}

  async listarAtivos() {
    return this.repository.listarAtivos();
  }

  async listarTodos() {
    return this.repository.listarTodos();
  }

  async salvar(dados: NovoAnuncioInput) {
    if (!dados.titulo?.trim()) {
      throw new Error("Título é obrigatório.");
    }
    return this.repository.salvar(dados);
  }

  async remover(id: string) {
    await this.repository.remover(id);
  }
}
