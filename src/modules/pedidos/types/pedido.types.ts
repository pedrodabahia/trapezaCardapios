export type PedidoStatus =
  | "recebido"
  | "preparando"
  | "pronto"
  | "entregue"
  | "cancelado";

export type FormaPagamento = "pix" | "cartao" | "dinheiro";

export type PedidoItem = {
  nome: string;
  qtd: number;
  preco_unit: number;
  obs?: string;
  // nomes dos ingredientes que o cliente pediu pra tirar (só os marcados
  // como removível no produto aparecem aqui).
  ingredientes_removidos?: string[];
};

export type Pedido = {
  id: string;
  empresa_id: string;
  numero: string;
  cliente_nome: string;
  cliente_telefone: string;
  endereco: string | null;
  itens: PedidoItem[];
  subtotal: number;
  taxa_entrega: number;
  desconto: number;
  valor_total: number;
  cupom: string | null;
  status: PedidoStatus;
  criado_em: string;
  forma_pagamento: FormaPagamento | null;
  // só faz sentido quando forma_pagamento = "dinheiro". Ex: cliente vai
  // pagar com uma nota de R$100, então troco_para = 100 e o
  // estabelecimento já sabe que precisa levar troco de (100 - valor_total).
  troco_para: number | null;
};

export type CriarPedidoItemInput = {
  produtoId: string;
  qtd: number;
  // nomes das opções escolhidas (de qualquer categoria de adicional que a
  // empresa tenha criado) — o preço de cada uma é buscado no banco por
  // nome, então não depende de categorias fixas.
  customization?: {
    opcoes?: string[];
    ingredientesRemovidos?: string[];
  };
  obs?: string;
};

export type CriarPedidoInput = {
  empresaId: string;
  clienteNome: string;
  clienteTelefone: string;
  endereco?: string;
  // id do bairro escolhido no checkout — usado pra buscar a taxa de
  // entrega certa (ver EmpresaConfigParaPrecificacao.bairros). Só faz
  // sentido se a empresa tiver bairros cadastrados.
  bairroId?: string;
  itens: CriarPedidoItemInput[];
  cupom?: string;
  formaPagamento?: FormaPagamento;
  // valor da nota/troco pedido pelo cliente, só relevante se
  // formaPagamento === "dinheiro".
  trocoPara?: number;
};

export type CriarPedidoResult = {
  ok: true;
  id: string;
  numero: string;
  itens: PedidoItem[];
  subtotal: number;
  taxaEntrega: number;
  desconto: number;
  valorTotal: number;
  cupom?: string;
  formaPagamento: FormaPagamento | null;
  trocoPara: number | null;
};

// ============================================================================
// Dados mínimos de OUTROS domínios (produtos, opções, config da empresa)
// necessários pra recalcular preço com segurança no servidor.
//
// TODO(migração incremental): os módulos "produtos" e "empresas" ainda não
// existem. Quando existirem, trocar o PedidoPricingRepository por injeção
// direta de ProdutoRepository/EmpresaRepository no PedidoService, ao invés
// de acessar essas tabelas por fora do domínio de pedidos.
// ============================================================================

export type ProdutoParaPrecificacao = {
  id: string;
  nome: string;
  preco: number;
  ativo: boolean;
};

export type OpcaoParaPrecificacao = {
  nome: string;
  preco_adicional: number;
};

export type FreteConfig = {
  taxa: number;
  gratis_acima_de: number | null;
  gratis_habilitado: boolean;
};

export type BairroConfig = {
  id: string;
  name: string;
  fee: number;
};

export type CupomConfig = {
  code: string;
  discount: number;
  desc: string;
};

export type EmpresaConfigParaPrecificacao = {
  frete?: FreteConfig;
  cupons?: CupomConfig[];
  bairros?: BairroConfig[];
};
