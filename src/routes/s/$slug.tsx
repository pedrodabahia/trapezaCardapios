import { createFileRoute, Outlet, notFound, Link } from "@tanstack/react-router";
import { useEmpresaPublica } from "@/lib/admin-store";
import { AppShell } from "@/components/layout/AppShell";
import { LogoLoader } from "@/components/LogoLoader";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";


export const Route = createFileRoute("/s/$slug")({
  component: TenantLayout,
});

function TenantLayout() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = useEmpresaPublica(slug);

  

  useEffect(() => {
  if (!data?.empresa.id) return;

  void trackEvent("company_view", {
    empresaId: data.empresa.id ,
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
    // Cardápio não existe OU está suspenso.
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <div className="text-7xl">🍽️</div>
          <h1 className="mt-4 font-display text-2xl font-bold">
            Cardápio indisponível
          </h1>
          <p className="mt-2 text-muted-foreground">
            Esse link não corresponde a uma empresa ativa no pedidoPronto.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-red px-6 py-3 font-semibold text-white"
          >
            Ver outros cardápios
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