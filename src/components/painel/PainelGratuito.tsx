import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ImageUploadField } from "@/components/ImageUploadField";
import { updateEmpresa, saveEmpresaConfig, type EmpresaCompleta } from "@/lib/admin-server";
import { getHorarios, type DayHours } from "@/lib/admin-store";

// Painel do plano GRATUITO: só edita o básico (nome, logo, capa,
// endereço, horário) — a mesma informação que aparece na página pública
// da empresa (/empresa/$slug). Sem produtos, categorias, pedidos, cupons
// etc — isso é exclusivo do plano pago. Reaproveita os mesmos endpoints
// de sempre (updateEmpresa/saveEmpresaConfig), só que num formulário bem
// mais curto.
export function PainelGratuito({
  completa,
  token,
  onSaved,
}: {
  completa: EmpresaCompleta;
  token: string;
  onSaved: () => void;
}) {
  const empresa = completa.empresa;
  const [nome, setNome] = useState(empresa.nome);
  const [endereco, setEndereco] = useState(empresa.endereco ?? "");
  const [logoUrl, setLogoUrl] = useState(empresa.logo_url ?? "");
  const [capaUrl, setCapaUrl] = useState(empresa.capa_url ?? "");
  const [busyPerfil, setBusyPerfil] = useState(false);

  const [horarios, setHorarios] = useState<DayHours[]>(() => getHorarios(completa.config));
  const [busyHorario, setBusyHorario] = useState(false);

  async function onSalvarPerfil() {
    setBusyPerfil(true);
    try {
      await updateEmpresa({
        data: {
          token,
          empresaId: empresa.id,
          patch: { nome, endereco, logo_url: logoUrl, capa_url: capaUrl },
        },
      });
      toast.success("Dados salvos");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setBusyPerfil(false);
    }
  }

  async function onSalvarHorario() {
    setBusyHorario(true);
    try {
      await saveEmpresaConfig({
        data: {
          token,
          empresaId: empresa.id,
          data: {
            ...completa.config,
            horarios: Object.fromEntries(
              horarios.map((h) => [
                ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"][h.day],
                { abre: h.open, fecha: h.close, fechado: h.closed },
              ]),
            ),
          },
        },
      });
      toast.success("Horário salvo");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar horário");
    } finally {
      setBusyHorario(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-dashed border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Você está no <strong>plano Gratuito</strong>: só dá pra editar os
          dados básicos abaixo, que aparecem na sua página pública do
          Trapeza. Pra ter cardápio, pedidos e o resto do painel, fale com
          a Trapeza sobre o plano pago (R$ 59,90/mês).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div>
            <Label>Endereço</Label>
            <Input
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, número, bairro"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUploadField
              label="Logo"
              value={logoUrl}
              onChange={setLogoUrl}
              token={token}
              empresaId={empresa.id}
              pasta="logo"
            />
            <ImageUploadField
              label="Capa/imagem"
              value={capaUrl}
              onChange={setCapaUrl}
              token={token}
              empresaId={empresa.id}
              pasta="capa"
            />
          </div>
          <Button onClick={onSalvarPerfil} disabled={busyPerfil}>
            {busyPerfil ? "Salvando..." : "Salvar dados"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horário de funcionamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {horarios.map((h, i) => (
            <div key={h.day} className="flex flex-wrap items-center gap-3">
              <span className="w-24 text-sm font-semibold">{h.label}</span>
              <Switch
                checked={!h.closed}
                onCheckedChange={(v) => {
                  const cp = [...horarios];
                  cp[i] = { ...h, closed: !v };
                  setHorarios(cp);
                }}
              />
              <Input
                type="time"
                value={h.open}
                onChange={(e) => {
                  const cp = [...horarios];
                  cp[i] = { ...h, open: e.target.value };
                  setHorarios(cp);
                }}
                disabled={h.closed}
                className="w-28"
              />
              <span>até</span>
              <Input
                type="time"
                value={h.close}
                onChange={(e) => {
                  const cp = [...horarios];
                  cp[i] = { ...h, close: e.target.value };
                  setHorarios(cp);
                }}
                disabled={h.closed}
                className="w-28"
              />
              {h.closed && <Badge variant="secondary">fechado</Badge>}
            </div>
          ))}
          <Button onClick={onSalvarHorario} disabled={busyHorario} className="mt-2">
            {busyHorario ? "Salvando..." : "Salvar horário"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
