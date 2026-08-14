import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
  useEmpresaPublica,
  useProdutoById,
  useOpcoes,
  useCategoriasOpcao,
  useIngredientesDoProduto,
} from "@/lib/admin-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/s/$slug/product/$id")({
  component: ProdutoDetalhe,
});

function ProdutoDetalhe() {
  const { slug, id } = Route.useParams();
  const navigate = useNavigate();
  const { data: empresaCompleta } = useEmpresaPublica(slug);
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

  if (!empresaCompleta) return null;
  if (!produto) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg font-semibold">Produto não encontrado.</p>
        <Link
          to="/s/$slug"
          params={{ slug }}
          className="mt-4 inline-block text-brand-red underline"
        >
          Voltar pro cardápio
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

  function handleAdd() {
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
    getCartStore(slug).getState().addItem(item);
    toast.success("Adicionado ao carrinho!",{
      duration:1000,
    });
    navigate({ to: "/s/$slug", params: { slug } });
  }

  const precoUnitario =
    produto.preco + adicionaisSelecionados().reduce((s, a) => s + a.price, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-4 md:px-8">
      <Link
        to="/s/$slug"
        params={{ slug }}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-brown"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

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
            {brl(produto.preco)}
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
          <div className="mt-2 flex flex-wrap bg-brand-yellow gap-2">
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
          placeholder="Ex: sem cebola, ponto da carne, etc."
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          className="mt-1"
        />
      </section>

      {/* Barra fixa inferior */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card p-4 shadow-2xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border bg-background p-1">
            <button
              onClick={() => setQtd((q) => Math.max(1, q - 1))}
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-semibold">{qtd}</span>
            <button
              onClick={() => setQtd((q) => q + 1)}
              className="grid h-9 w-9 place-items-center rounded-full bg-brand-red text-white hover:bg-brand-red/90"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <Button
            onClick={handleAdd}
            className="h-12 flex-1 rounded-full bg-brand-red text-base font-bold hover:bg-brand-red/90"
          >
            Adicionar · {brl(precoUnitario * qtd)}
          </Button>
        </div>
      </div>
    </div>
  );
}
