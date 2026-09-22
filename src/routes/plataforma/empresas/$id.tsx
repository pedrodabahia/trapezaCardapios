import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadField } from "@/components/ImageUploadField";
import {
  listEmpresasAdmin,
  listPlanos,
  updateEmpresaStatus,
  updateEmpresaPlataforma,
  saveEmpresaConfigPlataforma,
  getConfigsEmpresas,
  deleteEmpresa,
  changeClientPassword,
  type Empresa,
  type EmpresaPlataformaPatch,
} from "@/lib/admin-server";
import { getHorarios, type DayHours } from "@/lib/admin-store";
import { useAuthSession } from "@/lib/auth-session";
import { CATEGORIAS_NEGOCIO, useCategoriasNegocio } from "@/lib/categorias-negocio";

export const Route = createFileRoute("/plataforma/empresas/$id")({
  beforeLoad: () => {
    const session = useAuthSession.getState().session;
    if (!session || session.role !== "super_admin") {
      throw redirect({ to: "/plataforma/login" });
    }
  },
  component: EmpresaDetail,
});

function EmpresaDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const session = useAuthSession((s) => s.session);
  const [busy, setBusy] = useState(false);

  const { data: empresas = [], refetch } = useQuery({
    queryKey: ["plataforma-empresas"],
    queryFn: () =>
      listEmpresasAdmin({ data: { token: session!.accessToken } }),
    enabled: !!session,
  });

  const empresa = empresas.find((e) => e.id === id);
  
  if (!session) return null;
  if (!empresa) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center">
        <p>Empresa não encontrada.</p>
        <Link to="/plataforma" className="mt-4 inline-block underline">
          Voltar
        </Link>
      </div>
    );
  }

  const ehExterna = empresa.tipo === "externa";

  async function setStatus(status: "ativo" | "atrasado" | "suspenso") {
    setBusy(true);
    try {
      await updateEmpresaStatus({
        data: {
          token: session!.accessToken,
          empresaId: empresa!.id,
          status,
        },
      });
      toast.success(`Status atualizado para ${status}.`);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!confirm(`Excluir empresa ${empresa!.nome}? Esta ação é irreversível.`))
      return;
    setBusy(true);
    try {
      await deleteEmpresa({
        data: { token: session!.accessToken, empresaId: empresa!.id },
      });
      toast.success("Empresa excluída.");
      navigate({ to: "/plataforma" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-bold">{empresa.nome}</h1>
            <Badge variant={ehExterna ? "outline" : "secondary"}>
              {ehExterna ? "Externa" : "Trapeza"}
            </Badge>
            <Badge
              variant={
                empresa.status_pagamento === "ativo"
                  ? "default"
                  : empresa.status_pagamento === "atrasado"
                    ? "secondary"
                    : "destructive"
              }
            >
              {empresa.status_pagamento}
            </Badge>
          </div>
          <Link to="/plataforma">
            <Button variant="outline" size="sm">
              ← Voltar
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!ehExterna && (
              <div>
                <span className="text-muted-foreground">Slug: </span>
                <code className="rounded bg-muted px-1.5 py-0.5">
                  /s/{empresa.slug}
                </code>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Criada em: </span>
              {new Date(empresa.criado_em!).toLocaleString("pt-BR")}
            </div>
          </CardContent>
        </Card>

        <PerfilDiretorioCard
          token={session.accessToken}
          empresa={empresa}
          ehExterna={ehExterna}
          onSaved={refetch}
        />

        <PlanoCard
          token={session.accessToken}
          empresa={empresa}
          onSaved={refetch}
        />

        <HorarioCard token={session.accessToken} empresaId={empresa.id} />

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              variant={empresa.status_pagamento === "ativo" ? "default" : "outline"}
              onClick={() => setStatus("ativo")}
              disabled={busy}
            >
              Ativo
            </Button>
            {!ehExterna && (
              <Button
                variant={
                  empresa.status_pagamento === "atrasado" ? "default" : "outline"
                }
                onClick={() => setStatus("atrasado")}
                disabled={busy}
              >
                Atrasado
              </Button>
            )}
            <Button
              variant={
                empresa.status_pagamento === "suspenso" ? "default" : "outline"
              }
              onClick={() => setStatus("suspenso")}
              disabled={busy}
            >
              Suspenso (não aparece na home)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acesso rápido</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <a
              href={`/empresa/${empresa.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
            >
              Ver página da empresa
            </a>
            {ehExterna ? (
              empresa.url_externa && (
                <a
                  href={empresa.url_externa}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold"
                >
                  Visitar site da empresa
                </a>
              )
            ) : (
              <>
                <a
                  href={`/s/${empresa.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold"
                >
                  Ver cardápio público
                </a>
                <Link
                  to="/painel/login"
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold"
                >
                  Página de login do admin
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        {!ehExterna && <TrocarSenhaCard token={session.accessToken} empresaId={empresa.id} />}

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de perigo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              {ehExterna
                ? "Remove essa empresa do diretório do Trapeza. Não afeta o site/sistema próprio dela."
                : "Excluir a empresa remove cardápio, categorias, configurações e pedidos associados. Esta ação é irreversível."}
            </p>
            <Button variant="destructive" onClick={onDelete} disabled={busy}>
              Excluir empresa
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Perfil que aparece no diretório da home (nome, categoria, cidade,
// logo/capa, descrição, destaque e — só pra empresa externa — a URL de
// saída). Serve tanto pra empresa Trapeza quanto externa.
function PerfilDiretorioCard({
  token,
  empresa,
  ehExterna,
  onSaved,
}: {
  token: string;
  empresa: Empresa;
  ehExterna: boolean;
  onSaved: () => void;
}) {
  const { data: categoriasNegocio = CATEGORIAS_NEGOCIO } = useCategoriasNegocio();
  const [nome, setNome] = useState(empresa.nome);
  const [categorias, setCategorias] = useState<string[]>(empresa.categorias ?? []);
  const [cidade, setCidade] = useState(empresa.cidade ?? "");
  const [bairro, setBairro] = useState(empresa.bairro ?? "");
  const [endereco, setEndereco] = useState(empresa.endereco ?? "");
  const [whatsapp, setWhatsapp] = useState(empresa.whatsapp ?? "");
  const [descricao, setDescricao] = useState(empresa.descricao ?? "");
  const [logoUrl, setLogoUrl] = useState(empresa.logo_url ?? "");
  const [capaUrl, setCapaUrl] = useState(empresa.capa_url ?? "");
  const [urlExterna, setUrlExterna] = useState(empresa.url_externa ?? "");
  const [palavrasChave, setPalavrasChave] = useState(empresa.palavras_chave ?? "");
  const [destaque, setDestaque] = useState(empresa.destaque);
  const [busy, setBusy] = useState(false);

  async function onSave() {
    setBusy(true);
    try {
      const patch: EmpresaPlataformaPatch = {
        nome,
        categorias,
        cidade: cidade || null,
        bairro: bairro || null,
        endereco: endereco || null,
        whatsapp: whatsapp || null,
        descricao: descricao || null,
        logo_url: logoUrl || null,
        capa_url: capaUrl || null,
        palavras_chave: palavrasChave || null,
        destaque,
      };
      if (ehExterna) patch.url_externa = urlExterna.trim();
      await updateEmpresaPlataforma({
        data: { token, empresaId: empresa.id, patch },
      });
      toast.success("Perfil atualizado");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar perfil");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil no diretório (home)</CardTitle>
        <p className="text-sm text-muted-foreground">
          O que aparece nos cards e filtros da página inicial do Trapeza.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div>
            <Label>Categorias</Label>
            <p className="mb-2 text-xs text-muted-foreground">Pode marcar mais de uma.</p>
            <div className="flex flex-wrap gap-2">
              {categoriasNegocio.map((c) => {
                const marcada = categorias.includes(c.valor);
                return (
                  <button
                    key={c.valor}
                    type="button"
                    onClick={() =>
                      setCategorias((atual) =>
                        marcada ? atual.filter((v) => v !== c.valor) : [...atual, c.valor],
                      )
                    }
                    className={
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition " +
                      (marcada
                        ? "border-foreground bg-foreground text-background"
                        : "border-input bg-background text-foreground")
                    }
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <Label>Cidade</Label>
            <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
          </div>
          <div>
            <Label>Bairro (opcional)</Label>
            <Input value={bairro} onChange={(e) => setBairro(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Endereço</Label>
            <Input
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, número, bairro — usado no mapa da página da empresa"
            />
          </div>
          <div>
            <Label>WhatsApp {ehExterna && "(opcional)"}</Label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          {ehExterna && (
            <div>
              <Label>URL externa</Label>
              <Input
                type="url"
                value={urlExterna}
                onChange={(e) => setUrlExterna(e.target.value)}
                placeholder="https://www.exemplo.com.br"
              />
            </div>
          )}
          <ImageUploadField
            label="Logo"
            value={logoUrl}
            onChange={setLogoUrl}
            token={token}
            empresaId={empresa.id}
            pasta="logo"
            plataforma
          />
          <ImageUploadField
            label="Capa/imagem"
            value={capaUrl}
            onChange={setCapaUrl}
            token={token}
            empresaId={empresa.id}
            pasta="capa"
            plataforma
          />
        </div>
        <div>
          <Label>Descrição curta</Label>
          <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>
        <div>
          <Label>Palavras-chave de busca (opcional)</Label>
          <p className="mb-1 text-xs text-muted-foreground">
            Separadas por vírgula — somam com o que a busca já compara (nome,
            categoria, cidade). Ex: "bebidas, gelo, água, cerveja,
            distribuidora em Posto da Mata".
          </p>
          <Textarea
            value={palavrasChave}
            onChange={(e) => setPalavrasChave(e.target.value)}
            placeholder="bebidas, gelo, água, cerveja"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={destaque} onCheckedChange={setDestaque} />
          <Label>Destaque na home (aparece em "Empresas em destaque")</Label>
        </div>
        <Button onClick={onSave} disabled={busy}>
          {busy ? "Salvando..." : "Salvar perfil"}
        </Button>
      </CardContent>
    </Card>
  );
}

// Editor de horário de funcionamento pra QUALQUER empresa (trapeza ou
// externa), pelo super-admin. Mesma UI/lógica que já existe no painel do
// tenant (aba Config), só que salvando via saveEmpresaConfigPlataforma
// (autorização de super-admin) em vez de saveEmpresaConfig (autorização
// de dono da empresa) — empresa externa não tem login próprio pra usar a
// segunda opção.
function HorarioCard({ token, empresaId }: { token: string; empresaId: string }) {
  const { data: configs, refetch } = useQuery({
    queryKey: ["config-empresa-plataforma", empresaId],
    queryFn: () => getConfigsEmpresas({ data: { empresaIds: [empresaId] } }),
  });
  const cfg = configs?.[empresaId] ?? {};
  const [horarios, setHorarios] = useState<DayHours[] | null>(null);
  const [busy, setBusy] = useState(false);

  // Só inicializa o estado local quando o config chegar pela primeira vez
  // (evita sobrescrever edição em andamento se o refetch disparar de novo).
  if (horarios === null && configs) {
    setHorarios(getHorarios(cfg));
  }

  async function onSave() {
    if (!horarios) return;
    setBusy(true);
    try {
      await saveEmpresaConfigPlataforma({
        data: {
          token,
          empresaId,
          data: {
            ...cfg,
            horarios: Object.fromEntries(
              horarios.map((h) => [
                ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"][h.day],
                { abre: h.open, fecha: h.close, fechado: h.closed },
              ]),
            ),
          },
        },
      });
      toast.success("Horário salvo");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar horário");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horário de funcionamento</CardTitle>
        <p className="text-sm text-muted-foreground">
          Usado pro selo "Aberto agora"/"Fechado" na home e na página da
          empresa.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {!horarios ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <>
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
                {h.closed && <Badge variant="secondary">fechado</Badge>}
              </div>
            ))}
            <Button onClick={onSave} disabled={busy} className="mt-2">
              {busy ? "Salvando..." : "Salvar horário"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Troca o plano da empresa (ex: Gratuito <-> com cardápio Trapeza). Isso
// é o que decide, no painel do próprio tenant, se ele vê só o formulário
// básico (PainelGratuito) ou o painel completo com produtos/pedidos/etc
// — ver a checagem `plano?.gratuito` em routes/painel/$empresaSlug.tsx.
function PlanoCard({
  token,
  empresa,
  onSaved,
}: {
  token: string;
  empresa: Empresa;
  onSaved: () => void;
}) {
  const { data: planos = [] } = useQuery({
    queryKey: ["planos"],
    queryFn: () => listPlanos({ data: {} as Record<string, never> }),
  });
  const [planoId, setPlanoId] = useState(empresa.plano_id);
  const [busy, setBusy] = useState(false);

  const planoAtual = planos.find((p) => p.id === empresa.plano_id);

  async function onSave() {
    setBusy(true);
    try {
      await updateEmpresaPlataforma({
        data: { token, empresaId: empresa.id, patch: { plano_id: planoId } },
      });
      toast.success("Plano atualizado");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao trocar plano");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plano</CardTitle>
        <p className="text-sm text-muted-foreground">
          No plano gratuito, o painel dessa empresa só mostra o formulário
          básico (nome, logo, capa, endereço, horário) — sem cardápio,
          produtos ou pedidos.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {planoAtual && (
          <p className="text-sm">
            Plano atual: <strong>{planoAtual.nome}</strong>
            {planoAtual.gratuito && " (gratuito)"}
          </p>
        )}
        <div className="max-w-xs">
          <Label>Trocar para</Label>
          <Select value={planoId} onValueChange={setPlanoId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {planos.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome} — R$ {Number(p.preco_mensal).toFixed(2)}/mês
                  {p.gratuito ? " (gratuito)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onSave} disabled={busy || planoId === empresa.plano_id}>
          {busy ? "Salvando..." : "Salvar plano"}
        </Button>
      </CardContent>
    </Card>
  );
}

// Reseta a senha do admin dessa empresa — usado quando o cliente esquece a
// senha ou pra trocar a senha padrão que veio no cadastro, se ele não
// trocou sozinho no painel dele.
function TrocarSenhaCard({ token, empresaId }: { token: string; empresaId: string }) {
  const [novaSenha, setNovaSenha] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSave() {
    if (novaSenha.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres");
      return;
    }
    setBusy(true);
    try {
      await changeClientPassword({ data: { token, empresaId, novaSenha } });
      toast.success("Senha do cliente atualizada");
      setNovaSenha("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao trocar senha");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trocar senha do cliente</CardTitle>
      </CardHeader>
      <CardContent className="max-w-sm space-y-3">
        <p className="text-sm text-muted-foreground">
          Define uma senha nova pro admin dessa empresa entrar no painel dele.
          Avise o cliente pelo WhatsApp depois de trocar.
        </p>
        <div>
          <Label>Nova senha</Label>
          <Input
            type="text"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <Button onClick={onSave} disabled={busy}>
          {busy ? "Salvando..." : "Salvar senha"}
        </Button>
      </CardContent>
    </Card>
  );
}
