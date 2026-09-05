import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ImageUploadField } from "@/components/ImageUploadField";
import {
  getCores,
  getCidadeEntrega,
  getHorarios,
  type EmpresaCompleta,
  type DayHours,
} from "@/lib/admin-store";
import { updateEmpresa, saveEmpresaConfig } from "@/lib/admin-server";

export function ConfigTab({
  completa,
  token,
  onSaved,
}: {
  completa: EmpresaCompleta;
  token: string;
  onSaved: () => void;
}) {
  const empresa = completa.empresa;
  const cfg = completa.config;
  const cores = getCores(cfg);

  const [nome, setNome] = useState(empresa.nome);
  const [whatsapp, setWhatsapp] = useState(empresa.whatsapp);
  const [endereco, setEndereco] = useState(empresa.endereco ?? "");
  const [pixChave, setPixChave] = useState(empresa.pix_chave ?? "");
  const [logoUrl, setLogoUrl] = useState(empresa.logo_url ?? "");

  const [primary, setPrimary] = useState(cores.primary);
  const [accent, setAccent] = useState(cores.accent);
  const [bg, setBg] = useState(cores.bg);
  const [fg, setFg] = useState(cores.fg);

  const [cidade, setCidade] = useState(getCidadeEntrega(cfg));

  const [horarios, setHorarios] = useState<DayHours[]>(() => getHorarios(cfg));

  async function saveAll() {
    await updateEmpresa({
      data: {
        token,
        empresaId: empresa.id,
        patch: {
          nome,
          whatsapp,
          endereco,
          pix_chave: pixChave,
          logo_url: logoUrl,
        },
      },
    });
    await saveEmpresaConfig({
      data: {
        token,
        empresaId: empresa.id,
        data: {
          ...cfg,
          cores: { primary, accent, bg, fg },
          cidade_entrega: cidade,
          horarios: Object.fromEntries(
            horarios.map((h) => [
              ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"][
                h.day
              ],
              {
                abre: h.open,
                fecha: h.close,
                fechado: h.closed,
              },
            ]),
          ),
        },
      },
    });
    toast.success("Configurações salvas");
    onSaved();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identidade</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input
              value={whatsapp}
              onChange={(e) =>
                setWhatsapp(e.target.value.replace(/\D/g, ""))
              }
            />
          </div>
          <div className="md:col-span-2">
            <Label>Endereço</Label>
            <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} />
          </div>
          <div>
            <Label>Chave Pix</Label>
            <Input value={pixChave} onChange={(e) => setPixChave(e.target.value)} />
          </div>
          <div>
            <ImageUploadField
              label="Logo"
              value={logoUrl}
              onChange={setLogoUrl}
              token={token}
              empresaId={empresa.id}
              pasta="logo"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Cidade de entrega (default no checkout)</Label>
            <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cores da marca</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div>
            <Label>Primária</Label>
            <Input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">{primary}</p>
          </div>
          <div>
            <Label>Accent</Label>
            <Input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">{accent}</p>
          </div>
          <div>
            <Label>Fundo</Label>
            <Input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">{bg}</p>
          </div>
          <div>
            <Label>Texto</Label>
            <Input type="color" value={fg} onChange={(e) => setFg(e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">{fg}</p>
          </div>
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
              {h.closed && (
                <Badge variant="secondary">fechado</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={saveAll}>Salvar tudo</Button>
    </div>
  );
}
