import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUploadField } from "@/components/ImageUploadField";
import { Plus, Trash2 } from "lucide-react";
import { type EmpresaCompleta, type Categoria } from "@/lib/admin-store";
import { deleteCategoria, saveCategoria } from "@/lib/admin-server";

export function CategoriasTab({
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

  async function onDelete(c: Categoria) {
    const qtdProdutos = completa.produtos.filter((p) => p.categoria_id === c.id).length;
    const aviso =
      qtdProdutos > 0
        ? `Excluir "${c.nome}"? ${qtdProdutos} produto(s) dessa categoria ficarão sem categoria.`
        : `Excluir a categoria "${c.nome}"?`;
    if (!confirm(aviso)) return;
    try {
      await deleteCategoria({
        data: { token, empresaId: completa.empresa.id, categoriaId: c.id },
      });
      toast.success("Categoria excluída");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir categoria");
    }
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
                <Button size="sm" variant="destructive" onClick={() => onDelete(c)}>
                  <Trash2 className="h-3 w-3" />
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
              {editing.id && (
                <Button
                  variant="destructive"
                  className="ml-auto"
                  onClick={() => {
                    setEditing(null);
                    onDelete(editing);
                  }}
                >
                  <Trash2 className="mr-1 h-3 w-3" /> Excluir
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
