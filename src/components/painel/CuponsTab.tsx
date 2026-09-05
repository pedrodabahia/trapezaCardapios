import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { getCupons, type EmpresaCompleta, type Coupon } from "@/lib/admin-store";
import { saveEmpresaConfig } from "@/lib/admin-server";

export function CuponsTab({
  completa,
  token,
  onSaved,
}: {
  completa: EmpresaCompleta;
  token: string;
  onSaved: () => void;
}) {
  const cfg = completa.config;
  const cupons = getCupons(cfg);
  const [draft, setDraft] = useState<Coupon[]>(cupons);

  async function save() {
    const newCfg = { ...cfg, cupons: draft };
    await saveEmpresaConfig({
      data: { token, empresaId: completa.empresa.id, data: newCfg },
    });
    toast.success("Cupons salvos");
    onSaved();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cupons de desconto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {draft.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              placeholder="CÓDIGO"
              value={c.code}
              onChange={(e) => {
                const cp = [...draft];
                cp[i] = { ...c, code: e.target.value.toUpperCase() };
                setDraft(cp);
              }}
            />
            <Input
              type="number"
              placeholder="% desconto"
              value={c.discount}
              onChange={(e) => {
                const cp = [...draft];
                cp[i] = { ...c, discount: Number(e.target.value) };
                setDraft(cp);
              }}
            />
            <Input
              placeholder="Descrição"
              value={c.desc}
              onChange={(e) => {
                const cp = [...draft];
                cp[i] = { ...c, desc: e.target.value };
                setDraft(cp);
              }}
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDraft(draft.filter((_, j) => j !== i))}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setDraft([...draft, { code: "", discount: 10, desc: "" }])
            }
          >
            <Plus className="mr-1 h-3 w-3" /> Adicionar cupom
          </Button>
          <Button onClick={save}>Salvar</Button>
        </div>
      </CardContent>
    </Card>
  );
}
