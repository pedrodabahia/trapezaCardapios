// CAMADA DE TIPOS — contratos de dado, sem lógica.
export type ProdutoTag = "mais-vendido" | "promocao" | "novo";
export type TipoCadastro = "produto" | "servico";

export type Nutricao = {
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
};

export type Produto = {
  id: string;
  empresa_id: string;
  tipo: TipoCadastro;
  categoria_id: string | null;
  nome: string;
  descricao_curta: string | null;
  descricao: string | null;
  // Mantido obrigatório no banco. Para serviço sem preço definido, usar 0
  // e apresentar "Consultar valor" na interface pública.
  preco: number;
  preco_antigo: number | null;
  imagem_url: string | null;
  ingredientes: string[];
  nutricao: Nutricao;
  tempo_preparo: string | null;
  tag: ProdutoTag | null;
  ordem: number;
  ativo: boolean;
};

// tipo opcional na entrada para manter compatibilidade com chamadas antigas;
// o repository aplica "produto" como padrão quando não informado.
export type NovoProdutoInput = Omit<Produto, "id" | "empresa_id" | "tipo"> & {
  id?: string;
  tipo?: TipoCadastro;
};

export type ProdutoIngrediente = {
  id: string;
  produto_id: string;
  nome: string;
  removivel: boolean;
  ordem: number;
};

export type ProdutoIngredienteInput = {
  nome: string;
  removivel: boolean;
};