export type CadastroInteresseStatus =
  | "novo"
  | "contatado"
  | "arquivado"
  | "pendente"
  | "aprovado"
  | "recusado";

export type CadastroInteresseTipo =
  | "trapeza"
  | "externa"
  | null;

export type CadastroInteresse = {
  id: string;

  nome_empresa: string;
  nome_responsavel: string;

  whatsapp: string;
  email: string | null;

  cidade: string;

  // Compatibilidade com os cadastros antigos.
  categoria_negocio_id: string | null;

  // Novo formato.
  categorias: string[];

  outra_categoria: string | null;

  bairro: string | null;
  endereco: string | null;

  descricao: string | null;
  palavras_chave: string | null;

  logo_url: string | null;
  capa_url: string | null;
  url_externa: string | null;

  tipo: CadastroInteresseTipo;

  status: CadastroInteresseStatus;

  criado_em: string;
  atualizado_em: string;
};

export type NovoCadastroInteresseInput = {
  nomeEmpresa: string;
  nomeResponsavel: string;

  whatsapp: string;
  email?: string;

  cidade: string;
  bairro?: string;
  endereco?: string;

  categorias: string[];

  // Só preenchido quando escolher "Outros".
  outraCategoria?: string;

  descricao?: string;
  palavrasChave?: string;

  logoUrl?: string;
  capaUrl?: string;
  urlExterna?: string;
};

export type AprovarCadastroInteresseInput = {
  token: string;
  id: string;

  tipo: "trapeza" | "externa";

  // Só será usado para empresa interna.
  senha?: string;

  // Permite corrigir os dados antes da aprovação.
  nomeEmpresa?: string;
  nomeResponsavel?: string;
  whatsapp?: string;
  email?: string;

  cidade?: string;
  bairro?: string;
  endereco?: string;

  categorias?: string[];

  descricao?: string;
  palavrasChave?: string;

  logoUrl?: string;
  capaUrl?: string;
  urlExterna?: string;
};