
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
import {
  deleteProduto,
  saveProduto,
  saveProdutoIngredientes,
} from "@/lib/admin-server";

type TipoCadastro = "produto" | "servico";

const SEM_CATEGORIA = "__sem-categoria__";
const TODAS_CATEGORIAS = "__todas__";

function obterTipo(p: Produto): TipoCadastro {
  return (p as Produto & { tipo?: TipoCadastro }).tipo === "servico"
    ? "servico"
    : "produto";
}

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
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | TipoCadastro>("todos");
  const [categoriaFiltro, setCategoriaFiltro] =
    useState<string>(TODAS_CATEGORIAS);

  const produtos = completa.produtos;

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return produtos.filter((p: Produto) => {
      const bateBusca = !termo || p.nome.toLowerCase().includes(termo);
      if (!bateBusca) return false;

      if (tipoFiltro !== "todos" && obterTipo(p) !== tipoFiltro) {
        return false;
      }

      // Categorias são relevantes para produtos, não para serviços.
      if (obterTipo(p) === "servico") {
        return categoriaFiltro === TODAS_CATEGORIAS;
      }

      if (categoriaFiltro === TODAS_CATEGORIAS) return true;
      if (categoriaFiltro === SEM_CATEGORIA) return !p.categoria_id;

      return p.categoria_id === categoriaFiltro;
    });
  }, [produtos, busca, tipoFiltro, categoriaFiltro]);

  const grupos = useMemo(() => {
    if (categoriaFiltro !== TODAS_CATEGORIAS) {
      return [
        {
          id: categoriaFiltro,
          nome: null as string | null,
          produtos: produtosFiltrados,
        },
      ];
    }

    const porCategoria = new Map<string, Produto[]>();

    for (const p of produtosFiltrados) {
      const key =
        obterTipo(p) === "servico"
          ? "__servicos__"
          : p.categoria_id ?? SEM_CATEGORIA;

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
      ordenadas.push({
        id: SEM_CATEGORIA,
        nome: "Sem categoria",
        produtos: semCategoria,
      });
    }

    const servicos = porCategoria.get("__servicos__") ?? [];
    if (servicos.length > 0) {
      ordenadas.push({
        id: "__servicos__",
        nome: "Serviços",
        produtos: servicos,
      });
    }

    return ordenadas;
  }, [produtosFiltrados, categoriaFiltro, completa.categorias]);

  function novoCadastro(tipo: TipoCadastro = "produto") {
    setEditing({
      id: "" as any,
      empresa_id: completa.empresa.id,
      categoria_id:
        tipo === "produto" &&
        categoriaFiltro !== TODAS_CATEGORIAS &&
        categoriaFiltro !== SEM_CATEGORIA
          ? categoriaFiltro
          : completa.categorias[0]?.id ?? null,
      tipo,
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
    } as Produto);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-semibold">
            Produtos e serviços
          </h2>
          <p className="text-sm text-muted-foreground">
            Cadastre o que sua empresa vende ou os serviços que presta.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => novoCadastro("servico")}
          >
            <Plus className="mr-1 h-3 w-3" />
            Novo serviço
          </Button>

          <Button size="sm" onClick={() => novoCadastro("produto")}>
            <Plus className="mr-1 h-3 w-3" />
            Novo produto
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Buscar pelo nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <Select
          value={tipoFiltro}
          onValueChange={(v) => setTipoFiltro(v as typeof tipoFiltro)}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="produto">Produtos</SelectItem>
            <SelectItem value="servico">Serviços</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
          <SelectTrigger className="sm:w-56">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS_CATEGORIAS}>
              Todas as categorias
            </SelectItem>
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
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhum cadastro encontrado com esses filtros.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {grupos.map((grupo) => (
            <div key={grupo.id} className="space-y-3">
              {grupo.nome && (
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    {grupo.nome}
                  </h3>
                  <Badge variant="secondary">
                    {grupo.produtos.length}
                  </Badge>
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {grupo.produtos.map((p) => (
                  <CadastroCard
                    key={p.id}
                    p={p}
                    onEdit={() => setEditing(p)}
                    onDelete={async () => {
                      if (!confirm(`Excluir ${p.nome}?`)) return;

                      try {
                        await deleteProduto({
                          data: {
                            token,
                            empresaId: completa.empresa.id,
                            produtoId: p.id,
                          },
                        });

                        toast.success(
                          obterTipo(p) === "servico"
                            ? "Serviço excluído"
                            : "Produto excluído",
                        );
                        onSaved();
                      } catch (err) {
                        toast.error(
                          err instanceof Error
                            ? err.message
                            : "Erro ao excluir cadastro",
                        );
                      }
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

function CadastroCard({
  p,
  onEdit,
  onDelete,
}: {
  p: Produto;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const tipo = obterTipo(p);
  const valor = Number(p.preco) || 0;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-1">
              <Badge variant="outline">
                {tipo === "servico" ? "Serviço" : "Produto"}
              </Badge>
              {!p.ativo && <Badge variant="secondary">Inativo</Badge>}
            </div>

            <h3 className="font-display font-semibold">{p.nome}</h3>

            <p className="text-sm text-muted-foreground">
              {tipo === "servico" && valor <= 0
                ? "Consultar valor"
                : brl(valor)}
              {tipo === "produto" && p.preco_antigo != null && p.preco_antigo > 0 && (
                <span className="ml-2 line-through">
                  {brl(p.preco_antigo)}
                </span>
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

        {p.descricao_curta && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {p.descricao_curta}
          </p>
        )}

        {tipo === "produto" && p.tag && <Badge>{p.tag}</Badge>}
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
  const [draft, setDraft] = useState<Produto>(() => ({
    ...produto,
    tipo: obterTipo(produto),
  } as Produto));

  const [busy, setBusy] = useState(false);
  const isNew = !produto.id;
  const ehServico = obterTipo(draft) === "servico";

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
    if (!draft.nome.trim()) {
      toast.error("Informe o nome do cadastro.");
      return;
    }

    if (Number(draft.preco) < 0) {
      toast.error("O preço não pode ser negativo.");
      return;
    }

    setBusy(true);

    try {
const cadastro: Produto & { tipo: TipoCadastro } = {
  ...draft,
  nome: draft.nome.trim(),
  tipo: ehServico ? "servico" : "produto",
  preco: Number(draft.preco) || 0,
  preco_antigo: ehServico ? null : draft.preco_antigo,
  tag: ehServico ? null : draft.tag,
  tempo_preparo: ehServico ? null : draft.tempo_preparo,
  ingredientes: ehServico ? [] : draft.ingredientes,
  categoria_id: ehServico ? null : draft.categoria_id,
};

      const result = await saveProduto({
        data: {
          token,
          empresaId: completa.empresa.id,
          produto: cadastro,
        },
      });

      const produtoId = isNew ? result.id : produto.id;

      await saveProdutoIngredientes({
        data: {
          token,
          empresaId: completa.empresa.id,
          produtoId,
          itens: ehServico ? [] : ingredientesDraft,
        },
      });

      toast.success(
        ehServico
          ? isNew
            ? "Serviço criado"
            : "Serviço atualizado"
          : isNew
            ? "Produto criado"
            : "Produto atualizado",
      );

      onSaved();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao salvar cadastro",
      );
    } finally {
      setBusy(false);
    }
  }

  function alterarTipo(tipo: TipoCadastro) {
    setDraft((atual) => ({
      ...atual,
      tipo,
      ...(tipo === "servico"
        ? {
            categoria_id: null,
            preco_antigo: null,
            tag: null,
            tempo_preparo: "",
            ingredientes: [],
          }
        : {}),
    }));

    if (tipo === "servico") {
      setIngredientesDraft([]);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isNew
            ? ehServico
              ? "Novo serviço"
              : "Novo produto"
            : `Editar: ${produto.nome}`}
        </DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>O que você está cadastrando?</Label>

          <Select
            value={ehServico ? "servico" : "produto"}
            onValueChange={(v) => alterarTipo(v as TipoCadastro)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="produto">Produto</SelectItem>
              <SelectItem value="servico">Serviço</SelectItem>
            </SelectContent>
          </Select>

          <p className="mt-1 text-xs text-muted-foreground">
            {ehServico
              ? "Ex.: instalação, manutenção, depilação ou consultoria."
              : "Ex.: roupas, alimentos, acessórios ou outros itens vendidos."}
          </p>
        </div>

        <div>
          <Label>Nome *</Label>
          <Input
            value={draft.nome}
            onChange={(e) => setDraft({ ...draft, nome: e.target.value })}
            placeholder={ehServico ? "Ex.: Corte de cabelo" : "Ex.: Camiseta"}
          />
        </div>

        {!ehServico && (
          <div>
            <Label>Categoria</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={draft.categoria_id ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  categoria_id: e.target.value || null,
                })
              }
            >
              <option value="">Sem categoria</option>
              {completa.categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="md:col-span-2">
          <Label>Descrição curta</Label>
          <Input
            value={draft.descricao_curta ?? ""}
            onChange={(e) =>
              setDraft({ ...draft, descricao_curta: e.target.value })
            }
            placeholder={
              ehServico
                ? "Resuma o serviço em uma frase"
                : "Uma descrição rápida do produto"
            }
          />
        </div>

        <div className="md:col-span-2">
          <Label>Descrição completa</Label>
          <Textarea
            value={draft.descricao ?? ""}
            onChange={(e) => setDraft({ ...draft, descricao: e.target.value })}
            placeholder="Detalhes, características e informações importantes"
          />
        </div>

        <div>
          <Label>{ehServico ? "Preço do serviço (R$)" : "Preço (R$)"}</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={draft.preco}
            onChange={(e) =>
              setDraft({ ...draft, preco: Number(e.target.value) })
            }
          />

          {ehServico && (
            <p className="mt-1 text-xs text-muted-foreground">
              Informe 0 se o preço depender de orçamento.
            </p>
          )}
        </div>

        {!ehServico && (
          <div>
            <Label>Preço antigo (R$, opcional)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={draft.preco_antigo ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  preco_antigo: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
            />
          </div>
        )}

        <div className="md:col-span-2">
          <ImageUploadField
            label={ehServico ? "Imagem do serviço (opcional)" : "Imagem do produto"}
            value={draft.imagem_url ?? ""}
            onChange={(url) => setDraft({ ...draft, imagem_url: url })}
            token={token}
            empresaId={completa.empresa.id}
            pasta="produtos"
          />
        </div>

        {!ehServico && (
          <>
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
                    tag: (e.target.value as Produto["tag"]) || null,
                  })
                }
              >
                <option value="">Sem tag</option>
                <option value="mais-vendido">Mais vendido</option>
                <option value="promocao">Promoção</option>
                <option value="novo">Novo</option>
              </select>
            </div>
          </>
        )}

        <div className="md:col-span-2 flex items-center gap-2">
          <Switch
            checked={draft.ativo}
            onCheckedChange={(v) => setDraft({ ...draft, ativo: v })}
          />
          <Label>
            {ehServico ? "Serviço ativo (visível no perfil)" : "Produto ativo (visível no perfil)"}
          </Label>
        </div>

        {!ehServico && (
          <div className="md:col-span-2 space-y-2 rounded-lg border p-3">
            <Label>Ingredientes personalizáveis</Label>
            <p className="text-xs text-muted-foreground">
              Marque como removíveis os ingredientes que o cliente pode pedir
              para retirar. Se não cadastrar ingredientes, essa opção não
              aparecerá para o produto.
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
                            idx === i
                              ? { ...it, removivel: e.target.checked }
                              : it,
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
                      setIngredientesDraft((list) =>
                        list.filter((_, idx) => idx !== i),
                      )
                    }
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Ex.: Cebola"
                value={novoIngrediente}
                onChange={(e) => setNovoIngrediente(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addIngrediente();
                  }
                }}
              />

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addIngrediente}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        <div className="md:col-span-2 flex gap-2">
          <Button onClick={onSave} disabled={busy}>
            {busy ? "Salvando..." : "Salvar cadastro"}
          </Button>

          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
        </div>
      </div>
    </>
  );
}
