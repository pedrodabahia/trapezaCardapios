import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { brl } from "@/lib/format";
import { type EmpresaCompleta } from "@/lib/admin-store";
import { getPlanoDaEmpresa } from "@/lib/admin-server";

export function ContaTab({
  completa,
  token,
}: {
  completa: EmpresaCompleta;
  token: string;
}) {
  const empresaId = completa.empresa.id;
  const { data, isLoading } = useQuery({
    queryKey: ["plano-empresa", empresaId],
    queryFn: () => getPlanoDaEmpresa({ data: { token, empresaId } }),
    enabled: !!token && !!empresaId,
  });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">Carregando plano...</p>;
  }

  const { plano, status_pagamento, produtos_usados } = data;
  const limite = plano.limite_produtos;
  const statusLabel =
    status_pagamento === "ativo"
      ? "Ativa"
      : status_pagamento === "atrasado"
        ? "Atrasada"
        : "Suspensa";
  const statusVariant =
    status_pagamento === "ativo"
      ? ("default" as const)
      : status_pagamento === "atrasado"
        ? ("secondary" as const)
        : ("destructive" as const);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Plano atual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-semibold">{plano.nome}</p>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{brl(plano.preco_mensal)}/mês</p>
          <div className="text-sm">
            <p>
              Produtos usados: <strong>{produtos_usados}</strong>
              {limite != null ? ` de ${limite}` : " (sem limite)"}
            </p>
            {limite != null && (
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${Math.min(100, (produtos_usados / limite) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>{plano.tem_shopping ? "✅" : "—"} Shopping da Mata</li>
            <li>{plano.tem_destaque ? "✅" : "—"} Destaque pago</li>
            <li>{plano.tem_tv ? "✅" : "—"} Painel para TV</li>
          </ul>
        </CardContent>
      </Card>
      {status_pagamento !== "ativo" && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="p-4 text-sm text-destructive">
            Sua assinatura está {statusLabel.toLowerCase()}. Fale com a plataforma pra
            regularizar.
          </CardContent>
        </Card>
      )}
      <p className="text-xs text-muted-foreground">
        Quer fazer upgrade de plano? Fale com a plataforma pelo suporte.
      </p>
    </div>
  );
}
