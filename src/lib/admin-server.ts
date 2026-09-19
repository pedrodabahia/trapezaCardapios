// Este arquivo não tem mais nenhuma lógica própria. Ele existe só pra
// nenhuma tela precisar mudar o import de "@/lib/admin-server" — toda a
// lógica real mora em src/modules/*, organizada em repository → service →
// controller.

// ============================================================================
// Tipos
// ============================================================================

export type { Empresa, EmpresaConfigJson, EmpresaCompleta, NovaEmpresaExternaInput, EmpresaPlataformaPatch } from "@/modules/empresas/types/empresa.types";
export type { Plano } from "@/modules/planos/types/plano.types";
export type {
  Categoria,
  CategoriaOpcao,
  OpcaoPersonalizacao,
} from "@/modules/categorias/types/categoria.types";
export type {
  Produto,
  ProdutoIngrediente,
  ProdutoIngredienteInput,
} from "@/modules/produtos/types/produto.types";
export type { Pedido } from "@/modules/pedidos/types/pedido.types";
export type { CadastroInteresse } from "@/modules/cadastros-interesse/types/cadastro-interesse.types";

// ============================================================================
// Auth
// ============================================================================

export {
  adminLogin,
  refreshAdminSession,
  platformLogin,
  changeOwnPassword,
  changeClientPassword,
} from "@/modules/usuarios/controllers/auth.controller";

// ============================================================================
// Leitura — público (cardápio)
// ============================================================================

export {
  getEmpresaBySlug,
  getEmpresaById,
  listEmpresasPublicas,
  getConfigsEmpresas,
} from "@/modules/empresas/controllers/empresa.controller";

export { getProdutoById, getTopProdutosPlataforma, getAnunciosPromocao, buscarProdutosPlataforma } from "@/modules/produtos/controllers/produto.controller";
export type { TopProdutoPlataforma, AnuncioPromocao, ProdutoBuscaGlobal } from "@/modules/produtos/controllers/produto.controller";

// ============================================================================
// Leitura — autenticada (admin da empresa)
// ============================================================================

export { getEmpresaCompletaAuth } from "@/modules/empresas/controllers/empresa.controller";

// ============================================================================
// Mutations — admin da empresa
// ============================================================================

export {
  updateEmpresa,
  saveEmpresaConfig,
} from "@/modules/empresas/controllers/empresa.controller";

export {
  saveProduto,
  deleteProduto,
  saveProdutoIngredientes,
} from "@/modules/produtos/controllers/produto.controller";

export { uploadImagem } from "@/modules/midia/controllers/midia.controller";

export {
  saveCategoria,
  deleteCategoria,
  saveCategoriaOpcao,
  deleteCategoriaOpcao,
  saveOpcao,
  deleteOpcao,
  toggleOpcaoAtiva,
} from "@/modules/categorias/controllers/categoria.controller";

// ============================================================================
// Super-admin
// ============================================================================

export {
  listEmpresasAdmin,
  createEmpresa,
  createEmpresaExterna,
  updateEmpresaPlataforma,
  saveEmpresaConfigPlataforma,
  updateEmpresaStatus,
  renovarAssinatura,
  getDashboardStats,
  deleteEmpresa,
} from "@/modules/empresas/controllers/empresa.controller";

export { uploadImagemPlataforma } from "@/modules/midia/controllers/midia.controller";

export {
  getAnunciosHome,
  listAnunciosAdmin,
  saveAnuncioHome,
  deleteAnuncioHome,
} from "@/modules/anuncios/controllers/anuncio.controller";
export type { AnuncioHome, NovoAnuncioInput } from "@/modules/anuncios/types/anuncio.types";

export {
  getCategoriasNegocio,
  listCategoriasNegocioAdmin,
  saveCategoriaNegocio,
  deleteCategoriaNegocio,
} from "@/modules/categorias-negocio/controllers/categoria-negocio.controller";
export type {
  CategoriaNegocioDb,
  NovaCategoriaNegocioInput,
} from "@/modules/categorias-negocio/types/categoria-negocio.types";

// ============================================================================
// Planos
// ============================================================================

export { listPlanos, getPlanoDaEmpresa } from "@/modules/planos/controllers/plano.controller";

// ============================================================================
// Cadastros de interesse — público para envio, super-admin para leitura
// ============================================================================

export {
  criarCadastroInteresse,
  listarCadastrosInteresseRecentes,
  removerCadastroInteresse,
} from "@/modules/cadastros-interesse/controllers/cadastro-interesse.controller";

// ============================================================================
// Pedidos
// ============================================================================

export {
  createPedido,
  contarPedidosTotal,
  getTopVendidos,
  listPedidosEmpresa,
  updatePedidoStatus,
} from "@/modules/pedidos/controllers/pedido.controller";
