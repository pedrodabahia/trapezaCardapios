// CAMADA DE SERVICE (anuncios) — regra de negócio. Exige título, e limita
// título/subtítulo a 25 caracteres (o banner tem pouco espaço de texto do
// lado de uma foto grande — texto longo quebra feio). O formulário do
// painel já usa maxLength no input pra travar isso ao digitar; aqui é a
// segunda trava, caso algo chame o salvar sem passar pelo formulário.
import type { AnuncioRepository } from "../repositories/anuncio.repository";
import type { NovoAnuncioInput } from "../types/anuncio.types";

const MAX_CARACTERES = 25;

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
    const dadosLimitados: NovoAnuncioInput = {
      ...dados,
      titulo: dados.titulo.slice(0, MAX_CARACTERES),
      subtitulo: dados.subtitulo ? dados.subtitulo.slice(0, MAX_CARACTERES) : dados.subtitulo,
    };
    return this.repository.salvar(dadosLimitados);
  }

  async remover(id: string) {
    await this.repository.remover(id);
  }
}
