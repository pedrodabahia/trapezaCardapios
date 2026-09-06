import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createEmpresaExterna } from "@/lib/admin-server";
import { useAuthSession } from "@/lib/auth-session";
import { CATEGORIAS_NEGOCIO } from "@/lib/categorias-negocio";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const Route = createFileRoute("/plataforma/empresas/nova-externa")({
  beforeLoad: () => {
    const session = useAuthSession.getState().session;
    if (!session || session.role !== "super_admin") {
      throw redirect({ to: "/plataforma/login" });
    }
  },
  component: NovaEmpresaExterna,
});

function NovaEmpresaExterna() {
  const navigate = useNavigate();
  const session = useAuthSession((s) => s.session);
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [categoria, setCategoria] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [urlExterna, setUrlExterna] = useState("");
  const [descricao, setDescricao] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [capaUrl, setCapaUrl] = useState("");
  const [destaque, setDestaque] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!session) return null;

  const finalSlug = slugTouched ? slug : slugify(nome);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    if (!urlExterna.trim()) {
      toast.error("Informe a URL do site/sistema dessa empresa.");
      return;
    }
    setSubmitting(true);
    try {
      await createEmpresaExterna({
        data: {
          token: session.accessToken,
          slug: finalSlug,
          nome,
          categoria: categoria || null,
          cidade: cidade || null,
          bairro: bairro || null,
          whatsapp: whatsapp || null,
          urlExterna: urlExterna.trim(),
          descricao: descricao || null,
          logoUrl: logoUrl || null,
          capaUrl: capaUrl || null,
          destaque,
        },
      });
      toast.success(`Empresa externa "${nome}" cadastrada no diretório.`);
      navigate({ to: "/plataforma" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar empresa externa");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <h1 className="font-display text-xl font-bold">Nova empresa externa</h1>
          <Link to="/plataforma">
            <Button variant="outline" size="sm">
              ← Voltar
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar empresa com site próprio</CardTitle>
            <p className="text-sm text-muted-foreground">
              Pra clientes que já têm sistema/site independente do Trapeza e
              só querem ser descobertos pela home. Não cria login nem
              painel — o clique leva direto pra URL externa.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da empresa</Label>
                <Input
                  id="nome"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug (identificador interno)</Label>
                <Input
                  id="slug"
                  required
                  value={finalSlug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugTouched(true);
                  }}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Não vira uma página /s/{"{slug}"} — é só um identificador
                  interno único.
                </p>
              </div>
              <div>
                <Label htmlFor="url">URL externa</Label>
                <Input
                  id="url"
                  required
                  type="url"
                  placeholder="https://www.exemplo.com.br"
                  value={urlExterna}
                  onChange={(e) => setUrlExterna(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Pra onde o botão "Visitar site" leva o cliente.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Categoria</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_NEGOCIO.map((c) => (
                        <SelectItem key={c.valor} value={c.valor}>
                          {c.emoji} {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="bairro">Bairro (opcional)</Label>
                  <Input id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                    placeholder="557399831608"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="descricao">Descrição curta</Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="O que essa empresa faz/vende"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="logo">URL do logo (opcional)</Label>
                  <Input id="logo" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="capa">URL da capa/imagem (opcional)</Label>
                  <Input id="capa" value={capaUrl} onChange={(e) => setCapaUrl(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={destaque} onCheckedChange={setDestaque} />
                <Label>Colocar em destaque na home</Label>
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Cadastrando..." : "Cadastrar empresa externa"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
