import type { PedidoRepository } from "../repositories/pedido.repository";
import type { PedidoPricingRepository } from "../repositories/pedido-pricing.repository";
import type {
  CriarPedidoInput,
  CriarPedidoResult,
  FormaPagamento,
  Pedido,
  PedidoStatus,
} from "../types/pedido.types";

const FORMAS_VALIDAS: FormaPagamento[] = ["pix", "cartao", "dinheiro"];

// Toda a regra de negócio de pedidos vive aqui. Nada de Supabase direto —
// só chamadas aos repositories injetados pelo construtor.
export class PedidoService {
  constructor(
    private repository: PedidoRepository,
    private pricing: PedidoPricingRepository,
  ) {}

  // Chamada pelo checkout público (sem login) na hora de fechar o pedido.
  // SEGURANÇA: nunca confia no preço mandado pelo client. Recalcula tudo a
  // partir do banco (produto real + opções reais + config real da loja).
  async criar(data: CriarPedidoInput): Promise<CriarPedidoResult> {
    const clienteNome = data.clienteNome.trim().slice(0, 120);
    const clienteTelefone = data.clienteTelefone.trim().slice(0, 40);
    if (!clienteNome || !clienteTelefone) {
      throw new Error("Nome e telefone são obrigatórios");
    }
    if (!data.itens.length) {
      throw new Error("Carrinho vazio");
    }

    const formaPagamento: FormaPagamento | null =
      data.formaPagamento && FORMAS_VALIDAS.includes(data.formaPagamento)
        ? data.formaPagamento
        : null;
    // Troco só faz sentido em dinheiro, e nunca negativo.
    const trocoPara =
      formaPagamento === "dinheiro" && data.trocoPara != null && data.trocoPara > 0
        ? Number(data.trocoPara)
        : null;

    // só aceita pedido pra empresa realmente ativa
    const statusEmpresa = await this.pricing.buscarStatusEmpresa(data.empresaId);
    if (!statusEmpresa || statusEmpresa === "suspenso") {
      throw new Error("Empresa indisponível no momento");
    }

    const produtoIds = [...new Set(data.itens.map((i) => i.produtoId))];
    const produtos = await this.pricing.buscarProdutosPorIds(data.empresaId, produtoIds);
    const produtoMap = new Map(produtos.map((p) => [p.id, p]));

    const opcoes = await this.pricing.buscarOpcoesPorNome(data.empresaId);
    const precoOpcaoPorNome = new Map(opcoes.map((o) => [o.nome, Number(o.preco_adicional)]));

    const cfg = await this.pricing.buscarConfigEmpresa(data.empresaId);

    const itensCalculados: Pedido["itens"] = [];
    let subtotal = 0;
    for (const it of data.itens) {
      const produto = produtoMap.get(it.produtoId);
      if (!produto || !produto.ativo) {
        throw new Error("Um dos itens do carrinho não está mais disponível");
      }
      const qtd = Math.max(1, Math.min(50, Math.floor(it.qtd)));
      let precoUnit = Number(produto.preco);
      for (const nomeEscolhido of it.customization?.opcoes ?? []) {
        if (precoOpcaoPorNome.has(nomeEscolhido)) {
          precoUnit += precoOpcaoPorNome.get(nomeEscolhido)!;
        }
      }
      subtotal += precoUnit * qtd;
      itensCalculados.push({
        nome: produto.nome,
        qtd,
        preco_unit: precoUnit,
        obs: it.obs,
        ingredientes_removidos: it.customization?.ingredientesRemovidos?.length
          ? it.customization.ingredientesRemovidos
          : undefined,
      });
    }

    const frete = cfg.frete ?? {
      taxa: 0,
      gratis_acima_de: null,
      gratis_habilitado: false,
    };
    const bairros = cfg.bairros ?? [];

    // Pedido é de entrega quando a empresa tem bairros cadastrados (nesse
    // caso o checkout sempre exige endereço) ou quando o cliente informou
    // um endereço mesmo sem bairros cadastrados. Sem nenhum dos dois, é
    // retirada — e o pedido mínimo de entrega não se aplica.
    const ehEntrega = bairros.length > 0 || !!data.endereco?.trim();

    // Se a empresa cadastrou bairros com taxa própria, a entrega é sempre
    // calculada pelo bairro escolhido (não pela taxa fixa). Só cai pra taxa
    // fixa se a empresa não tiver nenhum bairro cadastrado (compatibilidade
    // com quem configurou só a entrega simples).
    let taxaEntregaBase: number;
    if (bairros.length > 0) {
      const bairro = bairros.find((b) => b.id === data.bairroId);
      if (!bairro) {
        throw new Error("Escolha um bairro válido pra calcular a entrega");
      }
      taxaEntregaBase = Number(bairro.fee);
    } else {
      taxaEntregaBase = Number(frete.taxa ?? 0);
    }

    // Pedido mínimo pra entrega (ex: "só entregamos a partir de R$100").
    // Compara com o SUBTOTAL (sem taxa de entrega) e nunca bloqueia
    // retirada — só quem vai receber em casa precisa bater o mínimo.
    const pedidoMinimo = Number(frete.pedido_minimo ?? 0);
    if (ehEntrega && pedidoMinimo > 0 && subtotal < pedidoMinimo) {
      const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      const faltam = pedidoMinimo - subtotal;
      throw new Error(
        `Pedido mínimo para entrega é de ${brl(pedidoMinimo)}. Faltam ${brl(faltam)} pro seu pedido.`,
      );
    }

    const entregaGratis =
      !!frete.gratis_habilitado &&
      frete.gratis_acima_de != null &&
      subtotal >= Number(frete.gratis_acima_de);
    const taxaEntrega = subtotal > 0 && !entregaGratis ? taxaEntregaBase : 0;

    let desconto = 0;
    let cupomAplicado: string | undefined;
    if (data.cupom) {
      const cupons = cfg.cupons ?? [];
      const found = cupons.find(
        (c) => c.code.toUpperCase() === data.cupom!.toUpperCase(),
      );
      if (found) {
        desconto = (subtotal * Number(found.discount)) / 100;
        cupomAplicado = found.code;
      }
    }

    const valorTotal = Math.max(0, subtotal + taxaEntrega - desconto);

    // Troco pedido precisa cobrir o total, senão não faz sentido — mas não
    // trava o pedido por isso, só ignora um valor de troco inválido.
    const trocoParaFinal = trocoPara != null && trocoPara >= valorTotal ? trocoPara : null;

    const numero = `P${Date.now().toString(36).toUpperCase().slice(-6)}`;

    const criado = await this.repository.criar({
      empresa_id: data.empresaId,
      numero,
      cliente_nome: clienteNome,
      cliente_telefone: clienteTelefone,
      endereco: data.endereco ?? null,
      itens: itensCalculados,
      subtotal,
      taxa_entrega: taxaEntrega,
      desconto,
      valor_total: valorTotal,
      cupom: cupomAplicado ?? null,
      forma_pagamento: formaPagamento,
      troco_para: trocoParaFinal,
    });

    return {
      ok: true,
      id: criado.id,
      numero: criado.numero,
      itens: itensCalculados,
      subtotal,
      taxaEntrega,
      desconto,
      valorTotal,
      cupom: cupomAplicado,
      formaPagamento,
      trocoPara: trocoParaFinal,
    };
  }

  async listarPorEmpresa(empresaId: string): Promise<Pedido[]> {
    return this.repository.listarPorEmpresa(empresaId, 200);
  }

  async atualizarStatus(
    pedidoId: string,
    empresaId: string,
    status: PedidoStatus,
  ): Promise<void> {
    await this.repository.atualizarStatus(pedidoId, empresaId, status);
  }
}
