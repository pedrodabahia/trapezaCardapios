
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";

import {
  Building2,
  ExternalLink,
  Eye,
  MessageCircle,
  RefreshCw,
  Search,
  UserRoundPlus,
  Users,
  X,
  Tag,
  MousePointerClick,
} from "lucide-react";

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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  listEmpresasAdmin,
  getCategoriasNegocio,
  listarCadastrosInteresseRecentes,
  removerCadastroInteresse,
  listarAnalytics,
  listarAnalyticsPromocoes,
  type CadastroInteresse,
} from "@/lib/admin-server";

import { useAuthSession } from "@/lib/auth-session";
import { CATEGORIAS_NEGOCIO } from "@/lib/categorias-negocio";

const TODOS = "__todos__";

export const Route = createFileRoute("/plataforma/")({
  beforeLoad: () => {
    const session = useAuthSession.getState().session;

    if (!session || session.role !== "super_admin") {
      throw redirect({
        to: "/plataforma/login",
      });
    }
  },
  component: PlatformDashboard,
});

function PlatformDashboard() {
  const navigate = useNavigate();

  const session = useAuthSession((s) => s.session);
  const clear = useAuthSession((s) => s.clear);

  // =========================================================
  // EMPRESAS
  // =========================================================

  const { data: empresas = [], isLoading } = useQuery({
    queryKey: ["plataforma-empresas"],
    queryFn: () =>
      listEmpresasAdmin({
        data: { token: session!.accessToken },
      }),
    enabled: !!session,
  });

  // =========================================================
  // CATEGORIAS
  // =========================================================

  const { data: categoriasNegocio = CATEGORIAS_NEGOCIO } =
    useQuery({
      queryKey: ["categorias-negocio"],
      queryFn: () =>
        getCategoriasNegocio({
          data: {} as Record<string, never>,
        }),
      staleTime: 60_000,
    });

  // =========================================================
  // CADASTROS RECENTES
  // =========================================================

  const {
    data: cadastrosRecentes = [],
    isLoading: carregandoCadastros,
    refetch: recarregarCadastros,
  } = useQuery({
    queryKey: ["cadastros-interesse-recentes"],
    queryFn: () =>
      listarCadastrosInteresseRecentes({
        data: { token: session!.accessToken },
      }),
    enabled: !!session,
  });

  // =========================================================
  // ANALYTICS GERAL
  // =========================================================

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
    isFetching: analyticsFetching,
  } = useQuery({
    queryKey: ["plataforma-analytics"],
    queryFn: () =>
      listarAnalytics({
        data: { token: session!.accessToken },
      }),
    enabled: !!session,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  // =========================================================
  // ANALYTICS DE PROMOÇÕES
  // =========================================================

  const {
    data: promocoesData,
    isLoading: promocoesLoading,
    error: promocoesError,
    refetch: refetchPromocoes,
    isFetching: promocoesFetching,
  } = useQuery({
    queryKey: ["plataforma-analytics-promocoes"],
    queryFn: () =>
      listarAnalyticsPromocoes({
        data: { token: session!.accessToken },
      }),
    enabled: !!session,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  // =========================================================
  // FILTROS
  // =========================================================

  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>(TODOS);
  const [statusFiltro, setStatusFiltro] = useState<string>(TODOS);
  const [categoriaFiltro, setCategoriaFiltro] =
    useState<string>(TODOS);

  // =========================================================
  // EMPRESAS FILTRADAS
  // =========================================================

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return empresas.filter((e) => {
      if (tipoFiltro !== TODOS && e.tipo !== tipoFiltro) {
        return false;
      }

      if (
        statusFiltro !== TODOS &&
        e.status_pagamento !== statusFiltro
      ) {
        return false;
      }

      if (
        categoriaFiltro !== TODOS &&
        !e.categorias?.includes(categoriaFiltro)
      ) {
        return false;
      }

      if (!termo) return true;

      return (
        e.nome.toLowerCase().includes(termo) ||
        e.slug.toLowerCase().includes(termo) ||
        (e.cidade ?? "").toLowerCase().includes(termo) ||
        (e.whatsapp ?? "").includes(termo)
      );
    });
  }, [
    empresas,
    busca,
    tipoFiltro,
    statusFiltro,
    categoriaFiltro,
  ]);

  // =========================================================
  // ANALYTICS PROCESSADO
  // =========================================================

  const analytics = {
    pageViews: analyticsData?.pageViews ?? 0,
    companyViews: analyticsData?.companyViews ?? 0,
    whatsappClicks: analyticsData?.whatsappClicks ?? 0,
    visitantes: analyticsData?.visitantes ?? 0,

    empresasMaisVistas:
      analyticsData?.empresasMaisVistas
        ?.map((item) => ({
          ...item,
          empresa: empresas.find((e) => e.id === item.empresaId),
        }))
        .filter((item) => item.empresa) ?? [],

    empresasMaisWhatsApp:
      analyticsData?.empresasMaisWhatsApp
        ?.map((item) => ({
          ...item,
          empresa: empresas.find((e) => e.id === item.empresaId),
        }))
        .filter((item) => item.empresa) ?? [],
  };

  if (!session) return null;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold">
              TRAPEZA · plataforma
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {session.email}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/plataforma/categorias-negocio">
              <Button variant="outline" size="sm">
                Categorias
              </Button>
            </Link>

            <Link to="/plataforma/promocoes">
              <Button variant="outline" size="sm">
                Promoções
              </Button>
            </Link>

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

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* ANALYTICS GERAL */}

        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">
                Analytics
              </h2>
              <p className="text-sm text-muted-foreground">
                Visão dos últimos 30 dias
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetchAnalytics()}
              disabled={analyticsFetching}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  analyticsFetching ? "animate-spin" : ""
                }`}
              />
              {analyticsFetching ? "Atualizando..." : "Atualizar"}
            </Button>
          </div>

          {analyticsLoading ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">
                Carregando analytics...
              </p>
            </div>
          ) : analyticsError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
              <p className="font-medium text-destructive">
                Não foi possível carregar o analytics.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Verifique a configuração do acesso administrativo.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <AnalyticsCard
                  title="Visualizações"
                  value={analytics.pageViews}
                  icon={<Eye className="h-5 w-5" />}
                />
                <AnalyticsCard
                  title="Visitantes"
                  value={analytics.visitantes}
                  icon={<Users className="h-5 w-5" />}
                />
                <AnalyticsCard
                  title="Visualizações de empresas"
                  value={analytics.companyViews}
                  icon={<Building2 className="h-5 w-5" />}
                />
                <AnalyticsCard
                  title="Cliques no WhatsApp"
                  value={analytics.whatsappClicks}
                  icon={<MessageCircle className="h-5 w-5" />}
                />
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <AnalyticsRanking
                  title="Empresas mais vistas"
                  items={analytics.empresasMaisVistas}
                />
                <AnalyticsRanking
                  title="Mais cliques no WhatsApp"
                  items={analytics.empresasMaisWhatsApp}
                />
              </div>
            </>
          )}
        </section>

        {/* =================================================
            ANALYTICS DE PROMOÇÕES
        ================================================= */}

        <section className="mb-10">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">
                Desempenho das promoções
              </h2>
              <p className="text-sm text-muted-foreground">
                Resultados das ofertas nos últimos 30 dias
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetchPromocoes()}
              disabled={promocoesFetching}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  promocoesFetching ? "animate-spin" : ""
                }`}
              />
              {promocoesFetching ? "Atualizando..." : "Atualizar"}
            </Button>
          </div>

          {promocoesLoading ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">
                Carregando desempenho das promoções...
              </p>
            </div>
          ) : promocoesError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
              <p className="font-medium text-destructive">
                Não foi possível carregar as estatísticas das promoções.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Confirme se a função SQL get_promotion_analytics_30_days
                já foi criada no Supabase e se a função administrativa
                está exportada corretamente.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnalyticsCard
                  title="Visualizações de ofertas"
                  value={promocoesData?.visualizacoes ?? 0}
                  icon={<Eye className="h-5 w-5" />}
                />
                <AnalyticsCard
                  title="Cliques nos cards"
                  value={promocoesData?.cliquesOfertas ?? 0}
                  icon={<Tag className="h-5 w-5" />}
                />
                <AnalyticsCard
                  title="Cliques no WhatsApp das ofertas"
                  value={promocoesData?.cliquesWhatsApp ?? 0}
                  icon={<MessageCircle className="h-5 w-5" />}
                />
              </div>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="font-display text-lg">
                    Desempenho por promoção
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {!promocoesData?.promocoes?.length ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum evento de promoção foi registrado nos últimos
                      30 dias. Quando as visualizações e os cliques forem
                      registrados, os resultados aparecerão aqui.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {promocoesData.promocoes.map((promocao, index) => (
                        <div
                          key={promocao.promocaoId}
                          className="rounded-xl border border-border p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
                                {index + 1}
                              </span>

                              <div className="min-w-0">
                                <p className="font-semibold">
                                  {promocao.titulo}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {promocao.empresaNome}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 text-center sm:min-w-[330px]">
                              <PromotionMetric
                                label="Visualizações"
                                value={promocao.visualizacoes}
                                icon={<Eye className="h-4 w-4" />}
                              />
                              <PromotionMetric
                                label="Cliques"
                                value={promocao.cliquesOferta}
                                icon={<MousePointerClick className="h-4 w-4" />}
                              />
                              <PromotionMetric
                                label="WhatsApp"
                                value={promocao.cliquesWhatsApp}
                                icon={<MessageCircle className="h-4 w-4" />}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </section>

        {/* EMPRESAS CADASTRADAS */}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">
              Empresas cadastradas
            </h2>
            <p className="text-sm text-muted-foreground">
              {filtradas.length} de {empresas.length}{" "}
              {empresas.length === 1 ? "empresa" : "empresas"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/plataforma/empresas/nova-externa">
              <Button variant="outline">+ Empresa externa</Button>
            </Link>
            <Link to="/plataforma/empresas/nova">
              <Button>+ Nova empresa</Button>
            </Link>
          </div>
        </div>

        {/* CADASTROS RECENTES */}

        <CadastrosRecentes
          cadastros={cadastrosRecentes}
          categorias={categoriasNegocio}
          carregando={carregandoCadastros}
          onRemover={async (id) => {
            await removerCadastroInteresse({
              data: { token: session.accessToken, id },
            });
            await recarregarCadastros();
          }}
        />

        {/* FILTROS */}

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

          <Select
            value={categoriaFiltro}
            onValueChange={setCategoriaFiltro}
          >
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas as categorias</SelectItem>
              {categoriasNegocio.map((c) => (
                <SelectItem key={c.valor} value={c.valor}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* LISTAGEM DE EMPRESAS */}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : empresas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhuma empresa cadastrada ainda. Comece criando a primeira.
              </p>
              <Link
                to="/plataforma/empresas/nova"
                className="mt-4 inline-block"
              >
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
                <Card className="transition hover:-translate-y-0.5 hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="font-display text-lg">
                          {e.nome}
                        </CardTitle>
                        <div className="mt-1 flex items-center gap-1.5">
                          <Badge
                            variant={
                              e.tipo === "externa" ? "outline" : "secondary"
                            }
                          >
                            {e.tipo === "externa" ? "Externa" : "Trapeza"}
                          </Badge>
                          {e.destaque && (
                            <Badge className="bg-brand-yellow text-brand-brown">
                              Destaque
                            </Badge>
                          )}
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

// =========================================================
// CARD DE ANALYTICS
// =========================================================

function AnalyticsCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 font-display text-3xl font-bold">
              {value.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="shrink-0 rounded-xl bg-muted p-3">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// =========================================================
// MÉTRICA DE PROMOÇÃO
// =========================================================

function PromotionMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-lg font-bold">
        {value.toLocaleString("pt-BR")}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// =========================================================
// RANKING DE ANALYTICS
// =========================================================

function AnalyticsRanking({
  title,
  items,
}: {
  title: string;
  items: {
    empresaId: string;
    total: number;
    empresa?: {
      id: string;
      nome: string;
    };
  }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ainda não há dados suficientes.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.empresaId}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="truncate text-sm font-medium">
                    {item.empresa?.nome ?? "Empresa"}
                  </span>
                </div>

                <Badge variant="secondary">
                  {item.total.toLocaleString("pt-BR")}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =========================================================
// CADASTROS RECENTES
// =========================================================

function CadastrosRecentes({
  cadastros,
  categorias,
  carregando,
  onRemover,
}: {
  cadastros: CadastroInteresse[];
  categorias: {
    id?: string;
    valor?: string;
    label: string;
  }[];
  carregando: boolean;
  onRemover: (id: string) => Promise<void>;
}) {
  const navigate = useNavigate();

  const categoriaPorId = new Map(
    categorias.flatMap((categoria) =>
      categoria.id
        ? [[categoria.id, categoria] as const]
        : [],
    ),
  );

  function iniciarCadastro(
    cadastro: CadastroInteresse,
    tipo: "interna" | "externa",
  ) {
    const categoria = categoriaPorId.get(
      cadastro.categoria_negocio_id ?? "",
    );

    window.localStorage.setItem(
      "trapeza:cadastro-pendente",
      JSON.stringify({
        nome: cadastro.nome_empresa,
        responsavel: cadastro.nome_responsavel,
        whatsapp: cadastro.whatsapp,
        email: cadastro.email ?? "",
        cidade: cadastro.cidade,
        categorias: cadastro.categoria_negocio_id
          ? [cadastro.categoria_negocio_id]
          : [],
        categoriaValor: categoria?.valor ?? "",
      }),
    );

    navigate({
      to:
        tipo === "interna"
          ? "/plataforma/empresas/nova"
          : "/plataforma/empresas/nova-externa",
    });
  }

  async function remover(cadastro: CadastroInteresse) {
    if (
      !confirm(
        `Excluir "${cadastro.nome_empresa}"? Esse contato será apagado permanentemente e não poderá ser recuperado.`,
      )
    ) {
      return;
    }

    try {
      await onRemover(cadastro.id);
    } catch {
      alert("Não foi possível excluir esse contato agora.");
    }
  }

  return (
    <section className="mb-8 rounded-2xl border border-brand-yellow/40 bg-brand-yellow/10 p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <UserRoundPlus className="h-5 w-5 text-brand-brown" />
            <h2 className="font-display text-xl font-bold">
              Empresas cadastradas recentemente
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Contatos enviados pelo formulário público “Cadastre sua empresa grátis”.
          </p>
        </div>

        <Badge variant="secondary">
          {cadastros.length}{" "}
          {cadastros.length === 1 ? "novo contato" : "novos contatos"}
        </Badge>
      </div>

      {carregando ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Carregando contatos...
        </p>
      ) : cadastros.length === 0 ? (
        <p className="mt-4 rounded-xl bg-background/60 p-4 text-sm text-muted-foreground">
          Ainda não chegou nenhum cadastro pelo site. Assim que alguém preencher
          o formulário, o contato aparece aqui.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {cadastros.map((cadastro) => {
            const numeroWhats = cadastro.whatsapp.replace(/\D/g, "");
            const mensagem = encodeURIComponent(
              `Olá, ${cadastro.nome_responsavel}! Vi o cadastro da ${cadastro.nome_empresa} no Trapeza e queria conversar sobre colocar sua empresa na plataforma.`,
            );

            return (
              <Card key={cadastro.id} className="bg-background/80">
                <CardContent className="space-y-2 p-4 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{cadastro.nome_empresa}</p>
                      <p className="text-muted-foreground">
                        {cadastro.nome_responsavel} · {cadastro.cidade}
                      </p>
                    </div>
                    <Badge variant="outline">novo</Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {categoriaPorId.get(cadastro.categoria_negocio_id ?? "")
                      ?.label ?? "Atividade não encontrada"}{" "}
                    · enviado em{" "}
                    {new Date(cadastro.criado_em).toLocaleDateString("pt-BR")}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href={`https://wa.me/${numeroWhats}?text=${mensagem}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button size="sm" className="gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5" />
                        Chamar no WhatsApp
                      </Button>
                    </a>

                    {cadastro.email && (
                      <a
                        className="inline-flex"
                        href={`mailto:${cadastro.email}`}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          E-mail
                        </Button>
                      </a>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => iniciarCadastro(cadastro, "interna")}
                    >
                      Criar interna
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => iniciarCadastro(cadastro, "externa")}
                    >
                      Criar externa
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-auto text-muted-foreground hover:text-destructive"
                      title="Excluir contato"
                      aria-label={`Excluir ${cadastro.nome_empresa}`}
                      onClick={() => remover(cadastro)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}