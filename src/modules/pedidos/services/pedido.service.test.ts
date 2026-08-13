import { describe, it, expect, vi } from "vitest";
import { PedidoService } from "./pedido.service";
import type { PedidoRepository } from "../repositories/pedido.repository";
import type { PedidoPricingRepository } from "../repositories/pedido-pricing.repository";
import type {
  ProdutoParaPrecificacao,
  OpcaoParaPrecificacao,
  EmpresaConfigParaPrecificacao,
} from "../types/pedido.types";

// ============================================================================
// Fakes — implementam as mesmas interfaces que o Supabase real implementa,
// mas devolvem dado fixo na memória. Isso testa a REGRA DE NEGÓCIO do
// service sem precisar de banco de verdade nem internet.
// ============================================================================

function fakePedidoRepository(): PedidoRepository {
  return {
    criar: vi.fn().mockResolvedValue({ id: "pedido-1", numero: "P000001" }),
    listarPorEmpresa: vi.fn().mockResolvedValue([]),
    atualizarStatus: vi.fn().mockResolvedValue(undefined),
    contarDesde: vi.fn().mockResolvedValue(0),
  };
}

// Monta um pricing repository fake, com defaults que dão pra sobrescrever
// por teste (ex: mudar o status da empresa, os produtos disponíveis, etc).
function fakePricingRepository(overrides: {
  status?: "ativo" | "atrasado" | "suspenso" | null;
  produtos?: ProdutoParaPrecificacao[];
  opcoes?: OpcaoParaPrecificacao[];
  config?: EmpresaConfigParaPrecificacao;
} = {}): PedidoPricingRepository {
  return {
    buscarStatusEmpresa: vi.fn().mockResolvedValue(overrides.status ?? "ativo"),
    buscarProdutosPorIds: vi.fn().mockResolvedValue(
      overrides.produtos ?? [{ id: "produto-1", nome: "X-Salada", preco: 20, ativo: true }],
    ),
    buscarOpcoesPorNome: vi.fn().mockResolvedValue(overrides.opcoes ?? []),
    buscarConfigEmpresa: vi.fn().mockResolvedValue(overrides.config ?? {}),
  };
}

function montarService(opts: Parameters<typeof fakePricingRepository>[0] = {}) {
  const pedidoRepository = fakePedidoRepository();
  const pricing = fakePricingRepository(opts);
  const service = new PedidoService(pedidoRepository, pricing);
  return { service, pedidoRepository, pricing };
}

const inputBase = {
  empresaId: "empresa-1",
  clienteNome: "Fulano",
  clienteTelefone: "77999999999",
  itens: [{ produtoId: "produto-1", qtd: 1 }],
};

// ============================================================================
// Testes
// ============================================================================

