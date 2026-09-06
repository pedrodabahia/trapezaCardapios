import type { Produto } from "@/modules/produtos/types/produto.types";
import type { Categoria, CategoriaOpcao, OpcaoPersonalizacao } from "@/modules/categorias/types/categoria.types";
import type { ProdutoIngrediente } from "@/modules/produtos/types/produto.types";

export type Empresa = {
  id: string;
  slug: string;
  nome: string;
  // Vazio pra empresas externas sem WhatsApp cadastrado (o contato delas
  // é pelo próprio site). Empresas tipo "trapeza" continuam exigindo
  // WhatsApp no formulário de cadastro, mesmo que o banco aceite null.
  whatsapp: string | null;
  endereco: string | null;
  pix_chave: string | null;
  logo_url: string | null;
  status_pagamento: "ativo" | "atrasado" | "suspenso";
  plano_id: string;
  proximo_vencimento: string | null;
  criado_em?: string;
  // Categoria de negócio (ver src/lib/categorias-negocio.ts) e cidade,
  // preenchidas pelo dono no painel — alimentam busca/filtro da home
  // pública.
  categoria: string | null;
  cidade: string | null;
  // "trapeza" = usa a estrutura normal (página pública em /s/slug,
  // painel, pedidos). "externa" = cliente com site/sistema próprio que
  // só aparece no diretório da home, apontando pra fora (url_externa).
  tipo: "trapeza" | "externa";
  url_externa: string | null;
  descricao: string | null;
  bairro: string | null;
  capa_url: string | null;
  // Controlado só pelo super-admin (área /plataforma) — decide quem
  // aparece em "Empresas em destaque" na home.
  destaque: boolean;
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

// Cadastro de empresa EXTERNA (cliente com site/sistema próprio) — só
// entra no diretório, não cria login/painel/página pública.
export type NovaEmpresaExternaInput = {
  slug: string;
  nome: string;
  categoria: string | null;
  cidade: string | null;
  bairro: string | null;
  whatsapp: string | null;
  urlExterna: string;
  descricao: string | null;
  logoUrl: string | null;
  capaUrl: string | null;
  destaque: boolean;
};

// Edição do perfil de diretório de qualquer empresa (trapeza ou externa),
// só pelo super-admin. Não inclui campos sensíveis de faturamento (esses
// continuam em updateEmpresaStatus/renovarAssinatura) nem o "tipo" (não dá
// pra converter uma empresa de um tipo pro outro depois de criada).
export type EmpresaPlataformaPatch = Partial<
  Pick<
    Empresa,
    | "nome"
    | "whatsapp"
    | "endereco"
    | "logo_url"
    | "capa_url"
    | "descricao"
    | "categoria"
    | "cidade"
    | "bairro"
    | "url_externa"
    | "destaque"
  >
>;
