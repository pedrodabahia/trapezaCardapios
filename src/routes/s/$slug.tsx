import {
  createFileRoute,
  Outlet,
  Link,
  useMatchRoute,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getEmpresaBySlug } from "@/modules/empresas/controllers/empresa.controller";
import { AppShell } from "@/components/layout/AppShell";
import { LogoLoader } from "@/components/LogoLoader";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

const SITE_URL = "https://trapeza.me";

function formatarNomeSlug(slug: string) {
  return decodeURIComponent(slug)
    .split("-")
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
}

export const Route = createFileRoute("/s/$slug")({
  loader: async ({ params }) => ({
    empresaPublica: await getEmpresaBySlug({ data: { slug: params.slug } }),
  }),
  head: ({ params, loaderData }) => {
    const dados = loaderData?.empresaPublica;
    const empresa = dados?.empresa;
    const nomeEmpresa = empresa?.nome?.trim() || formatarNomeSlug(params.slug);
    const cidade = empresa?.cidade?.trim();
    const titulo = `${nomeEmpresa}${cidade ? ` em ${cidade}` : ""} | Cardápio e ofertas | Trapeza`;
    const descricaoBase = empresa?.descricao?.trim()
      ? `${empresa.descricao.trim()}${cidade ? ` — ${cidade}` : ""}`
      : `Confira o cardápio, produtos e informações de ${nomeEmpresa}${cidade ? ` em ${cidade}` : ""}. Veja as opções e entre em contato com a empresa pelo Trapeza.`;
    const descricao = descricaoBase.replace(/\s+/g, " ").slice(0, 160);
    const url = `${SITE_URL}/s/${encodeURIComponent(params.slug)}`;
    const imagem = empresa?.capa_url || empresa?.logo_url;

    if (!empresa || empresa.status_pagamento !== "ativo") {
      return {
        meta: [
          { title: "Cardápio indisponível | Trapeza" },
          { name: "robots", content: "noindex, follow" },
        ],
      };
    }

    const dadosEstruturados = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: nomeEmpresa,
      url,
      ...(descricao ? { description: descricao } : {}),
      ...(imagem ? { image: imagem } : {}),
      ...(cidade ? {
        address: {
          "@type": "PostalAddress",
          addressLocality: cidade,
          addressCountry: "BR",
        },
      } : {}),
    };

    return {
      meta: [
        { title: titulo },
        { name: "description", content: descricao },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Trapeza" },
        { property: "og:locale", content: "pt_BR" },
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
  component: TenantLayout,
});

function TenantLayout() {
  const { slug } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const matchRoute = useMatchRoute();
  const { data, isLoading, error } = useQuery({
    queryKey: ["empresa-publica", slug] as const,
    queryFn: () => getEmpresaBySlug({ data: { slug } }),
    initialData: loaderData.empresaPublica,
    staleTime: 30_000,
    enabled: Boolean(slug),
  });

  // Na página de produto não mostramos o AppShell (cabeçalho, botão de
  // cardápio, carrinho etc.), pois ela é uma página única de compra direta.
  const ehPaginaDeProduto = Boolean(
    matchRoute({ to: "/s/$slug/product/$id" }),
  );

  useEffect(() => {
    if (!data?.empresa.id) return;

    void trackEvent("company_view", {
      empresaId: data.empresa.id,
      path: window.location.pathname,
    });
  }, [data?.empresa.id]);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-cream">
        <LogoLoader size={120} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <div className="text-7xl" aria-hidden="true">
            🍽️
          </div>

          <h1 className="mt-4 font-display text-2xl font-bold">
            Cardápio indisponível
          </h1>

          <p className="mt-2 text-muted-foreground">
            Esse link não corresponde a uma empresa disponível no Trapeza.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-red px-6 py-3 font-semibold text-white"
          >
            Ver outras empresas
          </Link>
        </div>
      </div>
    );
  }

  if (ehPaginaDeProduto) {
    return <Outlet />;
  }

  return (
    <AppShell empresaCompleta={data} slug={slug}>
      <Outlet />
    </AppShell>
  );
}