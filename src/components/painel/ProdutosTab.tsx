import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUploadField } from "@/components/ImageUploadField";
import { Plus, Trash2, Search } from "lucide-react";
import { brl } from "@/lib/format";
import { type EmpresaCompleta, type Produto } from "@/lib/admin-store";
import { deleteProduto, saveProduto, saveProdutoIngredientes } from "@/lib/admin-server";

const SEM_CATEGORIA = "__sem-categoria__";
const TODAS_CATEGORIAS = "__todas__";

export function ProdutosTab({
  completa,
  token,
  onSaved,
}: {
  completa: EmpresaCompleta;
  token: string;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState<Produto | null>(null);
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>(TODAS_CATEGORIAS);
  const produtos = completa.produtos;

  // Filtra por nome (busca) e por categoria selecionada.
  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtos.filter((p: Produto) => {
      const bateBusca = !termo || p.nome.toLowerCase().includes(termo);
      if (!bateBusca) return false;
      if (categoriaFiltro === TODAS_CATEGORIAS) return true;
      if (categoriaFiltro === SEM_CATEGORIA) return !p.categoria_id;
      return p.categoria_id === categoriaFiltro;
    });
  }, [produtos, busca, categoriaFiltro]);

  // Quando "todas as categorias" está selecionado, agrupa os produtos por
  // categoria (na ordem em que elas foram cadastradas) pra facilitar achar
  // e editar. Produtos sem categoria caem num grupo à parte no final.
  const grupos = useMemo(() => {
    if (categoriaFiltro !== TODAS_CATEGORIAS) {
      return [{ id: categoriaFiltro, nome: null as string | null, produtos: produtosFiltrados }];
    }
    const porCategoria = new Map<string, Produto[]>();
    for (const p of produtosFiltrados) {
      const key = p.categoria_id ?? SEM_CATEGORIA;
      const lista = porCategoria.get(key) ?? [];
      lista.push(p);
      porCategoria.set(key, lista);
    }
    const ordenadas = completa.categorias
      .map((c) => ({
        id: c.id,
        nome: c.nome,
        produtos: porCategoria.get(c.id) ?? [],
      }))
      .filter((g) => g.produtos.length > 0);
    const semCategoria = porCategoria.get(SEM_CATEGORIA) ?? [];
    if (semCategoria.length > 0) {
      ordenadas.push({ id: SEM_CATEGORIA, nome: "Sem categoria", produtos: semCategoria });
    }
    return ordenadas;
  }, [produtosFiltrados, categoriaFiltro, completa.categorias]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">Produtos</h2>
        <Button
          size="sm"
          onClick={() =>
            setEditing({
              id: "" as any,
              empresa_id: completa.empresa.id,
              categoria_id:
                categoriaFiltro !== TODAS_CATEGORIAS && categoriaFiltro !== SEM_CATEGORIA
                  ? categoriaFiltro
                  : completa.categorias[0]?.id ?? null,
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

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Buscar produto pelo nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
          <SelectTrigger className="sm:w-64">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS_CATEGORIAS}>Todas as categorias</SelectItem>
            {completa.categorias.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome}
              </SelectItem>
            ))}
            <SelectItem value={SEM_CATEGORIA}>Sem categoria</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {produtosFiltrados.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum produto encontrado com esse filtro.
        </p>
      ) : (
        <div className="space-y-6">
          {grupos.map((grupo) => (
            <div key={grupo.id} className="space-y-3">
              {grupo.nome && (
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    {grupo.nome}
                  </h3>
                  <Badge variant="secondary">{grupo.produtos.length}</Badge>
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {grupo.produtos.map((p: any) => (
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
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {editing && (
            <ProdutoEditForm
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
        </DialogContent>
      </Dialog>
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

function ProdutoEditForm({
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
    (completa.produtoIngredientes[produto.id] ?? []).map((i: any) => ({
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
    <>
      <DialogHeader>
        <DialogTitle>{isNew ? "Novo produto" : `Editar: ${produto.nome}`}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 md:grid-cols-2">
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
            {completa.categorias.map((c: any) => (
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
      </div>
    </>
  );
}
