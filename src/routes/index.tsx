import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listEmpresasPublicas } from "@/lib/admin-server";
import type { Empresa } from "@/lib/admin-server";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { data: empresas = [], isLoading } = useQuery({
    queryKey: ["empresas-publicas"],
    queryFn: () => listEmpresasPublicas({ data: {} as Record<string, never> }),
    staleTime: 30_000,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="hero-gradient text-white">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <span className="mt-4  font-display text-2xl font-manrope leading-tight  md:text-2xl">
            TRAPEZA
          </span>
          <p className="mt-1 max-w-2xl text-sm font-semibold uppercase tracking-wide text-white/80">
            Seu negócio à mesa
          </p>
          <h1 className="mt-2 font-display text-4xl font-manrope leading-tight md:text-6xl">
            Cardápios digitais<br />
            para sua cidade
            
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 md:text-lg">
            Plataforma multi-tenant: cada empresa com seu link, suas cores,
            seu cardápio. O cliente final monta o pedido e manda pelo WhatsApp
            em segundos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/painel/login">
              <Button
                size="lg"
                className="rounded-full bg-brand-yellow text-brand-brown hover:bg-brand-yellow/90"
              >
                Sou dono de empresa →
              </Button>
            </Link>
            <a href="#empresas">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20"
              >
                Ver cardápios
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Lista de empresas */}
      <section id="empresas" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold">
              Empresas na TRAPEZA
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {empresas.length === 0
                ? "Nenhuma empresa ativa ainda. Cadastre a primeira pelo painel."
                : `${empresas.length} ${
                    empresas.length === 1 ? "empresa ativa" : "empresas ativas"
                  }`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : empresas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Em breve os primeiros cardápios aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {empresas.map((e) => (
              <Link
                key={e.id}
                to="/s/$slug"
                params={{ slug: e.slug }}
                className="group"
              >
                <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                  {e.logo_url && (
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={e.logo_url}
                        alt={e.nome}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardContent className="space-y-2 p-4">
                    <h3 className="font-display text-lg font-semibold">
                      {e.nome}
                    </h3>
                    {e.endereco && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {e.endereco}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <span className="rounded-full bg-brand-red px-3 py-1 text-xs font-bold text-white">
                        Ver cardápio →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            <strong className="text-foreground">TRAPEZA</strong> · seu negócio à
            mesa — cardápios digitais multi-tenant
          </p>
          <div className="flex gap-4">
            <Link to="/painel/login" className="hover:underline">
              Painel admin
            </Link>
            <Link to="/plataforma/login" className="hover:underline">
              Plataforma
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}