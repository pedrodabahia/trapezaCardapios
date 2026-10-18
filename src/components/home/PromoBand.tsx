import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { PromoCard, type PromoCardData } from "@/components/promocoes/Promocard";
import { calcularDesconto, registrarEvento } from "@/modules/promocoes/utils/promocao-utils";

/* ------------------------------------------------------------------ */
/* FAIXA DE PROMOÇÕES (quebra visual com fundo colorido)               */
/* ------------------------------------------------------------------ */

export type VarianteFaixa = "urgente" | "marca" | "suave";

const ESTILOS: Record<
  VarianteFaixa,
  { fundo: string; sub: string; link: string }
> = {
  // Vermelho/laranja: urgência
  urgente: {
    fundo: "bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white",
    sub: "text-white/85",
    link: "bg-white text-red-700 hover:bg-white/90",
  },
  // Marrom da marca: destaque forte
  marca: {
    fundo: "bg-gradient-to-br from-[#2b1810] via-[#4a2314] to-[#8a3a12] text-white",
    sub: "text-white/75",
    link: "bg-orange-500 text-white hover:bg-orange-600",
  },
  // Creme/laranja claro: pausa leve entre seções
  suave: {
    fundo: "bg-orange-50 text-foreground dark:bg-orange-950/30",
    sub: "text-muted-foreground",
    link: "bg-orange-500 text-white hover:bg-orange-600",
  },
};

interface PromoBandProps {
  id: string;
  titulo: string;
  subtitulo?: string;
  ofertas: PromoCardData[];
  variante?: VarianteFaixa;
  origem: string;
}

