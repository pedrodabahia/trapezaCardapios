export type Categoria = {
  id: string;
  empresa_id: string;
  slug: string;
  nome: string;
  emoji: string | null;
  imagem_url: string | null;
  ordem: number;
  ativo: boolean;
  // ids de CategoriaOpcao que se aplicam aos produtos dessa categoria
  categorias_opcao_ids: string[];
};

// Categoria de adicional definida pela própria empresa (ex: "Tipo de pão",
// "Sabor", "Molhos").
export type CategoriaOpcao = {
  id: string;
  empresa_id: string;
  slug: string;
  nome: string;
  selecao: "unica" | "multipla";
  obrigatorio: boolean;
  ordem: number;
  // Se true, essa categoria (e as opções dentro dela) aparece no widget
  // "carne do dia" da home do painel — pra categorias que mudam de
  // disponibilidade com frequência e o dono quer um atalho rápido, sem
  // precisar entrar na aba Personalização.
  destaque_dashboard: boolean;
};

export type OpcaoPersonalizacao = {
  id: string;
  empresa_id: string;
  categoria_opcao_id: string;
  nome: string;
  preco_adicional: number;
  ordem: number;
  // Liga/desliga a opção sem apagar o registro (ex: acabou a carne hoje).
  // Opção com ativo=false não aparece pro cliente no cardápio público,
  // mas continua visível pro admin pra religar depois.
  ativo: boolean;
};

export type NovaCategoriaInput = Omit<Categoria, "id" | "empresa_id"> & { id?: string };
export type NovaCategoriaOpcaoInput = Omit<CategoriaOpcao, "id" | "empresa_id"> & { id?: string };
export type NovaOpcaoInput = Omit<OpcaoPersonalizacao, "id" | "empresa_id"> & { id?: string };
