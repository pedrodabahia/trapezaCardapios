import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLogin, getEmpresaById } from "@/lib/admin-server";
import { useAuthSession } from "@/lib/auth-session";

export const Route = createFileRoute("/painel/login")({
  component: PainelLogin,
});

function PainelLogin() {
  const navigate = useNavigate();
  const setSession = useAuthSession((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminLogin({ data: { email, password } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      // Resolve o slug da empresa via token JWT do próprio usuário.
      const empresa = res.empresaId
        ? await getEmpresaById({
            data: { token: res.accessToken, empresaId: res.empresaId },
          })
        : null;
      setSession({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        email: res.email,
        empresaId: res.empresaId,
        role: res.role,
      });
      if (empresa) {
        navigate({ to: `/painel/${empresa.slug}` });
      } else {
        toast.success("Login efetuado.");
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl bg-card p-8 card-shadow"
      >
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold">Painel admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre com o email e senha cadastrados pela plataforma.
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="inline-flex items-center gap-1 underline underline-offset-4">
            <ArrowLeft className="h-3 w-3" /> voltar para o site
          </Link>
        </p>
      </form>
    </div>
  );
}
