import { adminClient } from "@/core/database/supabase-admin";
import type { CadastroInteresse, NovoCadastroInteresseInput } from "../types/cadastro-interesse.types";

export interface CadastroInteresseRepository {
  criar(dados: NovoCadastroInteresseInput): Promise<{ id: string }>;
  listarRecentes(limite: number): Promise<CadastroInteresse[]>;
  remover(id: string): Promise<void>;
}

export class SupabaseCadastroInteresseRepository implements CadastroInteresseRepository {
  private sb() {
    return adminClient();
  }

  async criar(dados: NovoCadastroInteresseInput): Promise<{ id: string }> {
    const { data, error } = await this.sb()
      .from("cadastros_interesse")
      .insert({
        nome_empresa: dados.nomeEmpresa,
        nome_responsavel: dados.nomeResponsavel,
        whatsapp: dados.whatsapp,
        email: dados.email || null,
        cidade: dados.cidade,
        categoria_negocio_id: dados.categoriaNegocioId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: data.id as string };
  }

  async listarRecentes(limite: number): Promise<CadastroInteresse[]> {
    const { data, error } = await this.sb()
      .from("cadastros_interesse")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(limite);
    if (error) throw new Error(error.message);
    return (data ?? []) as CadastroInteresse[];
  }

  async remover(id: string): Promise<void> {
    const { error } = await this.sb()
      .from("cadastros_interesse")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
  }
}
