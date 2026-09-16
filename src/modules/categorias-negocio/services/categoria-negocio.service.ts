// CAMADA DE SERVICE (categorias-negocio) — regra de negócio. Exige
// valor+label; "valor" deve ser único (o banco já garante via unique
// constraint, aqui só normaliza pra minúsculas/sem espaço, já que esse
// valor é usado como chave em `empresas.categorias`).
import type { CategoriaNegocioRepository } from "../repositories/categoria-negocio.repository";
import type { NovaCategoriaNegocioInput } from "../types/categoria-negocio.types";

function normalizarValor(v: string): string {
  return v
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export class CategoriaNegocioService {
  constructor(private repository: CategoriaNegocioRepository) {}

  async listarAtivas() {
    return this.repository.listarAtivas();
  }

  async listarTodas() {
    return this.repository.listarTodas();
  }

  async salvar(dados: NovaCategoriaNegocioInput) {
    if (!dados.label?.trim()) throw new Error("Nome da categoria é obrigatório.");
    if (!dados.valor?.trim()) throw new Error("Valor da categoria é obrigatório.");
    return this.repository.salvar({ ...dados, valor: normalizarValor(dados.valor) });
  }

  async remover(id: string) {
    await this.repository.remover(id);
  }
}
