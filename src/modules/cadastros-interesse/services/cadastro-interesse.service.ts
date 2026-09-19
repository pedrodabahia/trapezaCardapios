import type { CadastroInteresseRepository } from "../repositories/cadastro-interesse.repository";
import type { NovoCadastroInteresseInput } from "../types/cadastro-interesse.types";

const limpar = (valor: string, maximo: number) => valor.trim().slice(0, maximo);

export class CadastroInteresseService {
  constructor(private repository: CadastroInteresseRepository) {}

  async criar(dados: NovoCadastroInteresseInput) {
    const nomeEmpresa = limpar(dados.nomeEmpresa, 120);
    const nomeResponsavel = limpar(dados.nomeResponsavel, 120);
    const whatsapp = limpar(dados.whatsapp, 40);
    const cidade = limpar(dados.cidade, 100);
    const categoriaNegocioId = limpar(dados.categoriaNegocioId, 80);
    const email = dados.email ? limpar(dados.email, 160) : undefined;

    if (!nomeEmpresa || !nomeResponsavel || !whatsapp || !cidade || !categoriaNegocioId) {
      throw new Error("Preencha todos os campos obrigatórios.");
    }
    if (whatsapp.replace(/\D/g, "").length < 10) {
      throw new Error("Informe um WhatsApp válido com DDD.");
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error("Informe um e-mail válido.");
    }

    return this.repository.criar({ nomeEmpresa, nomeResponsavel, whatsapp, cidade, categoriaNegocioId, email });
  }

  listarRecentes() {
    return this.repository.listarRecentes(50);
  }

  remover(id: string) {
    if (!id) throw new Error("Cadastro inválido.");
    return this.repository.remover(id);
  }
}
