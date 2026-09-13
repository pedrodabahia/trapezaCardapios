import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listEmpresasAdmin } from "@/lib/admin-server";
import { useAuthSession } from "@/lib/auth-session";
import { CATEGORIAS_NEGOCIO } from "@/lib/categorias-negocio";

const TODOS = "__todos__";

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

  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>(TODOS);
  const [statusFiltro, setStatusFiltro] = useState<string>(TODOS);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>(TODOS);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return empresas.filter((e) => {
      if (tipoFiltro !== TODOS && e.tipo !== tipoFiltro) return false;
      if (statusFiltro !== TODOS && e.status_pagamento !== statusFiltro) return false;
      if (categoriaFiltro !== TODOS && !e.categorias?.includes(categoriaFiltro)) return false;
      if (!termo) return true;
      return (
        e.nome.toLowerCase().includes(termo) ||
        e.slug.toLowerCase().includes(termo) ||
        (e.cidade ?? "").toLowerCase().includes(termo) ||
        (e.whatsapp ?? "").includes(termo)
      );
    });
  }, [empresas, busca, tipoFiltro, statusFiltro, categoriaFiltro]);

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
            <Link to="/plataforma/anuncios">
              <Button variant="outline" size="sm">
                Anúncios da home
              </Button>
            </Link>
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
              {filtradas.length} de {empresas.length}{" "}
              {empresas.length === 1 ? "empresa" : "empresas"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/plataforma/empresas/nova-externa">
              <Button variant="outline">+ Empresa externa</Button>
            </Link>
            <Link to="/plataforma/empresas/nova">
              <Button>+ Nova empresa</Button>
            </Link>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, slug, cidade ou WhatsApp..."
              className="pl-8"
            />
          </div>
          <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos os tipos</SelectItem>
              <SelectItem value="trapeza">Trapeza</SelectItem>
              <SelectItem value="externa">Externa</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
              <SelectItem value="suspenso">Suspenso</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas as categorias</SelectItem>
              {CATEGORIAS_NEGOCIO.map((c) => (
                <SelectItem key={c.valor} value={c.valor}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        ) : filtradas.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma empresa encontrada com esse filtro.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtradas.map((e) => (
              <Link
                key={e.id}
                to="/plataforma/empresas/$id"
                params={{ id: e.id }}
                className="block"
              >
                <Card className="transition hover:shadow-lg hover:-translate-y-0.5">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="font-display text-lg">{e.nome}</CardTitle>
                        <div className="mt-1 flex items-center gap-1.5">
                          <Badge variant={e.tipo === "externa" ? "outline" : "secondary"}>
                            {e.tipo === "externa" ? "Externa" : "Trapeza"}
                          </Badge>
                          {e.destaque && <Badge className="bg-brand-yellow text-brand-brown">Destaque</Badge>}
                        </div>
                      </div>
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
                    {e.tipo === "externa" ? (
                      <p>
                        <span className="text-muted-foreground">Site:</span>{" "}
                        <span className="break-all">{e.url_externa}</span>
                      </p>
                    ) : (
                      <p>
                        <span className="text-muted-foreground">Slug:</span>{" "}
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          /s/{e.slug}
                        </code>
                      </p>
                    )}
                    <p>
                      <span className="text-muted-foreground">Plano:</span>{" "}
                      {e.tipo === "externa" ? "— (n/a)" : e.plano_id}
                    </p>
                    <p>
                      <span className="text-muted-foreground">WhatsApp:</span>{" "}
                      {e.whatsapp ?? "—"}
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