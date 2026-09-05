import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Package, Layers, ClipboardList, Settings2, UserCircle, ShieldCheck, Sparkles } from "lucide-react";
import { brl } from "@/lib/format";
import {
  useDashboardResumo,
  useOpcoesDestaqueDashboard,
  type EmpresaCompleta,
  type CategoriaOpcao,
  type OpcaoPersonalizacao,
} from "@/lib/admin-store";
import { listPedidosEmpresa, toggleOpcaoAtiva, saveOpcao } from "@/lib/admin-server";

// Cards de atalho pras outras seções do painel, mostrados na home.
const ATALHOS = [
  { tab: "produtos", label: "Produtos", icon: Package },
  { tab: "categorias", label: "Categorias", icon: Layers },
  { tab: "pedidos", label: "Pedidos", icon: ClipboardList },
  { tab: "config", label: "Configurações", icon: Settings2 },
  { tab: "conta", label: "Conta", icon: UserCircle },
  { tab: "seguranca", label: "Segurança", icon: ShieldCheck },
] as const;

export function InicioTab({
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
