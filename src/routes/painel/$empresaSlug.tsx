import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { LogOut, ArrowLeft, Menu, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuthSession } from "@/lib/auth-session";
import {
  useEmpresaAdmin,
  useInvalidateEmpresa,
  useDashboardResumo,
  useOpcoesDestaqueDashboard,
  getCores,
  getCupons,
  getFrete,
  getBairros,
  getHorarios,
  getCidadeEntrega,
  type EmpresaCompleta,
  type Coupon,
  type DayHours,
  type Neighborhood,
} from "@/lib/admin-store";
import {
  saveEmpresaConfig,
  saveProduto,
  deleteProduto,
  saveProdutoIngredientes,
  saveCategoria,
  saveCategoriaOpcao,
  deleteCategoriaOpcao,
  saveOpcao,
  deleteOpcao,
  toggleOpcaoAtiva,
  updateEmpresa,
  getEmpresaBySlug,
  listPedidosEmpresa,
  updatePedidoStatus,
  getPlanoDaEmpresa,
  changeOwnPassword,
  type Produto,
  type Categoria,
  type CategoriaOpcao,
  type OpcaoPersonalizacao,
  type ProdutoIngrediente,
  type Pedido,
} from "@/lib/admin-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ImageUploadField } from "@/components/ImageUploadField";
import {
  Plus,
  Trash2,
  AlertTriangle,
  Package,
  Layers,
  ClipboardList,
  Settings2,
  UserCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { brl } from "@/lib/format";

// Itens de navegação do painel — usados tanto nas abas (desktop) quanto no
// menu lateral que aparece no mobile.
const TAB_ITEMS = [
  { value: "inicio", label: "Início" },
  { value: "produtos", label: "Produtos" },
  { value: "categorias", label: "Categorias" },
  { value: "pedidos", label: "Pedidos" },
  { value: "promocoes", label: "Promoções" },
  { value: "cupons", label: "Cupons" },
  { value: "entrega", label: "Entrega" },
  { value: "personalizacao", label: "Personalização" },
  { value: "config", label: "Configurações" },
  { value: "conta", label: "Conta / Plano" },
  { value: "seguranca", label: "Segurança" },
] as const;

export const Route = createFileRoute("/painel/$empresaSlug")({
  beforeLoad: ({ params }) => {
    const session = useAuthSession.getState().session;
    if (!session || session.role !== "admin") {
      throw redirect({ to: "/painel/login" });
    }
    // Confirma que o slug bate com a empresa do admin
    return { empresaSlug: params.empresaSlug };
  },
  component: PainelTenant,
});

function PainelTenant() {
  const { empresaSlug } = Route.useParams();
  const session = useAuthSession((s) => s.session);
  const clear = useAuthSession((s) => s.clear);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inicio");
  const [navOpen, setNavOpen] = useState(false);

  // Carrega a empresa via slug (público) só pra ter nome/logo no header.
  // O state auth já dá empresaId; a config detalhada vem de useEmpresaAdmin.
  const [publicEmpresa] = useState<{ nome: string; slug: string } | null>(null);

  const { data: completa, isLoading } = useEmpresaAdmin(
    session?.accessToken ?? null,
    session?.empresaId ?? undefined,
  );

  const invalidateRaw = useInvalidateEmpresa();
  const invalidate = () =>
    invalidateRaw({ slug: completa?.empresa.slug, empresaId: session?.empresaId ?? undefined });

  if (!session) return null;

  if (isLoading || !completa) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando painel...</p>
      </div>
    );
  }

  const empresa = completa.empresa;
  if (empresa.slug !== empresaSlug) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <p className="text-sm">
          Esta sessão pertence à empresa <strong>{empresa.nome}</strong>, mas
          você acessou <code>/painel/{empresaSlug}</code>.
        </p>
        <Button
          className="mt-4"
          onClick={() => navigate({ to: `/painel/${empresa.slug}` })}
        >
          Ir pro painel correto
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="flex w-3/4 flex-col gap-0 p-0 sm:max-w-xs">
          <SheetHeader className="border-b bg-brand-cream p-5 text-left">
            <SheetTitle className="font-display text-lg">Menu do painel</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
            {TAB_ITEMS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setActiveTab(tab.value);
                  setNavOpen(false);
                }}
                className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                  activeTab === tab.value
                    ? "bg-brand-red text-white"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
              onClick={() => setNavOpen(true)}
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-bold">{empresa.nome}</h1>
              <p className="truncate text-xs text-muted-foreground">
                <code>/s/{empresa.slug}</code> · {session.email}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a href={`/s/${empresa.slug}`} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="px-2 sm:px-3">
                <ExternalLink className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Ver cardápio</span>
              </Button>
            </a>
            <Link to="/painel/login">
              <Button
                variant="outline"
                size="sm"
                className="px-2 sm:px-3"
                onClick={() => clear()}
              >
                <LogOut className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {empresa.status_pagamento !== "ativo" && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-display font-semibold text-destructive">
                {empresa.status_pagamento === "suspenso"
                  ? "Sua assinatura está suspensa."
                  : "Sua assinatura está atrasada."}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Enquanto isso, você consegue ver seus dados aqui, mas não
                consegue salvar alterações (produtos, categorias, config).
                Regularize o pagamento com a plataforma pra liberar de novo.
              </p>
            </div>
          </div>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop: abas normais. Mobile: escondidas — usamos o botão de
              seção atual + menu lateral logo abaixo em vez disso. */}
          <TabsList className="hidden flex-wrap md:flex">
            <TabsTrigger value="inicio">Início</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="promocoes">Promoções</TabsTrigger>
            <TabsTrigger value="cupons">Cupons</TabsTrigger>
            <TabsTrigger value="entrega">Entrega</TabsTrigger>
            <TabsTrigger value="personalizacao">Personalização</TabsTrigger>
            <TabsTrigger value="config">Configurações</TabsTrigger>
            <TabsTrigger value="conta">Conta / Plano</TabsTrigger>
            <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          </TabsList>

          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="flex w-full items-center justify-between rounded-xl border bg-card px-4 py-3 text-sm font-semibold shadow-sm md:hidden"
          >
            <span>{TAB_ITEMS.find((t) => t.value === activeTab)?.label ?? "Menu"}</span>
            <Menu className="h-4 w-4 text-muted-foreground" />
          </button>

          <TabsContent value="inicio">
            <InicioTab
              completa={completa}
              token={session.accessToken}
              onSaved={invalidate}
              onNavigate={setActiveTab}
            />
          </TabsContent>
          <TabsContent value="produtos">
            <ProdutosTab completa={completa} token={session.accessToken} onSaved={invalidate} />
          </TabsContent>
          <TabsContent value="categorias">
            <CategoriasTab completa={completa} token={session.accessToken} onSaved={invalidate} />
          </TabsContent>
          <TabsContent value="pedidos">
            <PedidosTab completa={completa} token={session.accessToken} />
          </TabsContent>
          <TabsContent value="promocoes">
            <PromocoesTab completa={completa} token={session.accessToken} onSaved={invalidate} />
          </TabsContent>
          <TabsContent value="cupons">
            <CuponsTab completa={completa} token={session.accessToken} onSaved={invalidate} />
          </TabsContent>
          <TabsContent value="entrega">
            <EntregaTab completa={completa} token={session.accessToken} onSaved={invalidate} />
          </TabsContent>
          <TabsContent value="personalizacao">
            <PersonalizacaoTab completa={completa} token={session.accessToken} onSaved={invalidate} />
          </TabsContent>
          <TabsContent value="config">
            <ConfigTab completa={completa} token={session.accessToken} onSaved={invalidate} />
          </TabsContent>
          <TabsContent value="conta">
            <ContaTab completa={completa} token={session.accessToken} />
          </TabsContent>
          <TabsContent value="seguranca">
            <SegurancaTab token={session.accessToken} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ============================================================================
