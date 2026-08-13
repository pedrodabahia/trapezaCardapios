import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listEmpresasAdmin } from "@/lib/admin-server";
import { useAuthSession } from "@/lib/auth-session";

export const Route = createFileRoute("/plataforma/")({
  beforeLoad: () => {
    const session = useAuthSession.getState().session;
    if (!session || session.role !== "super_admin") {
      throw redirect({ to: "/plataforma/login" });
    }
  },
  component: PlatformDashboard,
});

function PlatformDashboard() {
  const navigate = useNavigate();
  const session = useAuthSession((s) => s.session);
  const clear = useAuthSession((s) => s.clear);

  const { data: empresas = [], isLoading } = useQuery({
    queryKey: ["plataforma-empresas"],
    queryFn: () => listEmpresasAdmin({ data: { token: session!.accessToken } }),
    enabled: !!session,
  });

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-display text-xl font-bold">TRAPEZA · plataforma</h1>
            <p className="text-xs text-muted-foreground">{session.email}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/">
              <Button variant="outline" size="sm">
                Ver site
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clear();
                navigate({ to: "/plataforma/login" });
              }}
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Empresas cadastradas</h2>
            <p className="text-sm text-muted-foreground">
              {empresas.length} {empresas.length === 1 ? "empresa" : "empresas"} no sistema
            </p>
          </div>
          <Link to="/plataforma/empresas/nova">
            <Button>+ Nova empresa</Button>
          </Link>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : empresas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhuma empresa cadastrada ainda. Comece criando a primeira.
              </p>
              <Link to="/plataforma/empresas/nova" className="mt-4 inline-block">
                <Button>+ Cadastrar primeira empresa</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {empresas.map((e) => (
              <Link
                key={e.id}
                to="/plataforma/empresas/$id"
                params={{ id: e.id }}
                className="block"
              >
                <Card className="transition hover:shadow-lg hover:-translate-y-0.5">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="font-display text-lg">{e.nome}</CardTitle>
                      <Badge
                        variant={
                          e.status_pagamento === "ativo"
                            ? "default"
                            : e.status_pagamento === "atrasado"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {e.status_pagamento}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Slug:</span>{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        /s/{e.slug}
                      </code>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Plano:</span> {e.plano_id}
                    </p>
                    <p>
                      <span className="text-muted-foreground">WhatsApp:</span>{" "}
                      {e.whatsapp}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}