import { createFileRoute } from "@tanstack/react-router";
import { getEmpresaBySlug } from "@/modules/empresas/controllers/empresa.controller";
import { ProductCard } from "@/components/ProductCard";
import { useProdutosPorEmpresa } from "@/lib/admin-store";

const SITE_URL = "https://trapeza.me";

export const Route = createFileRoute("/s/$slug/promotions")({
  loader: async ({ params }) => ({
    empresaPublica: await getEmpresaBySlug({ data: { slug: params.slug } }),
  }),
  head: ({ params, loaderData }) => {
    const dados = loaderData?.empresaPublica;
    const empresa = dados?.empresa;
    const url = `${SITE_URL}/s/${encodeURIComponent(params.slug)}/promotions`;

    if (!empresa || empresa.status_pagamento !== "ativo") {
      return {
        meta: [
          { title: "Promoções indisponíveis | Trapeza" },
          { name: "robots", content: "noindex, follow" },
        ],
      };
    }

    const titulo = `Promoções de ${empresa.nome}${empresa.cidade ? ` em ${empresa.cidade}` : ""} | Trapeza`;
    const descricao = `Confira produtos em promoção no cardápio de ${empresa.nome}${empresa.cidade ? ` em ${empresa.cidade}` : ""}. Veja preços e opções disponíveis.`.slice(0, 160);
    return {
      meta: [
        { title: titulo },
        { name: "description", content: descricao },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Trapeza" },
        { property: "og:title", content: titulo },
        { property: "og:description", content: descricao },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: PromocoesPagina,
});

function PromocoesPagina() {
  const { slug } = Route.useParams();
  const { empresaPublica: empresaCompleta } = Route.useLoaderData();
  const produtos = useProdutosPorEmpresa(empresaCompleta);
  const promos = produtos.filter((p) => p.tag === "promocao");

  if (!empresaCompleta) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="font-display text-2xl font-bold">🔥 Promoções</h1>
      {promos.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Nenhuma promoção ativa no momento.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {promos.map((p) => (
            <ProductCard key={p.id} produto={p} slug={slug} />
          ))}
        </div>
      )}
    </div>
  );
}
