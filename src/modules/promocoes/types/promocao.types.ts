export type PromocaoStatus =
  | "rascunho"
  | "ativa"
  | "pausada"
  | "expirada";

export type Promocao = {
  id: string;

  empresa_id: string;
  categoria_id: string | null;

  titulo: string;
  slug: string;
  descricao: string | null;
  imagem_url: string | null;

  categoria_negocio_id: string | null;

  preco_anterior: number | null;
  preco_promocional: number | null;

  inicio_em: string | null;
  fim_em: string | null;

  status: PromocaoStatus;

  destaque: boolean;
  ordem_destaque: number | null;

  criada_por: string | null;

  created_at: string;
  updated_at: string;
};

export type PromocaoCategoria = {
  id: string;
  nome: string;
  slug: string;
  emoji: string | null;
  ativo: boolean;
  ordem: number;
  created_at: string;
};

export type PromocaoPublica = Promocao & {
  empresa_nome: string;
  empresa_slug: string;
  empresa_logo_url: string | null;
  empresa_whatsapp: string | null;
  empresa_cidade: string | null;
  empresa_bairro: string | null;
  categoria_negocio_id: string | null;

  categorias: PromocaoCategoria[];
};

export type NovaPromocaoInput = {
  id?: string;

  empresa_id: string;
  categoria_negocio_id?: string | null;
  
  titulo: string;
  slug?: string;

  descricao?: string | null;
  imagem_url?: string | null;

  preco_anterior?: number | null;
  preco_promocional?: number | null;

  inicio_em?: string | null;
  fim_em?: string | null;

  status?: PromocaoStatus;

  destaque?: boolean;
  ordem_destaque?: number | null;

  criada_por?: string | null;
};