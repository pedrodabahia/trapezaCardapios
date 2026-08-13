import type { Produto } from "@/modules/produtos/types/produto.types";
import type { Categoria, CategoriaOpcao, OpcaoPersonalizacao } from "@/modules/categorias/types/categoria.types";
import type { ProdutoIngrediente } from "@/modules/produtos/types/produto.types";

export type Empresa = {
  id: string;
  slug: string;
  nome: string;
  whatsapp: string;
  endereco: string | null;
  pix_chave: string | null;
  logo_url: string | null;
  status_pagamento: "ativo" | "atrasado" | "suspenso";
  plano_id: string;
  proximo_vencimento: string | null;
  criado_em?: string;
};

export type EmpresaConfigJson = {
  cores?: {
    primary?: string;
    accent?: string;
    bg?: string;
    fg?: string;
  };
  cupons?: { code: string; discount: number; desc: string }[];
  frete?: {
    taxa: number;
    gratis_acima_de: number | null;
    gratis_habilitado: boolean;
  };
  horarios?: Record<string, { abre: string; fecha: string; fechado: boolean }>;
  cidade_entrega?: string;
};

export type EmpresaCompleta = {
  empresa: Empresa;
  config: EmpresaConfigJson;
  categorias: Categoria[];
  categoriasOpcao: CategoriaOpcao[];
  produtos: Produto[];
  opcoes: OpcaoPersonalizacao[];
  // ingredientes de cada produto, por produto_id — só existe entrada aqui
  // pros produtos que tiverem ingrediente cadastrado.
  produtoIngredientes: Record<string, ProdutoIngrediente[]>;
};

export type EmpresaDashboardRow = {
  id: string;
  status_pagamento: Empresa["status_pagamento"];
  plano_id: string;
  proximo_vencimento: string | null;
  criado_em: string;
};

export type DashboardStats = {
  total: number;
  porStatus: { ativo: number; atrasado: number; suspenso: number };
  pertoDeVencer: number;
  mrr: number;
  porPlano: { planoId: string; nome: string; count: number }[];
  novasUltimos30d: number;
  pedidosUltimos30d: number;
};

export type NovaEmpresaInput = {
  slug: string;
  nome: string;
  whatsapp: string;
  planoId: string;
  adminEmail: string;
};
