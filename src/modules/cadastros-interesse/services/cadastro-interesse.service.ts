import type { CadastroInteresseRepository } from "../repositories/cadastro-interesse.repository";

import type {
  NovoCadastroInteresseInput,
} from "../types/cadastro-interesse.types";

const limpar = (
  valor: string | undefined,
  maximo: number,
) =>
  (valor ?? "")
    .trim()
    .slice(0, maximo);

export class CadastroInteresseService {
  constructor(
    private repository: CadastroInteresseRepository,
  ) {}

  async criar(
    dados: NovoCadastroInteresseInput,
  ) {
    const nomeEmpresa = limpar(
      dados.nomeEmpresa,
      120,
    );

    const nomeResponsavel = limpar(
      dados.nomeResponsavel,
      120,
    );

    const whatsapp = limpar(
      dados.whatsapp,
      40,
    );

    const email = dados.email
      ? limpar(dados.email, 160)
      : undefined;

    const cidade = limpar(
      dados.cidade,
      100,
    );

    const bairro = limpar(
      dados.bairro,
      100,
    );

    const endereco = limpar(
      dados.endereco,
      200,
    );

    const categorias = (
      dados.categorias ?? []
    )
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 20);

    const outraCategoria = limpar(
      dados.outraCategoria,
      120,
    );

    const descricao = limpar(
      dados.descricao,
      1000,
    );

    const palavrasChave = limpar(
      dados.palavrasChave,
      500,
    );

    const logoUrl = limpar(
      dados.logoUrl,
      500,
    );

    const capaUrl = limpar(
      dados.capaUrl,
      500,
    );

    const urlExterna = limpar(
      dados.urlExterna,
      500,
    );

    if (
      !nomeEmpresa ||
      !nomeResponsavel ||
      !whatsapp ||
      !cidade
    ) {
      throw new Error(
        "Preencha todos os campos obrigatórios.",
      );
    }

    if (categorias.length === 0) {
      throw new Error(
        "Escolha pelo menos uma categoria.",
      );
    }

    if (
      whatsapp.replace(/\D/g, "")
        .length < 10
    ) {
      throw new Error(
        "Informe um WhatsApp válido com DDD.",
      );
    }

    if (
      email &&
      !/^\S+@\S+\.\S+$/.test(email)
    ) {
      throw new Error(
        "Informe um e-mail válido.",
      );
    }

    if (
      categorias.includes("outros") &&
      !outraCategoria
    ) {
      throw new Error(
        "Informe qual é a atividade do negócio.",
      );
    }

    return this.repository.criar({
      nomeEmpresa,
      nomeResponsavel,
      whatsapp,
      email,

      cidade,
      bairro,
      endereco,

      categorias,
      outraCategoria,

      descricao,
      palavrasChave,

      logoUrl,
      capaUrl,
      urlExterna,
    });
  }

  listarRecentes() {
    return this.repository.listarRecentes(50);
  }

  buscarPorId(id: string) {
    if (!id) {
      throw new Error(
        "Cadastro inválido.",
      );
    }

    return this.repository.buscarPorId(id);
  }

  remover(id: string) {
    if (!id) {
      throw new Error(
        "Cadastro inválido.",
      );
    }

    return this.repository.remover(id);
  }
}