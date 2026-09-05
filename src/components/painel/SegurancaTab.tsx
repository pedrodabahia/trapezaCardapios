import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeOwnPassword } from "@/lib/admin-server";

export function SegurancaTab({ token }: { token: string }) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSave() {
    if (novaSenha.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não são iguais");
      return;
    }
    setBusy(true);
    try {
      await changeOwnPassword({ data: { token, novaSenha } });
      toast.success("Senha alterada com sucesso");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao trocar senha");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trocar senha</CardTitle>
      </CardHeader>
      <CardContent className="max-w-sm space-y-4">
        <p className="text-sm text-muted-foreground">
          Se você entrou com a senha padrão que veio no cadastro, aproveita e
          já troca por uma senha só sua.
        </p>
        <div>
          <Label>Nova senha</Label>
          <Input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <div>
          <Label>Confirmar nova senha</Label>
          <Input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />
        </div>
        <Button onClick={onSave} disabled={busy}>
          {busy ? "Salvando..." : "Salvar nova senha"}
        </Button>
      </CardContent>
    </Card>
  );
}