// Subcomponentes de cada tab
// ============================================================================

// Cards de atalho pras outras seções do painel, mostrados na home.
const ATALHOS = [
  { tab: "produtos", label: "Produtos", icon: Package },
  { tab: "categorias", label: "Categorias", icon: Layers },
  { tab: "pedidos", label: "Pedidos", icon: ClipboardList },
  { tab: "config", label: "Configurações", icon: Settings2 },
  { tab: "conta", label: "Conta", icon: UserCircle },
  { tab: "seguranca", label: "Segurança", icon: ShieldCheck },
] as const;

function InicioTab({
  completa,
  token,
  onSaved,
  onNavigate,
}: {
  completa: EmpresaCompleta;
  token: string;
  onSaved: () => void;
  onNavigate: (tab: string) => void;
}) {
  const empresaId = completa.empresa.id;

  // Mesma queryKey usada pela aba Pedidos (listPedidosEmpresa) — se as
  // duas telas estiverem montadas, o react-query só busca uma vez.
  const { data: pedidos } = useQuery({
    queryKey: ["pedidos-empresa", empresaId],
    queryFn: () => listPedidosEmpresa({ data: { token, empresaId } }),
    enabled: !!token && !!empresaId,
    refetchInterval: 30_000,
  });

  const resumo = useDashboardResumo(completa, pedidos);
  const maxDia = Math.max(1, ...resumo.pedidosPorDiaSemana.map((d) => d.total));

  const vencimentoLabel = resumo.proximoVencimento
    ? new Date(resumo.proximoVencimento + "T00:00:00").toLocaleDateString("pt-BR")
    : "—";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">
          Olá, {completa.empresa.nome}
        </h2>
        <p className="text-sm text-muted-foreground">
          Um resumo rápido de como sua loja está hoje.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {ATALHOS.map((a) => (
          <button
            key={a.tab}
            type="button"
            onClick={() => onNavigate(a.tab)}
            className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:border-brand-red hover:shadow-md"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-red/10 text-brand-red">
              <a.icon className="h-5 w-5" />
            </span>
            <span className="font-display font-semibold">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-brand-red text-white">
          <CardContent className="p-4">
            <p className="text-xs text-white">Produtos cadastrados</p>
            <p className="mt-1 font-display text-2xl font-bold">{resumo.produtosCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-brand-red text-white">
          <CardContent className="p-4">
            <p className="text-xs text-white">Vencimento do plano</p>
            <p className="mt-1 font-display text-2xl font-bold">{vencimentoLabel}</p>
          </CardContent>
        </Card>
        <Card className="bg-brand-red text-white">
          <CardContent className="p-4">
            <p className="text-xs text-white">Pedidos hoje</p>
            <p className="mt-1 font-display text-2xl font-bold">
              {resumo.pedidosHoje}
              {resumo.pedidosHojeCancelados > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({resumo.pedidosHojeCancelados} cancelado
                  {resumo.pedidosHojeCancelados > 1 ? "s" : ""})
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-brand-red text-white">
          <CardContent className="p-4">
            <p className="text-xs text-white">
              Faturou essa semana
            </p>
            <p className="mt-1 font-display text-2xl font-bold">{brl(resumo.valorSemana)}</p>
            <p className="mt-1 text-[11px] text-white">
              não conta pedido cancelado
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pedidos nos últimos 7 dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2">
            {resumo.pedidosPorDiaSemana.map((d) => (
              <div key={d.data} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-semibold">{d.total}</span>
                <div className="flex h-24 w-full items-end rounded-md bg-muted">
                  <div
                    className="w-full rounded-md bg-brand-red"
                    style={{ height: `${(d.total / maxDia) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <OpcoesDoDiaWidget completa={completa} token={token} onSaved={onSaved} />
    </div>
  );
}

// Widget "opções do dia": opções das categorias marcadas com
// destaque_dashboard, com toggle liga/desliga rápido + form pra cadastrar
// uma opção nova sem sair da home. Serve pra qualquer negócio (marmitaria,
// lanchonete, pizzaria etc) — o nome não fica preso a um exemplo específico.
function OpcoesDoDiaWidget({
  completa,
  token,
  onSaved,
}: {
  completa: EmpresaCompleta;
  token: string;
  onSaved: () => void;
}) {
  const destaques = useOpcoesDestaqueDashboard(completa);

  if (destaques.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" /> Opções do dia
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Nenhuma categoria de adicional está marcada pra aparecer aqui ainda.
          Vá na aba <strong>Personalização</strong>, edite a categoria que muda
          de disponibilidade com frequência (ex: "Escolha a carne" numa
          marmitaria, ou "Sabor do milk-shake" numa lanchonete) e ative
          "Aparece no início do painel".
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {destaques.map(({ categoria, opcoes }) => (
        <OpcoesDoDiaCategoria
          key={categoria.id}
          categoria={categoria}
          opcoes={opcoes}
          completa={completa}
          token={token}
          onSaved={onSaved}
        />
      ))}
    </div>
  );
}
function OpcoesDoDiaCategoria({
  categoria,
  opcoes,
  completa,
  token,
  onSaved,
}: {
  categoria: CategoriaOpcao;
  opcoes: OpcaoPersonalizacao[];
  completa: EmpresaCompleta;
  token: string;
  onSaved: () => void;
}) {
  const [novoNome, setNovoNome] = useState("");
  const [novoPreco, setNovoPreco] = useState("0");
  const [busy, setBusy] = useState(false);
  // Alterações de liga/desliga feitas na tela mas ainda não enviadas pro
  // banco. Um id só entra aqui quando o valor escolhido difere do que veio
  // do servidor — assim o botão "Aplicar" só aparece quando tem algo pra
  // salvar de fato, e cada clique no switch não faz nenhuma chamada de rede.
  const [pendentes, setPendentes] = useState<Record<string, boolean>>({});
  const [salvando, setSalvando] = useState(false);

  function marcarPendente(opcao: OpcaoPersonalizacao, ativo: boolean) {
    setPendentes((prev) => {
      const next = { ...prev };
      if (ativo === opcao.ativo) {
        delete next[opcao.id];
      } else {
        next[opcao.id] = ativo;
      }
      return next;
    });
  }

  const pendentesEntries = Object.entries(pendentes);

  async function aplicarPendentes() {
    if (pendentesEntries.length === 0) return;
    setSalvando(true);
    try {
      // Só uma leva de chamadas, disparada quando a pessoa clica em
      // "Aplicar alterações" — não mais uma por clique de switch.
      await Promise.all(
        pendentesEntries.map(([opcaoId, ativo]) =>
          toggleOpcaoAtiva({
            data: { token, empresaId: completa.empresa.id, opcaoId, ativo },
          }),
        ),
      );
      toast.success(
        pendentesEntries.length === 1
          ? "Opção atualizada"
          : `${pendentesEntries.length} opções atualizadas`,
      );
      setPendentes({});
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar alterações");
    } finally {
      setSalvando(false);
    }
  }

  async function adicionar() {
    const nome = novoNome.trim();
    if (!nome) {
      toast.error("Dê um nome pra opção");
      return;
    }
    setBusy(true);
    try {
      // Reaproveita a mesma função de sempre pra criar opção — não existe
      // um segundo jeito de cadastrar só porque isso está no dashboard.
      await saveOpcao({
        data: {
          token,
          empresaId: completa.empresa.id,
          opcao: {
            categoria_opcao_id: categoria.id,
            nome,
            preco_adicional: Number(novoPreco) || 0,
            ordem: opcoes.length,
            ativo: true,
          },
        },
      });
      toast.success("Opção adicionada");
      setNovoNome("");
      setNovoPreco("0");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao adicionar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="bg-brand-red">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="h-4 w-4 text-white" /> {categoria.nome}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {opcoes.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma opção cadastrada nessa categoria ainda.
          </p>
        )}
        {opcoes.map((o) => {
          const efetivo = pendentes[o.id] ?? o.ativo;
          const alterado = o.id in pendentes;
          return (
            <div
              key={o.id}
              className={`flex items-center justify-between gap-2 bg-white rounded-lg border p-2 ${alterado ? "border-brand-red/50 bg-brand-red/5" : ""}`}
            >
              <div className="min-w-0">
                <p className={`truncate text-sm font-medium ${!efetivo ? "text-muted-foreground line-through" : ""}`}>
                  {o.nome}
                </p>
                {o.preco_adicional > 0 && (
                  <p className="text-xs text-muted-foreground">+{brl(o.preco_adicional)}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {efetivo ? "disponível" : "desligada"}
                </span>
                <Switch checked={efetivo} onCheckedChange={(v) => marcarPendente(o, v)} />
              </div>
            </div>
          );
        })}
        {pendentesEntries.length > 0 && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-brand-red/40 bg-brand-red/5 p-2 text-xs">
            <span>
              {pendentesEntries.length} alteração
              {pendentesEntries.length > 1 ? "ões" : ""} pendente
              {pendentesEntries.length > 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPendentes({})}
                disabled={salvando}
              >
                Descartar
              </Button>
              <Button type="button" size="sm" onClick={aplicarPendentes} disabled={salvando}>
                {salvando ? "Salvando..." : "Aplicar alterações"}
              </Button>
            </div>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <Input
          className="bg-white"
            placeholder="Ex: Peixe"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionar();
              }
            }}
          />
          <Input
            type="number"
            step="0.01"
            placeholder="+R$"
            value={novoPreco}
            onChange={(e) => setNovoPreco(e.target.value)}
            className="w-24 bg-white"
          />
          <Button type="button" size="sm" className="border border-2 border-white" onClick={adicionar} disabled={busy}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProdutosTab({
  completa,
  token,
  onSaved,
}: {
  completa: EmpresaCompleta;
  token: string;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState<Produto | null>(null);
  const produtos = completa.produtos;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Produtos</h2>
        <Button
          size="sm"
          onClick={() =>
            setEditing({
              id: "" as any,
              empresa_id: completa.empresa.id,
              categoria_id: completa.categorias[0]?.id ?? null,
              nome: "",
              descricao_curta: "",
              descricao: "",
              preco: 0,
              preco_antigo: null,
              imagem_url: "",
              ingredientes: [],
              nutricao: { kcal: 0, carbs: 0, protein: 0, fat: 0 },
              tempo_preparo: "",
              tag: null,
              ordem: produtos.length,
              ativo: true,
            } as Produto)
          }
        >
          <Plus className="mr-1 h-3 w-3" /> Novo produto
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {produtos.map((p : any) => (
          <ProdutoCardDisplay
            key={p.id}
            p={p}
            onEdit={() => setEditing(p)}
            onDelete={async () => {
              if (!confirm(`Excluir ${p.nome}?`)) return;
              await deleteProduto({
                data: { token, empresaId: completa.empresa.id, produtoId: p.id },
              });
              toast.success("Produto excluído");
              onSaved();
            }}
          />
        ))}
      </div>
      {editing && (
        <ProdutoEditDialog
          completa={completa}
          produto={editing}
          token={token}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onSaved();
          }}
        />
      )}
    </div>
  );
}

function ProdutoCardDisplay({
  p,
  onEdit,
  onDelete,
}: {
  p: Produto;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display font-semibold">{p.nome}</h3>
            <p className="text-xs text-muted-foreground">
              {brl(p.preco)}{" "}
              {p.preco_antigo && (
                <span className="line-through">{brl(p.preco_antigo)}</span>
              )}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button size="sm" variant="outline" onClick={onEdit}>
              Editar
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {p.tag && <Badge>{p.tag}</Badge>}
          {!p.ativo && <Badge variant="secondary">inativo</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}

function ProdutoEditDialog({
  completa,
  produto,
  token,
  onClose,
  onSaved,
}: {
  completa: EmpresaCompleta;
  produto: Produto;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Produto>(produto);
  const [busy, setBusy] = useState(false);
  const isNew = !produto.id;

  const [ingredientesDraft, setIngredientesDraft] = useState<
    { nome: string; removivel: boolean }[]
  >(
    (completa.produtoIngredientes[produto.id] ?? []).map((i : any) => ({
      nome: i.nome,
      removivel: i.removivel,
    })),
  );
  const [novoIngrediente, setNovoIngrediente] = useState("");

  function addIngrediente() {
    const nome = novoIngrediente.trim();
    if (!nome) return;
    setIngredientesDraft((list) => [...list, { nome, removivel: true }]);
    setNovoIngrediente("");
  }

  async function onSave() {
    setBusy(true);
    try {
      const result = await saveProduto({
        data: { token, empresaId: completa.empresa.id, produto: draft },
      });
      const produtoId = isNew ? result.id : produto.id;
      await saveProdutoIngredientes({
        data: {
          token,
          empresaId: completa.empresa.id,
          produtoId,
          itens: ingredientesDraft,
        },
      });
      toast.success(isNew ? "Produto criado" : "Produto atualizado");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{isNew ? "Novo produto" : `Editar: ${produto.nome}`}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Nome</Label>
          <Input
            value={draft.nome}
            onChange={(e) => setDraft({ ...draft, nome: e.target.value })}
          />
        </div>
        <div>
          <Label>Categoria</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={draft.categoria_id ?? ""}
            onChange={(e) =>
              setDraft({ ...draft, categoria_id: e.target.value || null })
            }
          >
            <option value="">—</option>
            {completa.categorias.map((c : any) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <Label>Descrição curta</Label>
          <Input
            value={draft.descricao_curta ?? ""}
            onChange={(e) =>
              setDraft({ ...draft, descricao_curta: e.target.value })
            }
          />
        </div>
        <div className="md:col-span-2">
          <Label>Descrição completa</Label>
          <Textarea
            value={draft.descricao ?? ""}
            onChange={(e) => setDraft({ ...draft, descricao: e.target.value })}
          />
        </div>
        <div>
          <Label>Preço (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={draft.preco}
            onChange={(e) =>
              setDraft({ ...draft, preco: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <Label>Preço antigo (R$, opcional)</Label>
          <Input
            type="number"
            step="0.01"
            value={draft.preco_antigo ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                preco_antigo: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
        </div>
        <div className="md:col-span-2">
          <ImageUploadField
            label="Imagem"
            value={draft.imagem_url ?? ""}
            onChange={(url) => setDraft({ ...draft, imagem_url: url })}
            token={token}
            empresaId={completa.empresa.id}
            pasta="produtos"
          />
        </div>
        <div>
          <Label>Tempo de preparo</Label>
          <Input
            value={draft.tempo_preparo ?? ""}
            onChange={(e) =>
              setDraft({ ...draft, tempo_preparo: e.target.value })
            }
          />
        </div>
        <div>
          <Label>Tag</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={draft.tag ?? ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                tag:
                  (e.target.value as Produto["tag"]) || null,
              })
            }
          >
            <option value="">—</option>
            <option value="mais-vendido">Mais vendido</option>
            <option value="promocao">Promoção</option>
            <option value="novo">Novo</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={draft.ativo}
            onCheckedChange={(v) => setDraft({ ...draft, ativo: v })}
          />
          <Label>Produto ativo (visível no cardápio)</Label>
        </div>
        <div className="md:col-span-2 space-y-2 rounded-lg border p-3">
          <Label>Ingredientes</Label>
          <p className="text-xs text-muted-foreground">
            Marque como "removível" os ingredientes que o cliente pode pedir pra
            tirar. Os que ficarem desmarcados são fixos/obrigatórios. Se não
            cadastrar nenhum, a seção de remover ingrediente não aparece pra
            esse produto no cardápio.
          </p>
          <div className="space-y-1">
            {ingredientesDraft.map((ing, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="flex-1 truncate">{ing.nome}</span>
                <label className="flex items-center gap-1 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={ing.removivel}
                    onChange={(e) =>
                      setIngredientesDraft((list) =>
                        list.map((it, idx) =>
                          idx === i ? { ...it, removivel: e.target.checked } : it,
                        ),
                      )
                    }
                  />
                  removível
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setIngredientesDraft((list) => list.filter((_, idx) => idx !== i))
                  }
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Cebola"
              value={novoIngrediente}
              onChange={(e) => setNovoIngrediente(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addIngrediente();
                }
              }}
            />
            <Button type="button" size="sm" variant="outline" onClick={addIngrediente}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button onClick={onSave} disabled={busy}>
            {busy ? "Salvando..." : "Salvar"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoriasTab({
  completa,
  token,
  onSaved,
}: {
  completa: EmpresaCompleta;
  token: string;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState<Categoria | null>(null);
  function blankCategoria(): Categoria {
    return {
      id: "" as any,
      empresa_id: completa.empresa.id,
      slug: "",
      nome: "",
      emoji: "",
      imagem_url: "",
      ordem: completa.categorias.length,
      ativo: true,
      categorias_opcao_ids: [],
    };
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Categorias</h2>
        <Button size="sm" onClick={() => setEditing(blankCategoria())}>
          <Plus className="mr-1 h-3 w-3" /> Nova categoria
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {completa.categorias.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {c.imagem_url ? (
                  <img
                    src={c.imagem_url}
                    alt={c.nome}
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                ) : null}
                <div>
                  <p className="font-display font-semibold">
                    {!c.imagem_url && c.emoji} {c.nome}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.slug}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {editing && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>
              {editing.id ? "Editar categoria" : "Nova categoria"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Nome</Label>
                <Input
                  value={editing.nome}
                  onChange={(e) =>
                    setEditing({ ...editing, nome: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={editing.slug}
                  onChange={(e) =>
                    setEditing({ ...editing, slug: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Emoji</Label>
                <Input
                  value={editing.emoji ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, emoji: e.target.value })
                  }
                  placeholder="Ex: um emoji de comida"
                />
              </div>
              <div>
                <ImageUploadField
                  label="Imagem (opcional)"
                  value={editing.imagem_url ?? ""}
                  onChange={(url) => setEditing({ ...editing, imagem_url: url })}
                  token={token}
                  empresaId={completa.empresa.id}
                  pasta="categorias"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Se preencher, substitui o emoji no card.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editing.ativo}
                  onCheckedChange={(v) =>
                    setEditing({ ...editing, ativo: v })
                  }
                />
                <Label>Ativa</Label>
              </div>
            </div>
            <div>
              <Label>Adicionais desta categoria</Label>
              <p className="text-xs text-muted-foreground">
                Escolha quais categorias de adicional (criadas na aba
                Personalização) aparecem pros produtos dessa categoria.
              </p>
              {completa.categoriasOpcao.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Você ainda não criou nenhuma categoria de adicional. Vá na
                  aba Personalização pra criar (ex: "Tipo de pão", "Molhos").
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-3">
                  {completa.categoriasOpcao.map((co) => {
                    const checked = editing.categorias_opcao_ids.includes(co.id);
                    return (
                      <label key={co.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              categorias_opcao_ids: e.target.checked
                                ? [...editing.categorias_opcao_ids, co.id]
                                : editing.categorias_opcao_ids.filter((id) => id !== co.id),
                            })
                          }
                        />
                        {co.nome}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  await saveCategoria({
                    data: {
                      token,
                      empresaId: completa.empresa.id,
                      categoria: editing,
                    },
                  });
                  toast.success("Categoria salva");
                  onSaved();
                }}
              >
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PromocoesTab({
  completa,
  onSaved,
}: {
  completa: EmpresaCompleta;
  token: string;
  onSaved: () => void;
}) {
  const tags = ["mais-vendido", "promocao", "novo"] as const;
  const grouped: Record<typeof tags[number], Produto[]> = {
    "mais-vendido": [],
    "promocao": [],
    "novo": [],
  };
  for (const p of completa.produtos) {
    if (p.tag) grouped[p.tag].push(p);
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Promoções do dia</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          A "promoção do dia" na home é o produto com tag{" "}
          <code>promocao</code> em ordem. Defina a ordem dos produtos com tag
          promoção na aba <strong>Produtos</strong> (em breve: dropdown para
          escolher 1 destaque manual). Por enquanto, a primeira opção será a
          usada.
        </p>
        {grouped["promocao"].length === 0 ? (
          <p className="mt-4 text-sm">Nenhum produto marcado como promoção.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {grouped["promocao"].map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span>
                  {p.nome} — {brl(p.preco)}
                </span>
                <Badge>ordem {p.ordem}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function CuponsTab({
  completa,
  token,
  onSaved,
}: {
  completa: EmpresaCompleta;
  token: string;
  onSaved: () => void;
}) {
  const cfg = completa.config;
  const cupons = getCupons(cfg);
  const [draft, setDraft] = useState<Coupon[]>(cupons);

  async function save() {
    const newCfg = { ...cfg, cupons: draft };
    await saveEmpresaConfig({
      data: { token, empresaId: completa.empresa.id, data: newCfg },
    });
    toast.success("Cupons salvos");
    onSaved();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cupons de desconto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {draft.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              placeholder="CÓDIGO"
              value={c.code}
              onChange={(e) => {
                const cp = [...draft];
                cp[i] = { ...c, code: e.target.value.toUpperCase() };
                setDraft(cp);
              }}
            />
            <Input
              type="number"
              placeholder="% desconto"
              value={c.discount}
              onChange={(e) => {
                const cp = [...draft];
                cp[i] = { ...c, discount: Number(e.target.value) };
                setDraft(cp);
              }}
            />
            <Input
              placeholder="Descrição"
              value={c.desc}
              onChange={(e) => {
                const cp = [...draft];
                cp[i] = { ...c, desc: e.target.value };
                setDraft(cp);
              }}
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDraft(draft.filter((_, j) => j !== i))}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setDraft([...draft, { code: "", discount: 10, desc: "" }])
            }
          >
            <Plus className="mr-1 h-3 w-3" /> Adicionar cupom
          </Button>
          <Button onClick={save}>Salvar</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EntregaTab({
  completa,
  token,
  onSaved,
}: {
  completa: EmpresaCompleta;
  token: string;
  onSaved: () => void;
}) {
  const cfg = completa.config;
  const frete = getFrete(cfg);
  const [taxa, setTaxa] = useState(frete.taxa);
  const [gratis, setGratis] = useState(frete.gratis_habilitado);
  const [acimaDe, setAcimaDe] = useState(frete.gratis_acima_de ?? 0);
  const [bairros, setBairros] = useState<Neighborhood[]>(getBairros(cfg));

  async function save() {
    await saveEmpresaConfig({
      data: {
        token,
        empresaId: completa.empresa.id,
        data: {
          ...cfg,
          frete: {
            taxa: Number(taxa),
            gratis_habilitado: !!gratis,
            gratis_acima_de: gratis ? Number(acimaDe) : null,
          },
        },
      },
    });
    toast.success("Configurações de entrega salvas");
    onSaved();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Bairros e taxa de entrega</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Cadastre os bairros que você entrega e o valor de cada um. Se
            tiver pelo menos um bairro aqui, o cardápio público passa a
            pedir rua, número e bairro (em vez de endereço livre), e a taxa
            de entrega é calculada automaticamente pelo bairro escolhido —
            a "Taxa de entrega" fixa abaixo deixa de ser usada.
          </p>
          {bairros.map((b, i) => (
            <div key={b.id} className="flex items-center gap-2">
              <Input
                placeholder="Nome do bairro"
                value={b.name}
                onChange={(e) => {
                  const cp = [...bairros];
                  cp[i] = { ...b, name: e.target.value };
                  setBairros(cp);
                }}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Taxa (R$)"
                value={b.fee}
                onChange={(e) => {
                  const cp = [...bairros];
                  cp[i] = { ...b, fee: Number(e.target.value) };
                  setBairros(cp);
                }}
                className="w-32"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBairros(bairros.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setBairros([...bairros, { id: crypto.randomUUID(), name: "", fee: 0 }])
            }
          >
            <Plus className="mr-1 h-3 w-3" /> Adicionar bairro
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Taxa de entrega fixa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            {bairros.length > 0
              ? "Como você tem bairros cadastrados acima, essa taxa fixa não é mais usada — fica aqui só de reserva caso você apague todos os bairros."
              : "Usada enquanto você não cadastrar nenhum bairro acima."}
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <Label>Taxa de entrega (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={taxa}
                onChange={(e) => setTaxa(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Frete grátis acima de (R$)</Label>
              <Input
                type="number"
                step="0.01"
                disabled={!gratis}
                value={acimaDe}
                onChange={(e) => setAcimaDe(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={gratis} onCheckedChange={setGratis} />
              <Label>Frete grátis habilitado</Label>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            O "frete grátis acima de" vale mesmo com bairros cadastrados —
            passando desse valor, a entrega fica grátis não importa o bairro.
          </p>
        </CardContent>
      </Card>

      <Button onClick={save}>Salvar</Button>
    </div>
  );
}

function PersonalizacaoTab({
  completa,
  token,
  onSaved,
}: {
  completa: EmpresaCompleta;
  token: string;
  onSaved: () => void;
}) {
  const [criando, setCriando] = useState(false);
  const categorias = [...completa.categoriasOpcao].sort((a, b) => a.ordem - b.ordem);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">
            Categorias de adicional
          </h2>
          <p className="text-xs text-muted-foreground">
            Crie quantas categorias quiser (ex: "Tipo de pão", "Sabor da
            massa", "Molhos") e escolha se o cliente pode marcar uma ou
            várias opções. Depois, ligue cada categoria às categorias de
            produto na aba Categorias.
          </p>
        </div>
        <Button size="sm" onClick={() => setCriando(true)}>
          <Plus className="mr-1 h-3 w-3" /> Nova categoria de adicional
        </Button>
      </div>
      {criando && (
        <CategoriaOpcaoEditor
          completa={completa}
          token={token}
          categoriaOpcao={{
            id: "" as any,
            empresa_id: completa.empresa.id,
            slug: "",
            nome: "",
            selecao: "unica",
            obrigatorio: false,
            ordem: categorias.length,
            destaque_dashboard: false,
          }}
          onDone={() => {
            setCriando(false);
            onSaved();
          }}
          onCancel={() => setCriando(false)}
        />
      )}
      {categorias.length === 0 && !criando && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma categoria de adicional criada ainda.
          </CardContent>
        </Card>
      )}
      {categorias.map((co) => (
        <OpcoesSection
          key={co.id}
          categoriaOpcao={co}
          items={completa.opcoes.filter((o: any) => o.categoria_opcao_id === co.id)}
          completa={completa}
          token={token}
          onSaved={onSaved}
        />
      ))}
    </div>
  );
}

// Form de criar/editar uma categoria de adicional (nome, seleção única ou
// múltipla, obrigatória ou não).
function CategoriaOpcaoEditor({
  completa,
  token,
  categoriaOpcao,
  onDone,
  onCancel,
}: {
  completa: EmpresaCompleta;
  token: string;
  categoriaOpcao: CategoriaOpcao;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(categoriaOpcao);
  const [busy, setBusy] = useState(false);
  const isNew = !categoriaOpcao.id;

  function slugify(nome: string) {
    return nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function save() {
    if (!draft.nome.trim()) {
      toast.error("Dê um nome pra categoria");
      return;
    }
    setBusy(true);
    try {
      await saveCategoriaOpcao({
        data: {
          token,
          empresaId: completa.empresa.id,
          categoriaOpcao: {
            ...draft,
            slug: draft.slug || slugify(draft.nome),
          },
        },
      });
      toast.success(isNew ? "Categoria criada" : "Categoria atualizada");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isNew ? "Nova categoria de adicional" : `Editar: ${categoriaOpcao.nome}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <div>
          <Label>Nome (ex: Tipo de pão)</Label>
          <Input
            value={draft.nome}
            onChange={(e) => setDraft({ ...draft, nome: e.target.value })}
          />
        </div>
        <div>
          <Label>Tipo de seleção</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={draft.selecao}
            onChange={(e) =>
              setDraft({ ...draft, selecao: e.target.value as "unica" | "multipla" })
            }
          >
            <option value="unica">Única (só uma opção)</option>
            <option value="multipla">Múltipla (pode marcar várias)</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={draft.obrigatorio}
            onCheckedChange={(v) => setDraft({ ...draft, obrigatorio: v })}
          />
          <Label>Obrigatório escolher</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={draft.destaque_dashboard}
            onCheckedChange={(v) => setDraft({ ...draft, destaque_dashboard: v })}
          />
          <div>
            <Label>Aparece no início do painel</Label>
            <p className="text-xs text-muted-foreground">
              Pra categorias que mudam de disponibilidade todo dia (ex:
              "Escolha a carne") — fica com um atalho rápido de liga/desliga
              na home do painel.
            </p>
          </div>
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button onClick={save} disabled={busy}>
            {busy ? "Salvando..." : "Salvar"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OpcoesSection({
  categoriaOpcao,
  items,
  completa,
  token,
  onSaved,
}: {
  categoriaOpcao: CategoriaOpcao;
  items: OpcaoPersonalizacao[];
  completa: EmpresaCompleta;
  token: string;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState(items);
  const [editandoCategoria, setEditandoCategoria] = useState(false);

  async function save() {
    const newIds = new Set(draft.map((d) => d.id).filter(Boolean));
    for (const o of items) {
      if (!newIds.has(o.id)) {
        await deleteOpcao({
          data: {
            token,
            empresaId: completa.empresa.id,
            opcaoId: o.id,
          },
        });
      }
    }
    for (const o of draft) {
      await saveOpcao({
        data: {
          token,
          empresaId: completa.empresa.id,
          opcao: { ...o, categoria_opcao_id: categoriaOpcao.id },
        },
      });
    }
    toast.success(`${categoriaOpcao.nome} atualizado`);
    onSaved();
  }
  async function excluirCategoria() {
    if (
      !confirm(
        `Excluir a categoria "${categoriaOpcao.nome}" e todas as suas opções?`,
      )
    )
      return;
    await deleteCategoriaOpcao({
      data: { token, empresaId: completa.empresa.id, categoriaOpcaoId: categoriaOpcao.id },
    });
    toast.success("Categoria excluída");
    onSaved();
  }
  if (editandoCategoria) {
    return (
      <CategoriaOpcaoEditor
        completa={completa}
        token={token}
        categoriaOpcao={categoriaOpcao}
        onDone={() => {
          setEditandoCategoria(false);
          onSaved();
        }}
        onCancel={() => setEditandoCategoria(false)}
      />
    );
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {categoriaOpcao.nome}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            ({categoriaOpcao.selecao === "multipla" ? "múltipla escolha" : "escolha única"}
            {categoriaOpcao.obrigatorio ? ", obrigatório" : ""})
          </span>
        </CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditandoCategoria(true)}>
            Editar categoria
          </Button>
          <Button size="sm" variant="destructive" onClick={excluirCategoria}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {draft.map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              placeholder="Nome"
              value={o.nome}
              onChange={(e) => {
                const cp = [...draft];
                cp[i] = { ...o, nome: e.target.value };
                setDraft(cp);
              }}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="+R$"
              value={o.preco_adicional}
              onChange={(e) => {
                const cp = [...draft];
                cp[i] = { ...o, preco_adicional: Number(e.target.value) };
                setDraft(cp);
              }}
            />
            <div className="flex shrink-0 items-center gap-1" title="Liga/desliga — clique em Salvar pra aplicar">
              <Switch
                checked={o.ativo}
                onCheckedChange={(v) => {
                  const cp = [...draft];
                  cp[i] = { ...o, ativo: v };
                  setDraft(cp);
                }}
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDraft(draft.filter((_, j) => j !== i))}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setDraft([
                ...draft,
                {
                  id: "" as any,
                  empresa_id: completa.empresa.id,
                  categoria_opcao_id: categoriaOpcao.id,
                  nome: "",
                  preco_adicional: 0,
                  ordem: draft.length,
                  ativo: true,
                },
              ])
            }
          >
            <Plus className="mr-1 h-3 w-3" /> Adicionar opção
          </Button>
          <Button size="sm" onClick={save}>
            Salvar {categoriaOpcao.nome}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ConfigTab({
  completa,
  token,
  onSaved,
}: {
  completa: EmpresaCompleta;
  token: string;
  onSaved: () => void;
}) {
  const empresa = completa.empresa;
  const cfg = completa.config;
  const cores = getCores(cfg);

  const [nome, setNome] = useState(empresa.nome);
  const [whatsapp, setWhatsapp] = useState(empresa.whatsapp);
  const [endereco, setEndereco] = useState(empresa.endereco ?? "");
  const [pixChave, setPixChave] = useState(empresa.pix_chave ?? "");
  const [logoUrl, setLogoUrl] = useState(empresa.logo_url ?? "");

  const [primary, setPrimary] = useState(cores.primary);
  const [accent, setAccent] = useState(cores.accent);
  const [bg, setBg] = useState(cores.bg);
  const [fg, setFg] = useState(cores.fg);

  const [cidade, setCidade] = useState(getCidadeEntrega(cfg));

  const [horarios, setHorarios] = useState<DayHours[]>(() => getHorarios(cfg));

  async function saveAll() {
    await updateEmpresa({
      data: {
        token,
        empresaId: empresa.id,
        patch: {
          nome,
          whatsapp,
          endereco,
          pix_chave: pixChave,
          logo_url: logoUrl,
        },
      },
    });
    await saveEmpresaConfig({
      data: {
        token,
        empresaId: empresa.id,
        data: {
          ...cfg,
          cores: { primary, accent, bg, fg },
          cidade_entrega: cidade,
          horarios: Object.fromEntries(
            horarios.map((h) => [
              ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"][
                h.day
              ],
              {
                abre: h.open,
                fecha: h.close,
                fechado: h.closed,
              },
            ]),
          ),
        },
      },
    });
    toast.success("Configurações salvas");
    onSaved();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identidade</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input
              value={whatsapp}
              onChange={(e) =>
                setWhatsapp(e.target.value.replace(/\D/g, ""))
              }
            />
          </div>
          <div className="md:col-span-2">
            <Label>Endereço</Label>
            <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} />
          </div>
          <div>
            <Label>Chave Pix</Label>
            <Input value={pixChave} onChange={(e) => setPixChave(e.target.value)} />
          </div>
          <div>
            <ImageUploadField
              label="Logo"
              value={logoUrl}
              onChange={setLogoUrl}
              token={token}
              empresaId={empresa.id}
              pasta="logo"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Cidade de entrega (default no checkout)</Label>
            <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cores da marca</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div>
            <Label>Primária</Label>
            <Input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">{primary}</p>
          </div>
          <div>
            <Label>Accent</Label>
            <Input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">{accent}</p>
          </div>
          <div>
            <Label>Fundo</Label>
            <Input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">{bg}</p>
          </div>
          <div>
            <Label>Texto</Label>
            <Input type="color" value={fg} onChange={(e) => setFg(e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">{fg}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horário de funcionamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {horarios.map((h, i) => (
            <div key={h.day} className="flex flex-wrap items-center gap-3">
              <span className="w-24 text-sm font-semibold">{h.label}</span>
              <Switch
                checked={!h.closed}
                onCheckedChange={(v) => {
                  const cp = [...horarios];
                  cp[i] = { ...h, closed: !v };
                  setHorarios(cp);
                }}
              />
              <Input
                type="time"
                value={h.open}
                onChange={(e) => {
                  const cp = [...horarios];
                  cp[i] = { ...h, open: e.target.value };
                  setHorarios(cp);
                }}
                disabled={h.closed}
                className="w-28"
              />
              <span>até</span>
              <Input
                type="time"
                value={h.close}
                onChange={(e) => {
                  const cp = [...horarios];
                  cp[i] = { ...h, close: e.target.value };
                  setHorarios(cp);
                }}
                disabled={h.closed}
                className="w-28"
              />
              {h.closed && (
                <Badge variant="secondary">fechado</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={saveAll}>Salvar tudo</Button>
    </div>
  );
}

// ============================================================================
// Pedidos
// ============================================================================

const STATUS_OPTIONS: Pedido["status"][] = [
  "recebido",
  "preparando",
  "pronto",
  "entregue",
  "cancelado",
];

const FORMA_PAGAMENTO_LABELS: Record<NonNullable<Pedido["forma_pagamento"]>, string> = {
  pix: "Pix",
  cartao: "Cartão (na entrega)",
  dinheiro: "Dinheiro",
};

const STATUS_LABELS: Record<Pedido["status"], string> = {
  recebido: "Recebido",
  preparando: "Preparando",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const STATUS_BADGE_VARIANT: Record<
  Pedido["status"],
  "default" | "secondary" | "destructive"
> = {
  recebido: "secondary",
  preparando: "default",
  pronto: "default",
  entregue: "secondary",
  cancelado: "destructive",
};

function PedidosTab({
  completa,
  token,
}: {
  completa: EmpresaCompleta;
  token: string;
}) {
  const empresaId = completa.empresa.id;
  const {
    data: pedidos = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["pedidos-empresa", empresaId],
    queryFn: () => listPedidosEmpresa({ data: { token, empresaId } }),
    enabled: !!token && !!empresaId,
    refetchInterval: 30_000,
  });

  async function mudarStatus(pedidoId: string, status: Pedido["status"]) {
    try {
      await updatePedidoStatus({ data: { token, empresaId, pedidoId, status } });
      toast.success("Status atualizado");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar status");
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando pedidos...</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Pedidos</h2>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Atualizar
        </Button>
      </div>
      {pedidos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhum pedido recebido ainda.
          </CardContent>
        </Card>
      ) : (
        pedidos.map((p) => (
          <Card key={p.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display font-semibold">
                    #{p.numero} · {p.cliente_nome}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.cliente_telefone}
                    {p.endereco ? ` · ${p.endereco}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.criado_em).toLocaleString("pt-BR")}
                  </p>
                </div>
                <Badge variant={STATUS_BADGE_VARIANT[p.status]}>
                  {STATUS_LABELS[p.status]}
                </Badge>
              </div>
              <ul className="space-y-1 text-sm">
                {p.itens.map((it, i) => (
                  <li key={i} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">
                      {it.qtd}x {it.nome}
                      {it.obs ? ` (${it.obs})` : ""}
                    </span>
                    <span>{brl(it.preco_unit * it.qtd)}</span>
                  </li>
                ))}
              </ul>
              {p.forma_pagamento && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Pagamento: </span>
                  <strong>{FORMA_PAGAMENTO_LABELS[p.forma_pagamento]}</strong>
                  {p.forma_pagamento === "dinheiro" && p.troco_para != null && (
                    <span className="text-muted-foreground">
                      {" "}— troco pra {brl(p.troco_para)} (levar {brl(p.troco_para - p.valor_total)})
                    </span>
                  )}
                </p>
              )}
              <div className="flex justify-between border-t pt-2 text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display font-semibold">{brl(p.valor_total)}</span>
              </div>
              {p.forma_pagamento && (
                <div className="flex items-center gap-1 text-sm">
                  <Badge variant="outline">
                    {p.forma_pagamento === "pix" && "Pix"}
                    {p.forma_pagamento === "cartao" && "Cartão"}
                    {p.forma_pagamento === "dinheiro" &&
                      (p.troco_para
                        ? `Dinheiro · troco para ${brl(p.troco_para)}`
                        : "Dinheiro · sem troco")}
                  </Badge>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Label className="text-xs text-muted-foreground">Status:</Label>
                <select
                  className="flex h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={p.status}
                  onChange={(e) =>
                    mudarStatus(p.id, e.target.value as Pedido["status"])
                  }
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

// ============================================================================
// Conta / Plano
// ============================================================================

function ContaTab({
  completa,
  token,
}: {
  completa: EmpresaCompleta;
  token: string;
}) {
  const empresaId = completa.empresa.id;
  const { data, isLoading } = useQuery({
    queryKey: ["plano-empresa", empresaId],
    queryFn: () => getPlanoDaEmpresa({ data: { token, empresaId } }),
    enabled: !!token && !!empresaId,
  });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">Carregando plano...</p>;
  }

  const { plano, status_pagamento, produtos_usados } = data;
  const limite = plano.limite_produtos;
  const statusLabel =
    status_pagamento === "ativo"
      ? "Ativa"
      : status_pagamento === "atrasado"
        ? "Atrasada"
        : "Suspensa";
  const statusVariant =
    status_pagamento === "ativo"
      ? ("default" as const)
      : status_pagamento === "atrasado"
        ? ("secondary" as const)
        : ("destructive" as const);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Plano atual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-semibold">{plano.nome}</p>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{brl(plano.preco_mensal)}/mês</p>
          <div className="text-sm">
            <p>
              Produtos usados: <strong>{produtos_usados}</strong>
              {limite != null ? ` de ${limite}` : " (sem limite)"}
            </p>
            {limite != null && (
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${Math.min(100, (produtos_usados / limite) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>{plano.tem_shopping ? "✅" : "—"} Shopping da Mata</li>
            <li>{plano.tem_destaque ? "✅" : "—"} Destaque pago</li>
            <li>{plano.tem_tv ? "✅" : "—"} Painel para TV</li>
          </ul>
        </CardContent>
      </Card>
      {status_pagamento !== "ativo" && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="p-4 text-sm text-destructive">
            Sua assinatura está {statusLabel.toLowerCase()}. Fale com a plataforma pra
            regularizar.
          </CardContent>
        </Card>
      )}
      <p className="text-xs text-muted-foreground">
        Quer fazer upgrade de plano? Fale com a plataforma pelo suporte.
      </p>
    </div>
  );
}

// ============================================================================
// Segurança
// ============================================================================

function SegurancaTab({ token }: { token: string }) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSave() {
    if (novaSenha.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não são iguais");
      return;
    }
    setBusy(true);
    try {
      await changeOwnPassword({ data: { token, novaSenha } });
      toast.success("Senha alterada com sucesso");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao trocar senha");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trocar senha</CardTitle>
      </CardHeader>
      <CardContent className="max-w-sm space-y-4">
        <p className="text-sm text-muted-foreground">
          Se você entrou com a senha padrão que veio no cadastro, aproveita e
          já troca por uma senha só sua.
        </p>
        <div>
          <Label>Nova senha</Label>
          <Input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <div>
          <Label>Confirmar nova senha</Label>
          <Input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />
        </div>
        <Button onClick={onSave} disabled={busy}>
          {busy ? "Salvando..." : "Salvar nova senha"}
        </Button>
      </CardContent>
    </Card>
  );
}
