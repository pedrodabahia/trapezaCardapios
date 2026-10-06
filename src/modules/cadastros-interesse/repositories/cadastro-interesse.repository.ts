import { adminClient } from "@/core/database/supabase-admin";

import type {
  CadastroInteresse,
  NovoCadastroInteresseInput,
} from "../types/cadastro-interesse.types";

export interface CadastroInteresseRepository {
  criar(dados: NovoCadastroInteresseInput): Promise<{ id: string }>;

  listarRecentes(limite: number): Promise<CadastroInteresse[]>;

  buscarPorId(id: string): Promise<CadastroInteresse>;

  atualizar(
    id: string,
    dados: Partial<NovoCadastroInteresseInput> & {
      tipo?: "trapeza" | "externa" | null;
      status?: "novo" | "contatado" | "arquivado" | "pendente" | "aprovado" | "recusado";
    },
  ): Promise<CadastroInteresse>;

  remover(id: string): Promise<void>;
}

export class SupabaseCadastroInteresseRepository
  implements CadastroInteresseRepository
{
  private sb() {
    return adminClient();
  }

  async criar(
    dados: NovoCadastroInteresseInput,
  ): Promise<{ id: string }> {
    const categorias = dados.categorias ?? [];

    const categoriaPrincipal =
      categorias[0] ?? null;

    const { data, error } = await this.sb()
      .from("cadastros_interesse")
      .insert({
        nome_empresa: dados.nomeEmpresa,
        nome_responsavel: dados.nomeResponsavel,

        whatsapp: dados.whatsapp,
        email: dados.email || null,

        cidade: dados.cidade,
        bairro: dados.bairro || null,
        endereco: dados.endereco || null,

        // Compatibilidade com código antigo.
        categoria_negocio_id: categoriaPrincipal,

        categorias,

        outra_categoria:
          dados.outraCategoria || null,

        descricao:
          dados.descricao || null,

        palavras_chave:
          dados.palavrasChave || null,

        logo_url:
          dados.logoUrl || null,

        capa_url:
          dados.capaUrl || null,

        url_externa:
          dados.urlExterna || null,

        tipo: null,

        status: "pendente",
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id as string,
    };
  }

  async listarRecentes(
    limite: number,
  ): Promise<CadastroInteresse[]> {
    const { data, error } = await this.sb()
      .from("cadastros_interesse")
      .select("*")
      .in("status", ["pendente", "novo", "contatado"])
      .order("criado_em", {
        ascending: false,
      })
      .limit(limite);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as CadastroInteresse[];
  }

  async buscarPorId(
    id: string,
  ): Promise<CadastroInteresse> {
    const { data, error } = await this.sb()
      .from("cadastros_interesse")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new Error(
        error?.message ??
          "Cadastro não encontrado.",
      );
    }

    return data as CadastroInteresse;
  }

  async atualizar(
    id: string,
    dados: Partial<NovoCadastroInteresseInput> & {
      tipo?: "trapeza" | "externa" | null;
      status?:
        | "novo"
        | "contatado"
        | "arquivado"
        | "pendente"
        | "aprovado"
        | "recusado";
    },
  ): Promise<CadastroInteresse> {
    const patch: Record<string, unknown> = {};

    if (dados.nomeEmpresa !== undefined) {
      patch.nome_empresa = dados.nomeEmpresa;
    }

    if (dados.nomeResponsavel !== undefined) {
      patch.nome_responsavel =
        dados.nomeResponsavel;
    }

    if (dados.whatsapp !== undefined) {
      patch.whatsapp = dados.whatsapp;
    }

    if (dados.email !== undefined) {
      patch.email = dados.email || null;
    }

    if (dados.cidade !== undefined) {
      patch.cidade = dados.cidade;
    }

    if (dados.bairro !== undefined) {
      patch.bairro = dados.bairro || null;
    }

    if (dados.endereco !== undefined) {
      patch.endereco =
        dados.endereco || null;
    }

    if (dados.categorias !== undefined) {
      patch.categorias = dados.categorias;

      // Compatibilidade.
      patch.categoria_negocio_id =
        dados.categorias[0] ?? null;
    }

    if (dados.outraCategoria !== undefined) {
      patch.outra_categoria =
        dados.outraCategoria || null;
    }

    if (dados.descricao !== undefined) {
      patch.descricao =
        dados.descricao || null;
    }

    if (dados.palavrasChave !== undefined) {
      patch.palavras_chave =
        dados.palavrasChave || null;
    }

    if (dados.logoUrl !== undefined) {
      patch.logo_url =
        dados.logoUrl || null;
    }

    if (dados.capaUrl !== undefined) {
      patch.capa_url =
        dados.capaUrl || null;
    }

    if (dados.urlExterna !== undefined) {
      patch.url_externa =
        dados.urlExterna || null;
    }

    if (dados.tipo !== undefined) {
      patch.tipo = dados.tipo;
    }

    if (dados.status !== undefined) {
      patch.status = dados.status;
    }

    const { data, error } = await this.sb()
      .from("cadastros_interesse")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(
        error?.message ??
          "Não foi possível atualizar o cadastro.",
      );
    }

    return data as CadastroInteresse;
  }

  async remover(id: string): Promise<void> {
    const { error } = await this.sb()
      .from("cadastros_interesse")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }
}