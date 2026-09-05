import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, Menu, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuthSession } from "@/lib/auth-session";
import { useEmpresaAdmin, useInvalidateEmpresa } from "@/lib/admin-store";
import { InicioTab } from "@/components/painel/InicioTab";
import { ProdutosTab } from "@/components/painel/ProdutosTab";
import { CategoriasTab } from "@/components/painel/CategoriasTab";
import { PedidosTab } from "@/components/painel/PedidosTab";
import { PromocoesTab } from "@/components/painel/PromocoesTab";
import { CuponsTab } from "@/components/painel/CuponsTab";
import { EntregaTab } from "@/components/painel/EntregaTab";
import { PersonalizacaoTab } from "@/components/painel/PersonalizacaoTab";
import { ConfigTab } from "@/components/painel/ConfigTab";
import { ContaTab } from "@/components/painel/ContaTab";
import { SegurancaTab } from "@/components/painel/SegurancaTab";

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

// Esta rota só monta a casca do painel (header, menu, abas) e delega o
// conteúdo de cada aba pro componente correspondente em
// src/components/painel/*Tab.tsx. Mantemos isso separado pra esse arquivo
// não virar um monólito de +2000 linhas com todas as telas juntas.
function PainelTenant() {
  const { empresaSlug } = Route.useParams();
  const session = useAuthSession((s) => s.session);
  const clear = useAuthSession((s) => s.clear);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inicio");
  const [navOpen, setNavOpen] = useState(false);

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