export function PromoBand({
  id,
  titulo,
  subtitulo,
  ofertas,
  variante = "suave",
  origem,
}: PromoBandProps) {
  if (ofertas.length === 0) return null;
  const e = ESTILOS[variante];

  return (
    <section
      aria-labelledby={`${id}-titulo`}
      // Só renderiza quando está perto da tela: página mais leve.
      className={`${e.fundo} [contain-intrinsic-size:auto_420px] [content-visibility:auto]`}
    >
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 id={`${id}-titulo`} className="font-display text-xl font-extrabold">
              {titulo}
            </h2>
            {subtitulo && <p className={`mt-0.5 text-sm ${e.sub}`}>{subtitulo}</p>}
          </div>

          <Link
            to="/promocoes"
            onClick={() => registrarEvento("promo_ver_todas_click", { origem })}
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3.5 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${e.link}`}
          >
            Ver tudo
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="carrossel-sem-barra -mx-4 scroll-pl-4 snap-x snap-mandatory overflow-x-auto overscroll-x-contain px-4">
          <div className="flex w-max gap-3 pb-3">
            {ofertas.map((o) => (
              <PromoCard key={o.id} promocao={o} modo="carrossel" origem={origem} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* LOJAS COM OFERTAS (liga as empresas às promoções)                   */
/* ------------------------------------------------------------------ */

interface EmpresaMini {
  id: string;
  slug?: string | null;
  nome: string;
  logo_url?: string | null;
  capa_url?: string | null;
  cidade?: string | null;
  bairro?: string | null;
}

interface PromoMini {
  empresa_slug?: string | null;
  preco_promocional?: number | null;
  preco_anterior?: number | null;
}

export function LojasComOfertas({
  empresas,
  promocoes,
}: {
  empresas: EmpresaMini[];
  promocoes: PromoMini[];
}) {
  const lojas = useMemo(() => {
    const porSlug = new Map<string, { qtd: number; maxPct: number }>();

    for (const p of promocoes) {
      const chave = p.empresa_slug;
      if (!chave) continue;
      const atual = porSlug.get(chave) ?? { qtd: 0, maxPct: 0 };
      atual.qtd += 1;
      atual.maxPct = Math.max(
        atual.maxPct,
        calcularDesconto(p.preco_promocional, p.preco_anterior)?.percentual ?? 0,
      );
      porSlug.set(chave, atual);
    }

    return empresas
      .filter((e) => e.slug && porSlug.has(e.slug))
      .map((e) => ({ empresa: e, ...porSlug.get(e.slug as string)! }))
      .sort((a, b) => b.maxPct - a.maxPct || b.qtd - a.qtd)
      .slice(0, 12);
  }, [empresas, promocoes]);

  if (lojas.length < 2) return null;

  return (
    <section
      aria-labelledby="lojas-ofertas-titulo"
      className="mx-auto max-w-6xl px-4 py-6 [contain-intrinsic-size:auto_300px] [content-visibility:auto]"
    >
      <h2 id="lojas-ofertas-titulo" className="font-display text-lg font-bold">
        🏪 Lojas com ofertas ativas
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">
        Entre na loja e veja tudo que está em promoção.
      </p>

      <div className="carrossel-sem-barra -mx-4 scroll-pl-4 snap-x snap-mandatory overflow-x-auto overscroll-x-contain px-4">
        <div className="flex w-max gap-3 pb-3">
          {lojas.map(({ empresa, qtd, maxPct }) => (
            <Link
              key={empresa.id}
              to="/promocoes/empresa/$slug"
              params={{ slug: empresa.slug as string }}
              onClick={() =>
                registrarEvento("loja_oferta_click", { slug: empresa.slug })
              }
              className="group w-[220px] shrink-0 snap-start overflow-hidden rounded-xl border bg-card transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              <div className="relative h-24 bg-gradient-to-br from-orange-400 to-orange-700">
                {empresa.capa_url && (
                  <img
                    src={empresa.capa_url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
                {maxPct > 0 && (
                  <span className="absolute right-2 top-2 rounded-md bg-red-600 px-2 py-0.5 text-xs font-extrabold text-white">
                    até -{maxPct}%
                  </span>
                )}
              </div>

              <div className="relative px-3 pb-3 pt-8">
                <div className="absolute -top-7 left-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-white text-sm font-extrabold text-orange-700">
                  {empresa.logo_url ? (
                    <img
                      src={empresa.logo_url}
                      alt={`Logo de ${empresa.nome}`}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    empresa.nome.slice(0, 2).toUpperCase()
                  )}
                </div>

                <p className="truncate font-bold">{empresa.nome}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[empresa.bairro, empresa.cidade].filter(Boolean).join(", ") ||
                    "Perto de você"}
                </p>
                <p className="mt-1 text-sm font-semibold text-orange-700 dark:text-orange-400">
                  🔥 {qtd} {qtd === 1 ? "oferta ativa" : "ofertas ativas"}
                </p>
                <span className="mt-2 block rounded-lg bg-orange-500 py-2 text-center text-sm font-bold text-white transition group-hover:bg-orange-600">
                  Ver ofertas
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* SEO: dados estruturados das ofertas (Google entende preço e loja)   */
/* ------------------------------------------------------------------ */

interface OfertaSEO {
  slug: string;
  titulo: string;
  imagem_url?: string | null;
  empresa_nome?: string | null;
  preco_promocional?: number | null;
  fim_em?: string | null;
}

export function PromoJsonLd({ ofertas }: { ofertas: OfertaSEO[] }) {
  const json = useMemo(() => {
    const itens = ofertas
      .filter((o) => o.preco_promocional != null)
      .slice(0, 10)
      .map((o, i) => {
        const url = `https://trapeza.me/promocoes/${o.slug}`;
        const fim = o.fim_em ? new Date(o.fim_em) : null;
        return {
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: o.titulo,
            ...(o.imagem_url ? { image: o.imagem_url } : {}),
            url,
            offers: {
              "@type": "Offer",
              url,
              price: o.preco_promocional,
              priceCurrency: "BRL",
              ...(fim && !Number.isNaN(fim.getTime())
                ? { priceValidUntil: fim.toISOString().slice(0, 10) }
                : {}),
              ...(o.empresa_nome
                ? { seller: { "@type": "Organization", name: o.empresa_nome } }
                : {}),
            },
          },
        };
      });

    if (itens.length === 0) return null;

    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Ofertas e promoções em Posto da Mata",
      itemListElement: itens,
    }).replace(/</g, "\\u003c");
  }, [ofertas]);

  if (!json) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}