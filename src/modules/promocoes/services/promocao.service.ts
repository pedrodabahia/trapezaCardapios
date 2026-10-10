import type { PromocaoRepository } from "../repositories/promocao.repository";
import type { NovaPromocaoInput } from "../types/promocao.types";

function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class PromocaoService {
  constructor(private repository: PromocaoRepository) {}

  listarAtivas(limite?: number) {
    return this.repository.listarAtivas(limite);
  }

  buscarAtivaPorSlug(slug: string) {
    return this.repository.buscarAtivaPorSlug(slug);
  }

  listarAtivasPorEmpresa(empresaId: string) {
    return this.repository.listarAtivasPorEmpresa(empresaId);
  }

  listarTodas() {
    return this.repository.listarTodas();
  }

  listarCategorias() {
    return this.repository.listarCategorias();
  }


  async salvar(dados: NovaPromocaoInput) {
    const titulo = dados.titulo?.trim();

    if (!titulo) {
      throw new Error("Título da promoção é obrigatório.");
    }

    if (!dados.empresa_id) {
      throw new Error("Empresa é obrigatória.");
    }

    if (
      dados.preco_anterior != null &&
      dados.preco_promocional != null &&
      dados.preco_promocional > dados.preco_anterior
    ) {
      throw new Error(
        "O preço promocional não pode ser maior que o preço anterior.",
      );
    }

    if (
      dados.inicio_em &&
      dados.fim_em &&
      new Date(dados.fim_em) < new Date(dados.inicio_em)
    ) {
      throw new Error(
        "A data final não pode ser anterior à data inicial.",
      );
    }

    const slugBase = slugify(titulo);

    if (!slugBase) {
      throw new Error(
        "Não foi possível gerar o endereço da promoção.",
      );
    }

    return this.repository.salvar({
      ...dados,
      titulo,
      slug: dados.id
        ? dados.slug
        : `${slugBase}-${crypto.randomUUID()}`,
      status: dados.status ?? "rascunho",
      destaque: dados.destaque ?? false,
      descricao: dados.descricao?.trim() || null,
      categoria_negocio_id: dados.categoria_negocio_id ?? null,
    });
  }



  remover(id: string) {
    return this.repository.remover(id);
  }
}