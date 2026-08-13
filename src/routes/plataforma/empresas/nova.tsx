import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createEmpresa, listPlanos } from "@/lib/admin-server";
import { useAuthSession } from "@/lib/auth-session";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const Route = createFileRoute("/plataforma/empresas/nova")({
  beforeLoad: () => {
    const session = useAuthSession.getState().session;
    if (!session || session.role !== "super_admin") {
      throw redirect({ to: "/plataforma/login" });
    }
  },
  component: NovaEmpresa,
});

function NovaEmpresa() {
  const navigate = useNavigate();
  const session = useAuthSession((s) => s.session);
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [planoId, setPlanoId] = useState("start");
  const [adminEmail, setAdminEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const { data: planos = [] } = useQuery({
    queryKey: ["planos"],
    queryFn: () => listPlanos({ data: {} as Record<string, never> }),
  });

  if (!session) return null;

  const finalSlug = slugTouched ? slug : slugify(nome);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setSubmitting(true);
    try {
      const res = await createEmpresa({
        data: {
          token: session.accessToken,
          slug: finalSlug,
          nome,
          whatsapp,
          plano_id: planoId,
          adminEmail,
        },
      });
      setTempPassword(res.tempPassword);
      toast.success(`Empresa ${nome} criada. Senha temporária gerada.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar empresa");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <h1 className="font-display text-xl font-bold">Nova empresa</h1>
          <Link to="/plataforma">
            <Button variant="outline" size="sm">
              ← Voltar
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {tempPassword ? (
          <Card className="border-brand-yellow bg-brand-cream">
            <CardHeader>
              <CardTitle className="font-display">Empresa criada!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm">
                  Acesse{" "}
                  <code className="rounded bg-white px-2 py-0.5">
                    /s/{finalSlug}
                  </code>{" "}
                  para ver o cardápio público.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold">
                  Credenciais iniciais do admin:
                </p>
                <p className="mt-1 text-sm">
                  Email: <code className="rounded bg-white px-2 py-0.5">{adminEmail}</code>
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm">
                  Senha temporária:{" "}
                  <Badge variant="default" className="font-mono">
                    {tempPassword}
                  </Badge>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Copie e envie para o dono da empresa. Ele poderá trocá-la pelo
                  Supabase Auth (esqueci minha senha) na primeira entrada.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate({ to: "/plataforma" })}>
                  Voltar ao dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setTempPassword(null);
                    setNome("");
                    setSlug("");
                    setSlugTouched(false);
                    setWhatsapp("");
                    setAdminEmail("");
                  }}
                >
                  Cadastrar outra
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome da empresa</Label>
                  <Input
                    id="nome"
                    required
                    placeholder="Hotdog do Simão"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug (URL pública)</Label>
                  <Input
                    id="slug"
                    required
                    placeholder="hotdog-do-simao"
                    value={finalSlug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugTouched(true);
                    }}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Será acessível em <code>/s/{finalSlug || "slug"}</code>. Só
                    letras, números e hífen.
                  </p>
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp (somente dígitos)</Label>
                  <Input
                    id="whatsapp"
                    required
                    placeholder="557399831608"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <div>
                  <Label htmlFor="plano">Plano</Label>
                  <Select value={planoId} onValueChange={setPlanoId}>
                    <SelectTrigger id="plano">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {planos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome} — R$ {Number(p.preco_mensal).toFixed(2)}/mês
                          {p.limite_produtos
                            ? ` · até ${p.limite_produtos} produtos`
                            : " · produtos ilimitados"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="adminEmail">Email do admin inicial</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    required
                    placeholder="dono@empresa.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Criando..." : "Criar empresa e admin"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}