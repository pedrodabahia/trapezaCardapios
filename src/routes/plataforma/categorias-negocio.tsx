import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUploadField } from "@/components/ImageUploadField";
import {
  listCategoriasNegocioAdmin,
  saveCategoriaNegocio,
  deleteCategoriaNegocio,
  type CategoriaNegocioDb,
} from "@/lib/admin-server";
import { useAuthSession } from "@/lib/auth-session";

export const Route = createFileRoute("/plataforma/categorias-negocio")({
  beforeLoad: () => {
    const session = useAuthSession.getState().session;
    if (!session || session.role !== "super_admin") {
      throw redirect({ to: "/plataforma/login" });
    }
  },
  component: CategoriasNegocioPlataforma,
});

function blankCategoria(ordem: number): CategoriaNegocioDb {
  return {
    id: "" as any,
    valor: "",
    label: "",
    imagem_url: "",
    cor: "#FFE8F0",
    ativo: true,
    ordem,
  };
}

function CategoriasNegocioPlataforma() {
  const session = useAuthSession((s) => s.session);
  const [editando, setEditando] = useState<CategoriaNegocioDb | null>(null);

  const { data: categorias = [], refetch } = useQuery({
    queryKey: ["categorias-negocio-admin"],
    queryFn: () => listCategoriasNegocioAdmin({ data: { token: session!.accessToken } }),
    enabled: !!session,
  });

  if (!session) return null;

  async function onDelete(c: CategoriaNegocioDb) {
    if (!confirm(`Excluir a categoria "${c.label}"? Empresas que já usam essa categoria não são apagadas, só param de conseguir filtrar/aparecer por ela.`))
      return;
    try {
      await deleteCategoriaNegocio({ data: { token: session!.accessToken, id: c.id } });
      toast.success("Categoria excluída");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir");
    }
  }

  async function onToggleAtivo(c: CategoriaNegocioDb) {
    try {
      await saveCategoriaNegocio({
        data: { token: session!.accessToken, categoria: { ...c, ativo: !c.ativo } },
      });
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h1 className="font-display text-xl font-bold">Categorias de negócio</h1>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setEditando(blankCategoria(categorias.length))}>
              + Nova categoria
            </Button>
            <Link to="/plataforma">
              <Button variant="outline" size="sm">
                ← Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <p className="text-sm text-muted-foreground">
          Essas categorias aparecem nos ícones da home, no filtro de
          empresas e nos formulários onde uma empresa escolhe sua
          categoria (Config do painel, cadastro de empresa externa).
        </p>

        {categorias.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma categoria cadastrada ainda.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {categorias.map((c) => (
              <Card key={c.id}>
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full"
                    style={{ backgroundColor: c.cor ?? "#eee" }}
                  >
                    {c.imagem_url && <img src={c.imagem_url} alt="" className="w-6" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      valor: {c.valor} · ordem {c.ordem}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Switch checked={c.ativo} onCheckedChange={() => onToggleAtivo(c)} />
                    <Button size="sm" variant="outline" onClick={() => setEditando(c)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(c)}>
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {editando && (
          <Dialog open onOpenChange={(open) => !open && setEditando(null)}>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
              <FormCategoria
                token={session.accessToken}
                categoria={editando}
                onClose={() => setEditando(null)}
                onSaved={() => {
                  setEditando(null);
                  refetch();
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}

function FormCategoria({
  token,
  categoria,
  onClose,
  onSaved,
}: {
  token: string;
  categoria: CategoriaNegocioDb;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<CategoriaNegocioDb>(categoria);
  const [busy, setBusy] = useState(false);
  const [pastaUploadTemp] = useState(() => crypto.randomUUID());
  const isNew = !categoria.id;

  async function onSave() {
    setBusy(true);
    try {
      await saveCategoriaNegocio({ data: { token, categoria: draft } });
      toast.success(isNew ? "Categoria criada" : "Categoria atualizada");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isNew ? "Nova categoria" : `Editar: ${categoria.label}`}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Nome (aparece pro usuário)</Label>
          <Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
        </div>
        <div>
          <Label>Valor (identificador interno, sem espaço/acento)</Label>
          <Input
            value={draft.valor}
            onChange={(e) => setDraft({ ...draft, valor: e.target.value })}
            placeholder="ex: lanchonete"
            disabled={!isNew}
          />
          {!isNew && (
            <p className="mt-1 text-xs text-muted-foreground">
              Não dá pra mudar o valor de uma categoria já em uso (empresas
              já salvaram esse valor). Crie uma nova se precisar renomear
              o identificador.
            </p>
          )}
        </div>
        <ImageUploadField
          label="Ícone"
          value={draft.imagem_url ?? ""}
          onChange={(url) => setDraft({ ...draft, imagem_url: url })}
          token={token}
          empresaId={pastaUploadTemp}
          pasta="categorias"
          plataforma
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Cor de fundo do ícone</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                className="h-10 w-16 p-1"
                value={draft.cor ?? "#FFE8F0"}
                onChange={(e) => setDraft({ ...draft, cor: e.target.value })}
              />
              <span className="text-xs text-muted-foreground">{draft.cor}</span>
            </div>
          </div>
          <div>
            <Label>Ordem</Label>
            <Input
              type="number"
              value={draft.ordem}
              onChange={(e) => setDraft({ ...draft, ordem: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={draft.ativo} onCheckedChange={(v) => setDraft({ ...draft, ativo: v })} />
          <Label>Ativa</Label>
        </div>
        <div className="flex gap-2">
          <Button onClick={onSave} disabled={busy || !draft.label.trim() || !draft.valor.trim()}>
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
