import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { type EmpresaCompleta, type CategoriaOpcao, type OpcaoPersonalizacao } from "@/lib/admin-store";
import {
  saveCategoriaOpcao,
  deleteCategoriaOpcao,
  saveOpcao,
  deleteOpcao,
} from "@/lib/admin-server";

export function PersonalizacaoTab({
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
