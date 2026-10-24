import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { getEmpresaBySlug } from "@/modules/empresas/controllers/empresa.controller";
import { useMemo, useState } from "react";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { brl } from "@/lib/format";
import { getCartStore } from "@/lib/store";
import type { CartCustomization, CartCustomizationSelecao, CartItem } from "@/lib/store";
import {
  useProdutoById,
  useOpcoes,
  useCategoriasOpcao,
  useIngredientesDoProduto,
  getFrete,
} from "@/lib/admin-store";
import { cn } from "@/lib/utils";

const SITE_URL = "https://trapeza.me";

export const Route = createFileRoute("/s/$slug/product/$id")({
  loader: async ({ params }) => ({
    empresaPublica: await getEmpresaBySlug({ data: { slug: params.slug } }),
  }),
  head: ({ params, loaderData }) => {
    const dados = loaderData?.empresaPublica;
    const empresa = dados?.empresa;
    const produto = dados?.produtos.find((item) => item.id === params.id && item.ativo);
    const url = `${SITE_URL}/s/${encodeURIComponent(params.slug)}/product/${encodeURIComponent(params.id)}`;

    if (!empresa || empresa.status_pagamento !== "ativo" || !produto) {
      return {
        meta: [
          { title: "Produto não encontrado | Trapeza" },
          { name: "robots", content: "noindex, follow" },
        ],
      };
    }

    const titulo = `${produto.nome} | ${empresa.nome} | Trapeza`;
    const descricaoBase = produto.descricao?.trim() || produto.descricao_curta?.trim() || `${produto.nome} no cardápio de ${empresa.nome}${empresa.cidade ? ` em ${empresa.cidade}` : ""}. Consulte o preço e as opções disponíveis.`;
    const descricao = descricaoBase.replace(/\s+/g, " ").slice(0, 160);
    const imagem = produto.imagem_url || empresa.logo_url || undefined;
    const dadosEstruturados = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: produto.nome,
      description: descricao,
      url,
      ...(imagem ? { image: imagem } : {}),
      offers: {
        "@type": "Offer",
        price: String(produto.preco),
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
        url,
        seller: { "@type": "Organization", name: empresa.nome },
      },
    };

    return {
      meta: [
        { title: titulo },
        { name: "description", content: descricao },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { property: "og:type", content: "product" },
        { property: "og:site_name", content: "Trapeza" },
        { property: "og:title", content: titulo },
        { property: "og:description", content: descricao },
        { property: "og:url", content: url },
        ...(imagem ? [{ property: "og:image", content: imagem }] : []),
        { name: "twitter:card", content: imagem ? "summary_large_image" : "summary" },
        { name: "twitter:title", content: titulo },
        { name: "twitter:description", content: descricao },
        ...(imagem ? [{ name: "twitter:image", content: imagem }] : []),
        { "script:ld+json": dadosEstruturados },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ProdutoDetalhe,
});

function ProdutoDetalhe() {
  const { slug, id } = Route.useParams();
  const navigate = useNavigate();
  const router = useRouter();
  const { empresaPublica: empresaCompleta } = Route.useLoaderData();
  const produto = useProdutoById(empresaCompleta, id);
  const opcoes = useOpcoes(empresaCompleta);
  const categoriasOpcao = useCategoriasOpcao(empresaCompleta);
  const ingredientesProdutoRaw = useIngredientesDoProduto(empresaCompleta, produto?.id);

  const categoria = empresaCompleta?.categorias.find(
    (c) => c.id === produto?.categoria_id,
  );
  const idsAtivos = categoria?.categorias_opcao_ids ?? [];

  const [qtd, setQtd] = useState(1);
  // seleções por categoria de adicional: categoriaOpcaoId -> nomes escolhidos
  const [selecoes, setSelecoes] = useState<Record<string, string[]>>({});
  const [remover, setRemover] = useState<string[]>([]);
  const [obs, setObs] = useState("");

  // Categorias de adicional que essa categoria de produto usa, na ordem
  // cadastrada pela empresa (não são mais fixas — cada empresa cria as suas).
  const categoriasDoProduto = useMemo(
    () =>
      categoriasOpcao
        .filter((co) => idsAtivos.includes(co.id))
        .filter((co) => opcoes.some((o) => o.categoria_opcao_id === co.id))
        .sort((a, b) => a.ordem - b.ordem),
    [categoriasOpcao, idsAtivos, opcoes],
  );

  // Volta para a página anterior do usuário. Se não houver histórico
  // (ex.: abriu o link direto numa nova aba), vai para a home.
  // Esta página nunca leva o usuário para /s/$slug.
  function voltar() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      void navigate({ to: "/" });
    }
  }

  if (!empresaCompleta) return null;
  if (!produto) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg font-semibold">Produto não encontrado.</p>
        <Link
          to="/"
          className="mt-4 inline-block text-brand-red underline"
        >
          Voltar para o início
        </Link>
      </div>
    );
  }

  const ingredientesProduto = ingredientesProdutoRaw.slice().sort((a, b) => a.ordem - b.ordem);

  function toggleRemover(nome: string) {
    setRemover((r) => (r.includes(nome) ? r.filter((x) => x !== nome) : [...r, nome]));
  }

  function toggleValor(categoriaOpcaoId: string, nome: string, selecao: "unica" | "multipla") {
    setSelecoes((s) => {
      const atuais = s[categoriaOpcaoId] ?? [];
      if (selecao === "unica") {
        return { ...s, [categoriaOpcaoId]: [nome] };
      }
      const jaSelecionado = atuais.includes(nome);
      return {
        ...s,
        [categoriaOpcaoId]: jaSelecionado
          ? atuais.filter((x) => x !== nome)
          : [...atuais, nome],
      };
    });
  }

  const adicionaisSelecionados = () => {
    const lista: { name: string; price: number }[] = [];
    for (const co of categoriasDoProduto) {
      const nomes = selecoes[co.id] ?? [];
      for (const nome of nomes) {
        const opt = opcoes.find(
          (o) => o.categoria_opcao_id === co.id && o.nome === nome,
        );
        if (opt && opt.preco_adicional > 0) {
          lista.push({ name: opt.nome, price: opt.preco_adicional });
        }
      }
    }
    return lista;
  };

  const precoUnitario =
    produto.preco + adicionaisSelecionados().reduce((s, a) => s + a.price, 0);
  const totalCompra = precoUnitario * qtd;

  // Valor mínimo pra fechar pedido, configurado no painel (aba Entrega).
  const frete = getFrete(empresaCompleta.config);
  const pedidoMinimo = Number(frete.pedido_minimo ?? 0);
  const atingiuMinimo = totalCompra >= pedidoMinimo;

  // Compra direta: leva este produto para o checkout.
  function handleComprar() {
    if (!atingiuMinimo) return;

    const selecoesCarrinho: CartCustomizationSelecao[] = categoriasDoProduto
      .map((co) => ({
        categoriaOpcaoId: co.id,
        categoriaNome: co.nome,
        valores: selecoes[co.id] ?? [],
      }))
      .filter((s) => s.valores.length > 0);

    const customization: CartCustomization = {
      selecoes: selecoesCarrinho,
      remover,
      adicionais: adicionaisSelecionados(),
      observacoes: obs.trim() || undefined,
    };
    const item: CartItem = {
      id: `${produto!.id}-${Date.now()}`,
      productId: produto!.id,
      name: produto!.nome,
      image: produto!.imagem_url ?? "",
      basePrice: produto!.preco,
      quantity: qtd,
      customization,
    };

    const store = getCartStore(slug).getState();
    store.addItem(item);
    store.closeDrawer();
    toast.success("Produto selecionado!", { duration: 1000 });
    navigate({ to: "/s/$slug/checkout", params: { slug } });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-4 md:px-8">
      <button
        type="button"
        onClick={voltar}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-brown"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <div className="overflow-hidden rounded-3xl bg-muted">
        <div className="aspect-[4/3] w-full">
          {produto.imagem_url && (
            <img
              src={produto.imagem_url}
              alt={produto.nome}
              className="h-full w-full object-cover"
            />
          )}
        </div>
      </div>

      <div className="mt-5">
        <h1 className="font-display text-2xl font-bold">{produto.nome}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{produto.descricao}</p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-brand-red">
            {produto.preco > 0 ? brl(produto.preco) : "Consultar valor"}
          </span>
          {produto.preco_antigo && (
            <span className="text-sm text-muted-foreground line-through">
              {brl(produto.preco_antigo)}
            </span>
          )}
        </div>
        {ingredientesProduto.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Ingredientes: {ingredientesProduto.map((i) => i.nome).join(", ")}
          </p>
        )}
      </div>

      {categoriasDoProduto.map((co) => {
        const items = opcoes.filter((o) => o.categoria_opcao_id === co.id);
        const selecionados = selecoes[co.id] ?? [];
        return (
          <section key={co.id} className="mt-6">
            <h2 className="font-display text-base font-semibold">
              {co.nome}
              {co.selecao === "multipla" && (
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  (pode escolher mais de um)
                </span>
              )}
              {co.obrigatorio && (
                <span className="ml-1 text-xs font-normal text-brand-red">*</span>
              )}
            </h2>
            <div className="mt-2 flex flex-wrap bg-brand-red p-3 py-4 rounded-md gap-2">
              {items.map((o) => {
                const selected = selecionados.includes(o.nome);
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => toggleValor(co.id, o.nome, co.selecao)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition",
                      selected
                        ? "border-white bg-brand-red text-white"
                        : "border-border bg-card hover:bg-muted",
                    )}
                  >
                    {o.nome}
                    {o.preco_adicional > 0 && ` (+${brl(o.preco_adicional)})`}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {ingredientesProduto.some((i) => i.removivel) && (
        <section className="mt-6">
          <h2 className="font-display text-base font-semibold">
            Remover algum ingrediente?
          </h2>
          <div className="mt-2 flex flex-wrap bg-brand-yellow p-3 py-4 rounded-md  gap-2">
            {ingredientesProduto
              .filter((i) => i.removivel)
              .map((i) => {
                const marcado = remover.includes(i.nome);
                return (
                  <button
                    key={i.nome}
                    type="button"
                    onClick={() => toggleRemover(i.nome)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition",
                      marcado
                        ? "border-brand-red bg-brand-red/10 text-brand-red line-through"
                        : "border-border bg-card hover:bg-muted",
                    )}
                  >
                    {marcado ? `Sem ${i.nome}` : i.nome}
                  </button>
                );
              })}
          </div>
        </section>
      )}

      <section className="mt-6">
        <Label htmlFor="obs">Alguma observação?</Label>
        <Textarea
          id="obs"
          placeholder="Ex: Digite aqui sua observação ..."
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          className="mt-1"
        />
      </section>

      {/* Barra fixa inferior: quantidade + compra direta */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card p-4 shadow-2xl">
        <div className="mx-auto max-w-3xl">
          {!atingiuMinimo && (
            <p className="mb-2 text-center text-xs text-muted-foreground">
              Pedido mínimo de {brl(pedidoMinimo)}. Aumente a quantidade para continuar.
            </p>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border bg-background p-1">
              <button
                type="button"
                aria-label="Diminuir quantidade"
                onClick={() => setQtd((q) => Math.max(1, q - 1))}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-semibold">{qtd}</span>
              <button
                type="button"
                aria-label="Aumentar quantidade"
                onClick={() => setQtd((q) => q + 1)}
                className="grid h-9 w-9 place-items-center rounded-full bg-brand-red text-white hover:bg-brand-red/90"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              type="button"
              onClick={handleComprar}
              disabled={!atingiuMinimo}
              className="h-12 flex-1 rounded-full bg-brand-red text-base font-bold hover:bg-brand-red/90 disabled:bg-gray-500/30"
            >
              Comprar · {totalCompra > 0 ? brl(totalCompra) : ""}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}