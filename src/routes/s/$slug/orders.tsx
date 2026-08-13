import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { getCartStore, cartSubtotal, itemUnitPrice } from "@/lib/store";
import { brl } from "@/lib/format";
import { useEmpresaPublica } from "@/lib/admin-store";

export const Route = createFileRoute("/s/$slug/orders")({
  component: PedidosPagina,
});

function PedidosPagina() {
  const { slug } = Route.useParams();
  const { data: empresaCompleta } = useEmpresaPublica(slug);
  const { orders } = getCartStore(slug)();

  if (!empresaCompleta) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold">
        <ShoppingBag className="h-6 w-6 text-brand-red" /> Meus pedidos
      </h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Histórico salvo só neste navegador/aparelho.
      </p>

      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Você ainda não fez nenhum pedido por aqui.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl bg-card p-4 card-shadow">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold">#{o.id}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(o.createdAt).toLocaleString("pt-BR")}
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-brand-red">{o.status}</p>
              <ul className="mt-2 space-y-0.5 text-sm text-muted-foreground">
                {o.items.map((it) => (
                  <li key={it.id}>
                    {it.quantity}x {it.name} — {brl(itemUnitPrice(it) * it.quantity)}
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between border-t pt-2 font-display font-bold">
                <span>Total</span>
                <span className="text-brand-red">{brl(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
