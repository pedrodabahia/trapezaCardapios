import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { getFrete, getBairros, type EmpresaCompleta, type Neighborhood } from "@/lib/admin-store";
import { saveEmpresaConfig } from "@/lib/admin-server";

export function EntregaTab({
  completa,
  token,
  onSaved,
}: {
  completa: EmpresaCompleta;
  token: string;
  onSaved: () => void;
}) {
  const cfg = completa.config;
  const frete = getFrete(cfg);
  const [taxa, setTaxa] = useState(frete.taxa);
  const [gratis, setGratis] = useState(frete.gratis_habilitado);
  const [acimaDe, setAcimaDe] = useState(frete.gratis_acima_de ?? 0);
  const [bairros, setBairros] = useState<Neighborhood[]>(getBairros(cfg));

  async function save() {
    await saveEmpresaConfig({
      data: {
        token,
        empresaId: completa.empresa.id,
        data: {
          ...cfg,
          frete: {
            taxa: Number(taxa),
            gratis_habilitado: !!gratis,
            gratis_acima_de: gratis ? Number(acimaDe) : null,
          },
        },
      },
    });
    toast.success("Configurações de entrega salvas");
    onSaved();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Bairros e taxa de entrega</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Cadastre os bairros que você entrega e o valor de cada um. Se
            tiver pelo menos um bairro aqui, o cardápio público passa a
            pedir rua, número e bairro (em vez de endereço livre), e a taxa
            de entrega é calculada automaticamente pelo bairro escolhido —
            a "Taxa de entrega" fixa abaixo deixa de ser usada.
          </p>
          {bairros.map((b, i) => (
            <div key={b.id} className="flex items-center gap-2">
              <Input
                placeholder="Nome do bairro"
                value={b.name}
                onChange={(e) => {
                  const cp = [...bairros];
                  cp[i] = { ...b, name: e.target.value };
                  setBairros(cp);
                }}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Taxa (R$)"
                value={b.fee}
                onChange={(e) => {
                  const cp = [...bairros];
                  cp[i] = { ...b, fee: Number(e.target.value) };
                  setBairros(cp);
                }}
                className="w-32"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBairros(bairros.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setBairros([...bairros, { id: crypto.randomUUID(), name: "", fee: 0 }])
            }
          >
            <Plus className="mr-1 h-3 w-3" /> Adicionar bairro
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Taxa de entrega fixa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            {bairros.length > 0
              ? "Como você tem bairros cadastrados acima, essa taxa fixa não é mais usada — fica aqui só de reserva caso você apague todos os bairros."
              : "Usada enquanto você não cadastrar nenhum bairro acima."}
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <Label>Taxa de entrega (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={taxa}
                onChange={(e) => setTaxa(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Frete grátis acima de (R$)</Label>
              <Input
                type="number"
                step="0.01"
                disabled={!gratis}
                value={acimaDe}
                onChange={(e) => setAcimaDe(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={gratis} onCheckedChange={setGratis} />
              <Label>Frete grátis habilitado</Label>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            O "frete grátis acima de" vale mesmo com bairros cadastrados —
            passando desse valor, a entrega fica grátis não importa o bairro.
          </p>
        </CardContent>
      </Card>

      <Button onClick={save}>Salvar</Button>
    </div>
  );
}
