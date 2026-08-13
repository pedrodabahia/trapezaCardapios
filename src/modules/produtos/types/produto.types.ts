export type ProdutoTag = "mais-vendido" | "promocao" | "novo";

export type Nutricao = {
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
};

export type Produto = {
  id: string;
  empresa_id: string;
  categoria_id: string | null;
  nome: string;
  descricao_curta: string | null;
  descricao: string | null;
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

export type NovoProdutoInput = Omit<Produto, "id" | "empresa_id"> & { id?: string };

// Ingrediente de um produto específico. `removivel = false` significa
// obrigatório/fixo (não aparece como opção de remoção pro cliente);
// `removivel = true` significa que o cliente pode pedir pra tirar esse
// ingrediente no pedido.
export type ProdutoIngrediente = {
  id: string;
  produto_id: string;
  nome: string;
  removivel: boolean;
  ordem: number;
};

// Input usado ao salvar a lista inteira de ingredientes de um produto de
// uma vez (substitui tudo — mais simples e seguro que diff incremental).
export type ProdutoIngredienteInput = {
  nome: string;
  removivel: boolean;
};
