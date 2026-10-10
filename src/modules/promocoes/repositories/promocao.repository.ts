import { adminClient } from "@/core/database/supabase-admin";
import type { Empresa } from "@/modules/empresas/types/empresa.types";
import type {
  NovaPromocaoInput,
  Promocao,
  PromocaoCategoria,
  PromocaoPublica,
} from "../types/promocao.types";

type PromocaoRow = Promocao & {
  empresa: Pick<
    Empresa,
    "id" | "nome" | "slug" | "logo_url" | "whatsapp" | "cidade" | "bairro"
  > | null;
};

export interface PromocaoRepository {
  listarAtivas(limite?: number): Promise<PromocaoPublica[]>;
  buscarAtivaPorSlug(slug: string): Promise<PromocaoPublica | null>;
  listarAtivasPorEmpresa(empresaId: string): Promise<PromocaoPublica[]>;
  listarTodas(): Promise<PromocaoPublica[]>;
  listarCategorias(): Promise<PromocaoCategoria[]>;
  salvar(dados: NovaPromocaoInput): Promise<{ id: string; slug: string }>;
  remover(id: string): Promise<void>;
}

function mapPromocao(
  row: PromocaoRow,
  categoria?: PromocaoCategoria | null,
): PromocaoPublica {
  const empresa = row.empresa;

  return {
    ...(row as Promocao),

    empresa_nome: empresa?.nome ?? "",
    empresa_slug: empresa?.slug ?? "",
    empresa_logo_url: empresa?.logo_url ?? null,
    empresa_whatsapp: empresa?.whatsapp ?? null,
    empresa_cidade: empresa?.cidade ?? null,
    empresa_bairro: empresa?.bairro ?? null,

    categorias: categoria ? [categoria] : [],
  };
}

export class SupabasePromocaoRepository implements PromocaoRepository {
  private sb() {
    return adminClient();
  }

  async listarAtivas(limite = 30): Promise<PromocaoPublica[]> {
    const agora = new Date().toISOString();

    const { data, error } = await this.sb()
      .from("promocoes")
      .select(`
        *,
        empresa:empresas!inner(
          id,
          nome,
          slug,
          logo_url,
          whatsapp,
          cidade,
          bairro
        )
      `)
      .eq("status", "ativa")
      .or(`inicio_em.is.null,inicio_em.lte.${agora}`)
      .or(`fim_em.is.null,fim_em.gte.${agora}`)
      .order("destaque", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limite);

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) =>
      mapPromocao(row as PromocaoRow),
    );
  }

  async buscarAtivaPorSlug(
    slug: string,
  ): Promise<PromocaoPublica | null> {
    const agora = new Date().toISOString();

    const { data, error } = await this.sb()
      .from("promocoes")
      .select(`
        *,
        empresa:empresas!inner(
          id,
          nome,
          slug,
          logo_url,
          whatsapp,
          cidade,
          bairro
        )
      `)
      .eq("slug", slug)
      .eq("status", "ativa")
      .or(`inicio_em.is.null,inicio_em.lte.${agora}`)
      .or(`fim_em.is.null,fim_em.gte.${agora}`)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return mapPromocao(data as PromocaoRow);
  }

  async listarAtivasPorEmpresa(
    empresaId: string,
  ): Promise<PromocaoPublica[]> {
    const agora = new Date().toISOString();

    const { data, error } = await this.sb()
      .from("promocoes")
      .select(`
        *,
        empresa:empresas!inner(
          id,
          nome,
          slug,
          logo_url,
          whatsapp,
          cidade,
          bairro
        )
      `)
      .eq("empresa_id", empresaId)
      .eq("status", "ativa")
      .or(`inicio_em.is.null,inicio_em.lte.${agora}`)
      .or(`fim_em.is.null,fim_em.gte.${agora}`)
      .order("destaque", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) =>
      mapPromocao(row as PromocaoRow),
    );
  }

  async listarTodas(): Promise<PromocaoPublica[]> {
    const { data, error } = await this.sb()
      .from("promocoes")
      .select(`
        *,
        empresa:empresas!inner(
          id,
          nome,
          slug,
          logo_url,
          whatsapp,
          cidade,
          bairro
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) =>
      mapPromocao(row as PromocaoRow),
    );
  }

  async listarCategorias(): Promise<PromocaoCategoria[]> {
    /*
     * NÃO implemente esta consulta ainda.
     *
     * Precisamos confirmar qual tabela o campo
     * promocoes.categoria_id referencia.
     */
    return [];
  }

  async salvar(
    dados: NovaPromocaoInput,
  ): Promise<{ id: string; slug: string }> {
    const { id, ...payload } = dados;

    if (id) {
      const { error } = await this.sb()
        .from("promocoes")
        .update(payload)
        .eq("id", id);

      if (error) throw new Error(error.message);
    } else {
      const { data, error } = await this.sb()
        .from("promocoes")
        .insert(payload)
        .select("id, slug")
        .single();

      if (error) throw new Error(error.message);

      return {
        id: data.id,
        slug: data.slug,
      };
    }

    const { data, error } = await this.sb()
      .from("promocoes")
      .select("id, slug")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new Error(
        error?.message ?? "Promoção não encontrada após salvar.",
      );
    }

    return {
      id: data.id,
      slug: data.slug,
    };
  }

  async remover(id: string): Promise<void> {
    const { error } = await this.sb()
      .from("promocoes")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
  }
}