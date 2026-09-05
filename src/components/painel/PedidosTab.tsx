import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { brl } from "@/lib/format";
import { type EmpresaCompleta } from "@/lib/admin-store";
import { listPedidosEmpresa, updatePedidoStatus, type Pedido } from "@/lib/admin-server";

const STATUS_OPTIONS: Pedido["status"][] = [
  "recebido",
  "preparando",
  "pronto",
  "entregue",
  "cancelado",
];

const FORMA_PAGAMENTO_LABELS: Record<NonNullable<Pedido["forma_pagamento"]>, string> = {
  pix: "Pix",
  cartao: "Cartão (na entrega)",
  dinheiro: "Dinheiro",
};

const STATUS_LABELS: Record<Pedido["status"], string> = {
  recebido: "Recebido",
  preparando: "Preparando",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const STATUS_BADGE_VARIANT: Record<
  Pedido["status"],
  "default" | "secondary" | "destructive"
> = {
  recebido: "secondary",
  preparando: "default",
  pronto: "default",
  entregue: "secondary",
  cancelado: "destructive",
};

export function PedidosTab({
  completa,
  token,
}: {
  completa: EmpresaCompleta;
  token: string;
}) {
  const empresaId = completa.empresa.id;
  const {
    data: pedidos = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["pedidos-empresa", empresaId],
    queryFn: () => listPedidosEmpresa({ data: { token, empresaId } }),
    enabled: !!token && !!empresaId,
    refetchInterval: 30_000,
  });

  async function mudarStatus(pedidoId: string, status: Pedido["status"]) {
    try {
      await updatePedidoStatus({ data: { token, empresaId, pedidoId, status } });
      toast.success("Status atualizado");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar status");
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando pedidos...</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Pedidos</h2>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Atualizar
        </Button>
      </div>
      {pedidos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhum pedido recebido ainda.
          </CardContent>
        </Card>
      ) : (
        pedidos.map((p) => (
          <Card key={p.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display font-semibold">
                    #{p.numero} · {p.cliente_nome}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.cliente_telefone}
                    {p.endereco ? ` · ${p.endereco}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.criado_em).toLocaleString("pt-BR")}
                  </p>
                </div>
                <Badge variant={STATUS_BADGE_VARIANT[p.status]}>
                  {STATUS_LABELS[p.status]}
                </Badge>
              </div>
              <ul className="space-y-1 text-sm">
                {p.itens.map((it, i) => (
                  <li key={i} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">
                      {it.qtd}x {it.nome}
                      {it.obs ? ` (${it.obs})` : ""}
                    </span>
                    <span>{brl(it.preco_unit * it.qtd)}</span>
                  </li>
                ))}
              </ul>
              {p.forma_pagamento && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Pagamento: </span>
                  <strong>{FORMA_PAGAMENTO_LABELS[p.forma_pagamento]}</strong>
                  {p.forma_pagamento === "dinheiro" && p.troco_para != null && (
                    <span className="text-muted-foreground">
                      {" "}— troco pra {brl(p.troco_para)} (levar {brl(p.troco_para - p.valor_total)})
                    </span>
                  )}
                </p>
              )}
              <div className="flex justify-between border-t pt-2 text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display font-semibold">{brl(p.valor_total)}</span>
              </div>
              {p.forma_pagamento && (
                <div className="flex items-center gap-1 text-sm">
                  <Badge variant="outline">
                    {p.forma_pagamento === "pix" && "Pix"}
                    {p.forma_pagamento === "cartao" && "Cartão"}
                    {p.forma_pagamento === "dinheiro" &&
                      (p.troco_para
                        ? `Dinheiro · troco para ${brl(p.troco_para)}`
                        : "Dinheiro · sem troco")}
                  </Badge>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Label className="text-xs text-muted-foreground">Status:</Label>
                <select
                  className="flex h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={p.status}
                  onChange={(e) =>
                    mudarStatus(p.id, e.target.value as Pedido["status"])
                  }
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