describe("PedidoService.criar", () => {
  it("calcula o subtotal certo pra múltiplos itens e quantidades", async () => {
    const { service } = montarService({
      produtos: [
        { id: "p1", nome: "X-Salada", preco: 20, ativo: true },
        { id: "p2", nome: "Refri", preco: 6, ativo: true },
      ],
    });

    const res = await service.criar({
      ...inputBase,
      itens: [
        { produtoId: "p1", qtd: 2 }, // 40
        { produtoId: "p2", qtd: 3 }, // 18
      ],
    });

    expect(res.subtotal).toBe(58);
  });

  it("soma o preço das opções (adicionais) escolhidas no preço do item", async () => {
    const { service } = montarService({
      produtos: [{ id: "p1", nome: "X-Salada", preco: 20, ativo: true }],
      opcoes: [{ nome: "Bacon", preco_adicional: 5 }, { nome: "Cheddar", preco_adicional: 3 }],
    });

    const res = await service.criar({
      ...inputBase,
      itens: [{ produtoId: "p1", qtd: 1, customization: { opcoes: ["Bacon", "Cheddar"] } }],
    });

    // 20 (base) + 5 (bacon) + 3 (cheddar) = 28
    expect(res.itens[0].preco_unit).toBe(28);
    expect(res.subtotal).toBe(28);
  });

  it("recusa pedido se a empresa estiver suspensa", async () => {
    const { service } = montarService({ status: "suspenso" });
    await expect(service.criar(inputBase)).rejects.toThrow(/indisponível/i);
  });

  it("recusa pedido se algum produto do carrinho não existe mais / está inativo", async () => {
    const { service } = montarService({
      produtos: [{ id: "produto-1", nome: "X-Salada", preco: 20, ativo: false }],
    });
    await expect(service.criar(inputBase)).rejects.toThrow(/não está mais disponível/i);
  });

  it("recusa carrinho vazio", async () => {
    const { service } = montarService();
    await expect(service.criar({ ...inputBase, itens: [] })).rejects.toThrow(/carrinho vazio/i);
  });

  it("recusa sem nome ou telefone", async () => {
    const { service } = montarService();
    await expect(
      service.criar({ ...inputBase, clienteNome: "  " }),
    ).rejects.toThrow(/nome e telefone/i);
  });

  it("limita a quantidade entre 1 e 50 (não deixa pedir 0 nem 9999)", async () => {
    const { service } = montarService();

    const zerado = await service.criar({ ...inputBase, itens: [{ produtoId: "produto-1", qtd: 0 }] });
    expect(zerado.itens[0].qtd).toBe(1);

    const exagerado = await service.criar({
      ...inputBase,
      itens: [{ produtoId: "produto-1", qtd: 9999 }],
    });
    expect(exagerado.itens[0].qtd).toBe(50);
  });

  it("cobra taxa de entrega normal quando o subtotal não passa do frete grátis", async () => {
    const { service } = montarService({
      config: { frete: { taxa: 7, gratis_acima_de: 100, gratis_habilitado: true } },
    });
    const res = await service.criar(inputBase); // subtotal = 20
    expect(res.taxaEntrega).toBe(7);
  });

  it("zera a taxa de entrega quando o subtotal passa do valor de frete grátis", async () => {
    const { service } = montarService({
      produtos: [{ id: "produto-1", nome: "X-Salada", preco: 150, ativo: true }],
      config: { frete: { taxa: 7, gratis_acima_de: 100, gratis_habilitado: true } },
    });
    const res = await service.criar(inputBase); // subtotal = 150
    expect(res.taxaEntrega).toBe(0);
  });

  it("aplica cupom válido (case-insensitive) e ignora cupom inválido", async () => {
    const { service } = montarService({
      config: { cupons: [{ code: "PROMO10", discount: 10, desc: "10% off" }] },
    });

    const comCupom = await service.criar({ ...inputBase, cupom: "promo10" });
    expect(comCupom.desconto).toBe(2); // 10% de 20
    expect(comCupom.cupom).toBe("PROMO10");

    const cupomErrado = await service.criar({ ...inputBase, cupom: "NAOEXISTE" });
    expect(cupomErrado.desconto).toBe(0);
    expect(cupomErrado.cupom).toBeUndefined();
  });

  it("leva os ingredientes removidos pro item calculado (sem afetar o preço)", async () => {
    const { service } = montarService();
    const res = await service.criar({
      ...inputBase,
      itens: [
        {
          produtoId: "produto-1",
          qtd: 1,
          customization: { ingredientesRemovidos: ["cebola", "tomate"] },
        },
      ],
    });
    expect(res.itens[0].ingredientes_removidos).toEqual(["cebola", "tomate"]);
    expect(res.itens[0].preco_unit).toBe(20); // não muda o preço
  });

  it("chama o repository.criar com os valores finais calculados", async () => {
    const { service, pedidoRepository } = montarService();
    await service.criar(inputBase);
    expect(pedidoRepository.criar).toHaveBeenCalledWith(
      expect.objectContaining({ empresa_id: "empresa-1", subtotal: 20 }),
    );
  });
});
