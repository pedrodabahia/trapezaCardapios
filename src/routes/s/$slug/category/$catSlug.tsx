import { createFileRoute, Link } from "@tanstack/react-router";
import { getEmpresaBySlug } from "@/modules/empresas/controllers/empresa.controller";
import { ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import {
  useProdutosPorEmpresa,
  useCategoriaBySlug,
} from "@/lib/admin-store";

const SITE_URL = "https://trapeza.me";

export const Route = createFileRoute("/s/$slug/category/$catSlug")({
  loader: async ({ params }) => ({
    empresaPublica: await getEmpresaBySlug({ data: { slug: params.slug } }),
  }),
  head: ({ params, loaderData }) => {
    const dados = loaderData?.empresaPublica;
    const empresa = dados?.empresa;
    const categoria = dados?.categorias.find((item) => item.slug === params.catSlug && item.ativo);
    const url = `${SITE_URL}/s/${encodeURIComponent(params.slug)}/category/${encodeURIComponent(params.catSlug)}`;

    if (!empresa || empresa.status_pagamento !== "ativo" || !categoria) {
      return {
        meta: [
          { title: "Categoria não encontrada | Trapeza" },
          { name: "robots", content: "noindex, follow" },
        ],
      };
    }

    const titulo = `${categoria.nome} | Cardápio de ${empresa.nome} | Trapeza`;
    const descricao = `Confira ${categoria.nome.toLowerCase()} no cardápio de ${empresa.nome}${empresa.cidade ? ` em ${empresa.cidade}` : ""}. Veja os produtos e preços disponíveis no Trapeza.`.slice(0, 160);
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
  component: CategoriaPagina,
});

function CategoriaPagina() {
  const { slug, catSlug } = Route.useParams();
  const { empresaPublica: empresaCompleta } = Route.useLoaderData();
  const categoria = useCategoriaBySlug(empresaCompleta, catSlug);
  const produtos = useProdutosPorEmpresa(empresaCompleta, catSlug);

  if (!empresaCompleta) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <Link
        to="/s/$slug"
        params={{ slug }}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-brown"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="font-display text-2xl font-bold">
        {categoria ? `${categoria.emoji ?? ""} ${categoria.nome}` : "Categoria"}
      </h1>

      {produtos.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Nenhum produto nessa categoria ainda.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {produtos.map((p) => (
            <ProductCard key={p.id} produto={p} slug={slug} />
          ))}
        </div>
      )}
    </div>
  );
}
