
import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { useEmpresaPublica } from "@/lib/admin-store";
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
  head: ({ params }) => {
    const nomeEmpresa = formatarNomeSlug(params.slug);
    const titulo = `${nomeEmpresa} | Cardápio e informações | Trapeza`;
    const descricao = `Confira o cardápio, produtos e informações de ${nomeEmpresa} no Trapeza. Encontre opções e entre em contato com a empresa.`;
    const url = `${SITE_URL}/s/${encodeURIComponent(params.slug)}`;

    return {
      meta: [
        { title: titulo },
        {
          name: "description",
          content: descricao.slice(0, 160),
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:site_name",
          content: "Trapeza",
        },
        {
          property: "og:title",
          content: titulo,
        },
        {
          property: "og:description",
          content: descricao,
        },
        {
          property: "og:url",
          content: url,
        },
        {
          name: "twitter:card",
          content: "summary",
        },
        {
          name: "twitter:title",
          content: titulo,
        },
        {
          name: "twitter:description",
          content: descricao,
        },
      ],
      links: [
        {
          rel: "canonical",
          href: url,
        },
      ],
    };
  },
  component: TenantLayout,
});

function TenantLayout() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = useEmpresaPublica(slug);

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

  return (
    <AppShell empresaCompleta={data} slug={slug}>
      <Outlet />
    </AppShell>
  );
}
