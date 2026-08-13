import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, Tag as TagIcon } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCartStore, itemUnitPrice, cartSubtotal } from "@/lib/store";
import { brl } from "@/lib/format";
import { toast } from "sonner";
import { getCupons, getFrete, getBairros } from "@/lib/admin-store";
import type { EmpresaCompleta } from "@/lib/admin-server";

type Props = {
  slug: string;
  config: EmpresaCompleta["config"];
};

export function CartDrawer({ slug, config }: Props) {
  const { drawerOpen, closeDrawer, items, updateQty, removeItem, coupon, applyCoupon } = getCartStore(slug)();
  const [code, setCode] = useState("");
  const cupons = getCupons(config);
  const frete = getFrete(config);
  const bairros = getBairros(config);

  const subtotal = cartSubtotal(items);
  const entregaGratis =
    frete.gratis_habilitado &&
    frete.gratis_acima_de != null &&
    subtotal >= Number(frete.gratis_acima_de);
  // Com bairros cadastrados, a taxa real só é conhecida depois que a pessoa
  // escolhe o bairro dela no checkout — aqui só avisamos que vai ser
  // calculada, em vez de mostrar um valor fixo que pode estar errado.
  const delivery = subtotal > 0 && !entregaGratis && bairros.length === 0 ? Number(frete.taxa) : 0;
  const calculaNoCheckout = bairros.length > 0 && subtotal > 0 && !entregaGratis;
  const discount = coupon ? (subtotal * coupon.discount) / 100 : 0;
  const total = subtotal + delivery - discount; // com bairros, isso ainda não inclui a entrega — o total real aparece no checkout

  return (
    <Sheet open={drawerOpen} onOpenChange={(o) => (o ? null : closeDrawer())}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b bg-brand-cream p-5">
          <SheetTitle className="flex items-center gap-2 font-display text-2xl">
            <ShoppingBag className="h-6 w-6 text-brand-red" />
            Seu Carrinho
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-muted text-4xl">🛒</div>
            <p className="font-display text-lg font-semibold">Seu carrinho está vazio</p>
            <p className="text-sm text-muted-foreground">Que tal um dos nossos clássicos?</p>
            <Button
              onClick={closeDrawer}
              className="mt-2 rounded-full bg-brand-red hover:bg-brand-red/90"
            >
              Ver cardápio
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-4">
                {items.map((it) => {
                  const unit = itemUnitPrice(it);
                  return (
                    <div key={it.id} className="flex gap-3 rounded-2xl bg-card p-3 card-shadow">
                      <img
                        src={it.image}
                        alt={it.name}
                        className="h-20 w-20 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="truncate font-display font-semibold">
                            {it.name}
                          </h4>
                          <button
                            onClick={() => removeItem(it.id)}
                            className="text-muted-foreground hover:text-brand-red"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {it.customization.selecoes.some((s) => s.valores.length > 0) && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {it.customization.selecoes
                              .flatMap((s) => s.valores)
                              .join(" · ")}
                          </p>
                        )}
                        {it.customization.adicionais.length > 0 && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            + {it.customization.adicionais.map((a) => a.name).join(", ")}
                          </p>
                        )}
                        {it.customization.remover.length > 0 && (
                          <p className="mt-0.5 text-xs text-brand-red">
                            Sem {it.customization.remover.join(", ")}
                          </p>
                        )}
                        {it.customization.observacoes && (
                          <p className="mt-0.5 line-clamp-1 text-xs italic text-muted-foreground">
                            "{it.customization.observacoes}"
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-full border bg-background p-1">
                            <button
                              onClick={() => updateQty(it.id, it.quantity - 1)}
                              className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">
                              {it.quantity}
                            </span>
                            <button
                              onClick={() => updateQty(it.id, it.quantity + 1)}
                              className="grid h-7 w-7 place-items-center rounded-full bg-brand-red text-white hover:bg-brand-red/90"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="font-display font-bold text-brand-red">
                            {brl(unit * it.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-brand-yellow bg-brand-yellow/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-brown">
                  <TagIcon className="h-4 w-4" /> Cupom de desconto
                </div>
                {coupon ? (
                  <p className="text-sm font-semibold text-brand-red">
                    Cupom {coupon.code} aplicado! -{coupon.discount}%
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="CUPOM"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="rounded-full bg-white"
                    />
                    <Button
                      onClick={() => {
                        if (applyCoupon(code, cupons)) toast.success("Cupom aplicado!");
                        else toast.error("Cupom inválido");
                      }}
                      className="rounded-full bg-brand-brown hover:bg-brand-brown/90"
                    >
                      Aplicar
                    </Button>
                  </div>
                )}
                {cupons.length > 0 && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Disponíveis: {cupons.map((c) => c.code).join(", ")}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t bg-white p-5">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{brl(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa de entrega</span>
                  <span>
                    {entregaGratis ? (
                      <span className="text-green-700">Grátis</span>
                    ) : calculaNoCheckout ? (
                      <span className="text-xs text-muted-foreground">calculada no checkout</span>
                    ) : (
                      brl(delivery)
                    )}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-brand-red">
                    <span>Desconto</span>
                    <span>-{brl(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-display text-lg font-bold">
                  <span>{calculaNoCheckout ? "Total (sem entrega)" : "Total"}</span>
                  <span className="text-brand-red">{brl(total)}</span>
                </div>
              </div>
              <Link
                to="/s/$slug/checkout"
                params={{ slug }}
                onClick={closeDrawer}
                className="mt-4 block"
              >
                <Button className="w-full rounded-full bg-brand-red py-6 font-bold text-base hover:bg-brand-red/90">
                  Finalizar pedido
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}