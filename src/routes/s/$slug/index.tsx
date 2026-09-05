import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Clock, Truck, Star } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { brl } from "@/lib/format";
import {
  useCategoriasAtivas,
  useDestaques,
  useProdutosPorEmpresa,
  useEmpresaPublica,
  getFrete,
  getBairros,
} from "@/lib/admin-store";
import { useMemo } from "react";

export const Route = createFileRoute("/s/$slug/")({
  component: TenantHome,
});

function TenantHome() {
  const { slug } = Route.useParams();
  const { data: empresaCompleta } = useEmpresaPublica(slug);
  const categorias = useCategoriasAtivas(empresaCompleta);
  const produtos = useProdutosPorEmpresa(empresaCompleta);
  const feats = useDestaques(empresaCompleta);

  const promo = useMemo(() => {
    const tagged = produtos.find((p) => p.tag === "promocao");
    return tagged ?? produtos[0];
  }, [produtos]);

  const maisVendidos = useMemo(
    () => produtos.filter((p) => p.tag === "mais-vendido"),
    [produtos],
  );

const produtosTag = useMemo(
  () => produtos.filter((p) => p.tag != null ), [produtos],
)

  if (!empresaCompleta) return null;
  const { empresa, config } = empresaCompleta;
  const cidade = (config.cidade_entrega as string | undefined) ?? "";
  const whatsapp = empresa.whatsapp;

  // Regra de negócio: nem todo comércio cobra frete por bairro — muitos
  // usam uma taxa fixa pra qualquer endereço. A gente decide qual mensagem
  // mostrar aqui olhando se a empresa tem algum bairro cadastrado (mesmo
  // dado que a aba Entrega do painel usa pra decidir se o checkout pede
  // bairro estruturado ou endereço livre) — não é uma flag manual separada,
  // pra não desincronizar do que já está configurado.
  const bairros = getBairros(config);
  const frete = getFrete(config);
  const temFretePorBairro = bairros.length > 0;
  // Se o frete grátis está habilitado e o valor "a partir de" é zero/nulo,
  // a entrega é sempre grátis (não é um limite, é uma política geral) —
  // nesse caso mostramos "Entrega grátis" direto, sem falar de limite.
  const entregaSempreGratis =
    frete.gratis_habilitado && (frete.gratis_acima_de == null || Number(frete.gratis_acima_de) <= 0);
  const pedidoMinimo = Number(frete.pedido_minimo ?? 0);
  const freteCard = entregaSempreGratis
    ? { titulo: "Entrega grátis", subtitulo: "Sem taxa de entrega" }
    : temFretePorBairro
      ? {
          titulo: "Frete por bairro",
          subtitulo:
            frete.gratis_habilitado && frete.gratis_acima_de
              ? `Grátis em pedidos +${brl(frete.gratis_acima_de)}`
              : "Valor calculado no checkout",
        }
      : {
          titulo: `Entrega por ${brl(frete.taxa)}`,
          subtitulo:
            frete.gratis_habilitado && frete.gratis_acima_de
              ? `Grátis acima de ${brl(frete.gratis_acima_de)}`
              : "Taxa fixa pra toda a cidade",
        };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      {/* Search */}
      <Link
        to="/s/$slug/search"
        params={{ slug }}
        className="flex h-12 items-center gap-3 rounded-full border border-brand-yellow/40 bg-white px-5 text-muted-foreground card-shadow"
      >
        <Search className="h-5 w-5 text-brand-red" />
        <span className="text-sm">Buscar por nome, ingrediente ou categoria...</span>
      </Link>

      {/* Hero banner */}
      {promo && (
        <section className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="hero-gradient relative overflow-hidden rounded-3xl p-6 text-white md:p-10">
            <div className="relative z-10 max-w-md">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-yellow px-3 py-1 text-xs font-bold text-brand-brown">
                🔥 Promoção do dia
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl">
                {promo.nome}
                {promo.preco_antigo ? (
                  <>
                    <br />
                    com {Math.round((1 - promo.preco / promo.preco_antigo) * 100)}% OFF
                  </>
                ) : null}
              </h1>
              <p className="mt-3 text-sm text-black/85 md:text-base">
                {promo.descricao_curta} Só hoje!
              </p>

              <div className="mt-5 flex items-center gap-3">
                <Link
                  to="/s/$slug/product/$id"
                  params={{ slug, id: promo.id }}
                  className="rounded-full bg-brand-yellow px-6 py-3 font-display font-bold text-brand-brown shadow-lg transition hover:scale-105"
                >
                  Pedir agora — {brl(promo.preco)}
                </Link>
                <Link
                  to="/s/$slug/promotions"
                  params={{ slug }}
                  className="text-sm font-semibold text-white/90 underline underline-offset-4"
                >
                  Ver todas
                </Link>
              </div>
            </div>
            {promo.imagem_url && (
              <img
                src={promo.imagem_url}
                alt={promo.nome}
                className="pointer-events-none absolute -right-8 -bottom-8 h-64 w-64 rounded-full object-cover opacity-95 shadow-2xl md:h-80 md:w-80"
              />
            )}
          </div>

          {/* Side info cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="flex items-center gap-4 rounded-3xl bg-card p-5 card-shadow">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-yellow/30 text-brand-red">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <div className="font-display font-bold">25-40 min</div>
                <div className="text-xs text-muted-foreground">
                  Entrega rápida na sua casa
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-3xl bg-brand-red p-5 text-white shadow-lg">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-white">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <div className="font-display font-bold">{freteCard.titulo}</div>
                {pedidoMinimo > 0 && (
                  <div className="mt-1 text-xs font-bold text-white">
                    Pedido mínimo: {brl(pedidoMinimo)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-3xl bg-card p-5 card-shadow sm:col-span-2 lg:col-span-1">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-brown/10 text-brand-brown">
                <Star className="h-6 w-6 fill-current" />
              </div>
              <div>
                <div className="font-display font-bold">4.9 · +2.3k avaliações</div>
                <div className="text-xs text-muted-foreground">
                  O melhor da cidade
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categorias.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold">Categorias</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-6 md:overflow-visible">
            {categorias.map((c) => (
              <Link
                key={c.id}
                to="/s/$slug/category/$catSlug"
                params={{ slug, catSlug: c.slug }}
                className="group flex min-w-[110px] shrink-0 flex-col items-center gap-2 rounded-3xl bg-card p-4 card-shadow transition hover:-translate-y-1"
              >
                <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-brand-cream text-3xl">
                  {c.imagem_url ? (
                    <img
                      src={c.imagem_url}
                      alt={c.nome}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{c.emoji}</span>
                  )}
                </div>
                <span className="text-sm font-semibold text-brand-brown">
                  {c.nome}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {feats.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold">Destaques</h2>
            <Link
              to="/s/$slug/category/$catSlug"
              params={{ slug, catSlug: categorias[0]?.slug ?? "" }}
              className="text-sm font-semibold text-brand-red"
            >
              Ver tudo →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {feats.map((p) => (
              <ProductCard key={p.id} produto={p} slug={slug} />
            ))}
          </div>
        </section>
      )}

      {/* Mais vendidos */}
      {maisVendidos.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold">Mais vendidos</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {maisVendidos.map((p) => (
              <ProductCard key={p.id} produto={p} layout="row" slug={slug} />
            ))}
          </div>
        </section>
      )}

            {/* Produto Por Categoria*/}
      {categorias.length > 0 && (
        categorias.map((c) => {
          const produtosDaCategoria = produtos.filter((p) => p.categoria_id === c.id);
          if(produtosDaCategoria.length === 0) return null;

          return(
        <section key={c.id} className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold">{c.nome}</h2>
          </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {produtosDaCategoria.map((p) => (
            <ProductCard key={p.id} produto={p} slug={slug} />
          ))}
        </div>
        </section>
          )

})
      )}


      {/* Location teaser */}
      {empresa.endereco && (
        <section className="mt-10 overflow-hidden rounded-3xl bg-brand-brown text-white">
          <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
            <div>
              <span className="inline-block rounded-full bg-brand-yellow px-3 py-1 text-xs font-bold text-brand-brown">
                Visite a loja
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold">
                Passa lá pra provar
              </h2>
              <p className="mt-2 text-white/80">
                {empresa.endereco} {cidade ? `· ${cidade}` : ""}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/s/$slug/location"
                  params={{ slug }}
                  className="rounded-full bg-brand-red px-5 py-2.5 font-semibold"
                >
                  Como chegar
                </Link>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener"
                  className="rounded-full bg-white px-5 py-2.5 font-semibold text-brand-brown"
                >
                  WhatsApp
                </a>
              </div>
            </div>
            <Link
              to="/s/$slug/location"
              params={{ slug }}
              className="relative block min-h-40 overflow-hidden rounded-2xl"
            >
              <iframe
                title="Mapa"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  empresa.endereco,
                )}&output=embed`}
                className="pointer-events-none h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}