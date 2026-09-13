import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadField } from "@/components/ImageUploadField";
import {
  listAnunciosAdmin,
  saveAnuncioHome,
  deleteAnuncioHome,
  type AnuncioHome,
} from "@/lib/admin-server";
import { useAuthSession } from "@/lib/auth-session";

export const Route = createFileRoute("/plataforma/anuncios")({
  beforeLoad: () => {
    const session = useAuthSession.getState().session;
    if (!session || session.role !== "super_admin") {
      throw redirect({ to: "/plataforma/login" });
    }
  },
  component: AnunciosPlataforma,
});

function blankAnuncio(ordem: number): AnuncioHome {
  return {
    id: "" as any,
    titulo: "",
    subtitulo: "",
    imagem_url: "",
    link_url: "",
    cor_fundo: null,
    ativo: true,
    ordem,
  };
}

// O banner tem pouco espaço (texto ao lado de uma foto grande) — título e
// subtítulo longos quebram feio. Limita os dois a 25 caracteres direto no
// input (atributo maxLength nativo do HTML — o navegador já impede
// digitar/colar mais do que isso, sem precisar de JS pra cortar depois).
const MAX_CARACTERES = 25;

function AnunciosPlataforma() {
  const session = useAuthSession((s) => s.session);
  const [editando, setEditando] = useState<AnuncioHome | null>(null);

  const { data: anuncios = [], refetch } = useQuery({
    queryKey: ["anuncios-admin"],
    queryFn: () => listAnunciosAdmin({ data: { token: session!.accessToken } }),
    enabled: !!session,
  });

  if (!session) return null;

  async function onDelete(a: AnuncioHome) {
    if (!confirm(`Excluir o anúncio "${a.titulo}"?`)) return;
    try {
      await deleteAnuncioHome({ data: { token: session!.accessToken, id: a.id } });
      toast.success("Anúncio excluído");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir");
    }
  }

  async function onToggleAtivo(a: AnuncioHome) {
    try {
      await saveAnuncioHome({
        data: { token: session!.accessToken, anuncio: { ...a, ativo: !a.ativo } },
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
          <h1 className="font-display text-xl font-bold">Anúncios da home</h1>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setEditando(blankAnuncio(anuncios.length))}>
              + Novo anúncio
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
          Esses são os slides do carrossel de propaganda da home (entre
          "Peça rápido" e "Pra matar a fome"). Só os marcados como "Ativo"
          aparecem pro público, na ordem definida abaixo.
        </p>

        {anuncios.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nenhum anúncio cadastrado ainda.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {anuncios.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {a.imagem_url && (
                      <img src={a.imagem_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{a.titulo}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Ordem {a.ordem} · {a.link_url || "sem link"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Switch checked={a.ativo} onCheckedChange={() => onToggleAtivo(a)} />
                    <Button size="sm" variant="outline" onClick={() => setEditando(a)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(a)}>
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {editando && (
          <FormAnuncio
            token={session.accessToken}
            anuncio={editando}
            onClose={() => setEditando(null)}
            onSaved={() => {
              setEditando(null);
              refetch();
            }}
          />
        )}
      </main>
    </div>
  );
}

function FormAnuncio({
  token,
  anuncio,
  onClose,
  onSaved,
}: {
  token: string;
  anuncio: AnuncioHome;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<AnuncioHome>(anuncio);
  const [busy, setBusy] = useState(false);
  // Pasta temporária no Storage — anúncio novo ainda não tem id real.
  const [pastaUploadTemp] = useState(() => crypto.randomUUID());
  const isNew = !anuncio.id;

  async function onSave() {
    setBusy(true);
    try {
      await saveAnuncioHome({ data: { token, anuncio: draft } });
      toast.success(isNew ? "Anúncio criado" : "Anúncio atualizado");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isNew ? "Novo anúncio" : `Editar: ${anuncio.titulo}`}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Título</Label>
          <Input
            value={draft.titulo}
            maxLength={MAX_CARACTERES}
            onChange={(e) => setDraft({ ...draft, titulo: e.target.value })}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {draft.titulo.length}/{MAX_CARACTERES} caracteres — curto pra não quebrar no banner.
          </p>
        </div>
        <div>
          <Label>Subtítulo (opcional)</Label>
          <Textarea
            value={draft.subtitulo ?? ""}
            maxLength={MAX_CARACTERES}
            onChange={(e) => setDraft({ ...draft, subtitulo: e.target.value })}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {(draft.subtitulo ?? "").length}/{MAX_CARACTERES} caracteres.
          </p>
        </div>
        <ImageUploadField
          label="Imagem"
          value={draft.imagem_url ?? ""}
          onChange={(url) => setDraft({ ...draft, imagem_url: url })}
          token={token}
          empresaId={pastaUploadTemp}
          pasta="anuncios"
          plataforma
        />
        <div>
          <Label>Cor de fundo (opcional)</Label>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              type="color"
              className="h-10 w-16 p-1"
              value={draft.cor_fundo ?? "#c65d3a"}
              onChange={(e) => setDraft({ ...draft, cor_fundo: e.target.value })}
            />
            <span className="text-xs text-muted-foreground">
              {draft.cor_fundo ?? "Sem cor definida — usa o gradiente padrão"}
            </span>
            {draft.cor_fundo && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setDraft({ ...draft, cor_fundo: null })}
              >
                Remover
              </Button>
            )}
          </div>
        </div>
        <div>
          <Label>Link ao clicar (opcional)</Label>
          <Input
            value={draft.link_url ?? ""}
            onChange={(e) => setDraft({ ...draft, link_url: e.target.value })}
            placeholder="https://... ou /s/algum-slug"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Pode ser um link externo, ou um caminho interno tipo /s/slug ou
            /s/slug/product/id.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Ordem</Label>
            <Input
              type="number"
              value={draft.ordem}
              onChange={(e) => setDraft({ ...draft, ordem: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Switch
              checked={draft.ativo}
              onCheckedChange={(v) => setDraft({ ...draft, ativo: v })}
            />
            <Label>Ativo</Label>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onSave} disabled={busy || !draft.titulo.trim()}>
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
