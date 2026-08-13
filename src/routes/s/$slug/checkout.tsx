import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, MapPin, User, Phone, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { brl } from "@/lib/format";
import { getCartStore, itemUnitPrice, cartSubtotal } from "@/lib/store";
import type { CartItem } from "@/lib/store";
import { useEmpresaPublica, getCupons, getFrete, getBairros } from "@/lib/admin-store";
import { createPedido } from "@/lib/admin-server";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/s/$slug/checkout")({
  component: CheckoutPagina,
});

type FormaPagamento = "pix" | "cartao" | "dinheiro";

function customizationResumo(it: CartItem): string {
  const partes: string[] = [];
  const c = it.customization;
  for (const sel of c.selecoes) {
    if (!sel.valores.length) continue;
    partes.push(
      sel.valores.length > 1
        ? `${sel.categoriaNome}: ${sel.valores.join(", ")}`
        : sel.valores[0],
    );
  }
  if (c.adicionais.length) partes.push(`+ ${c.adicionais.map((a) => a.name).join(", ")}`);
  if (c.remover.length) partes.push(`sem ${c.remover.join(", ")}`);
  if (c.observacoes) partes.push(`obs: ${c.observacoes}`);
  return partes.join(" · ");
}

function CheckoutPagina() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { data: empresaCompleta } = useEmpresaPublica(slug);
  const cart = getCartStore(slug)();
  const { items, coupon, placeOrder } = cart;

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  // Endereço livre — só usado quando a empresa NÃO cadastrou bairros com
  // taxa própria (ver EntregaTab no painel admin).
  const [endereco, setEndereco] = useState("");
  // Endereço estruturado — usado quando a empresa cadastrou bairros. A
  // taxa de entrega é calculada a partir do bairro escolhido.
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairroId, setBairroId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("pix");
  const [trocoPara, setTrocoPara] = useState("");
  const [precisaTroco, setPrecisaTroco] = useState(false);
  const [pixCopiado, setPixCopiado] = useState(false);

  if (!empresaCompleta) return null;
  const { empresa, config } = empresaCompleta;
  const cupons = getCupons(config);
  const frete = getFrete(config);
  const bairros = getBairros(config);

  const subtotal = cartSubtotal(items);
  const entregaGratis =
    frete.gratis_habilitado &&
    frete.gratis_acima_de != null &&
    subtotal >= Number(frete.gratis_acima_de);
  // Se a empresa cadastrou bairros, a taxa vem do bairro escolhido pelo
  // cliente; senão usa a taxa fixa de sempre. O servidor recalcula tudo de
  // novo a partir do banco antes de gravar o pedido — isso aqui é só pra
  // mostrar o valor certo pro cliente antes de confirmar.
  const bairroSelecionado = bairros.find((b) => b.id === bairroId);
  const taxaEntregaBase = bairros.length > 0 ? Number(bairroSelecionado?.fee ?? 0) : Number(frete.taxa);
  const taxaEntrega = subtotal > 0 && !entregaGratis ? taxaEntregaBase : 0;
  const desconto = coupon ? (subtotal * coupon.discount) / 100 : 0;
  const total = subtotal + taxaEntrega - desconto;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="text-6xl">🛒</div>
        <p className="mt-4 font-display text-lg font-semibold">
          Seu carrinho está vazio
        </p>
        <Link to="/s/$slug" params={{ slug }} className="mt-4 inline-block">
          <Button className="rounded-full bg-brand-red hover:bg-brand-red/90">
            Ver cardápio
          </Button>
        </Link>
      </div>
    );
  }

  function copiarPix() {
    if (!empresa.pix_chave) return;
    navigator.clipboard.writeText(empresa.pix_chave).then(() => {
      setPixCopiado(true);
      setTimeout(() => setPixCopiado(false), 2000);
    });
  }

  function labelPagamento(f: FormaPagamento): string {
    if (f === "pix") return "Pix";
    if (f === "cartao") return "Cartão (na entrega)";
    return "Dinheiro";
  }

  async function finalizar() {
    if (!nome.trim() || !telefone.trim()) {
      toast.error("Preenche seu nome e telefone pra continuar.");
      return;
    }
    if (bairros.length > 0 && (!rua.trim() || !numero.trim() || !bairroId)) {
      toast.error("Preenche rua, número e bairro pra calcular a entrega.");
      return;
    }
    if (formaPagamento === "pix" && !empresa.pix_chave) {
      toast.error("Essa loja ainda não cadastrou uma chave Pix. Escolha outra forma de pagamento.");
      return;
    }
    const trocoParaNum = precisaTroco && trocoPara ? Number(trocoPara) : undefined;
    if (formaPagamento === "dinheiro" && precisaTroco) {
      if (!trocoParaNum || trocoParaNum < total) {
        toast.error(`Informe um valor de troco maior ou igual ao total (${brl(total)}).`);
        return;
      }
    }
    // Quando a empresa tem bairros cadastrados, monta o endereço a partir
    // dos campos estruturados (rua, número, bairro); senão usa o texto livre.
    const enderecoFinal =
      bairros.length > 0
        ? `${rua.trim()}, ${numero.trim()} - ${bairroSelecionado?.name ?? ""}`
        : endereco.trim();

    setEnviando(true);
    try {
      // Não manda preço nenhum pro servidor — só produto + opções escolhidas.
      // O servidor recalcula tudo a partir do banco (ver createPedido).
      const itensPedido = items.map((it) => ({
        produtoId: it.productId,
        qtd: it.quantity,
        customization: {
          opcoes: it.customization.selecoes.flatMap((s) => s.valores),
          ingredientesRemovidos: it.customization.remover,
        },
        obs: customizationResumo(it) || undefined,
      }));

      const res = await createPedido({
        data: {
          empresaId: empresaCompleta!.empresa.id,
          clienteNome: nome.trim(),
          clienteTelefone: telefone.trim(),
          endereco: enderecoFinal || undefined,
          bairroId: bairros.length > 0 ? bairroId : undefined,
          itens: itensPedido,
          cupom: coupon?.code,
          formaPagamento,
          trocoPara: trocoParaNum,
        },
      });

      // Usa os valores CONFIRMADOS pelo servidor (não os calculados no
      // client) pra montar a mensagem do WhatsApp e o histórico local.
      const entregaGratisReal = res.taxaEntrega === 0 && res.subtotal > 0;
      const linhaPagamento =
        res.formaPagamento === "dinheiro"
          ? `Pagamento: Dinheiro${res.trocoPara ? ` (troco para ${brl(res.trocoPara)})` : " (sem troco)"}`
          : res.formaPagamento === "pix"
            ? `Pagamento: Pix${empresa.pix_chave ? ` (chave: ${empresa.pix_chave})` : ""}`
            : res.formaPagamento === "cartao"
              ? "Pagamento: Cartão (na entrega)"
              : "";
      const linhas = [
        `Olá! Meu nome é *${nome.trim()}*, quero fazer um pedido (${res.numero}):`,
        "",
        ...res.itens.map(
          (it) =>
            `• ${it.qtd}x ${it.nome}${it.obs ? ` (${it.obs})` : ""} — ${brl(
              it.preco_unit * it.qtd,
            )}`,
        ),
        "",
        `Subtotal: ${brl(res.subtotal)}`,
        entregaGratisReal ? "Entrega: Grátis" : `Entrega: ${brl(res.taxaEntrega)}`,
        ...(res.desconto > 0 ? [`Desconto (${res.cupom}): -${brl(res.desconto)}`] : []),
        `*Total: ${brl(res.valorTotal)}*`,
        "",
        ...(linhaPagamento ? [linhaPagamento] : []),
        ...(enderecoFinal ? [`Endereço: ${enderecoFinal}`] : []),
        `Telefone: ${telefone.trim()}`,
      ];
      const msg = encodeURIComponent(linhas.join("\n"));
      const numeroWhats = empresa.whatsapp.replace(/\D/g, "");

      placeOrder({
        items,
        total: res.valorTotal,
        address: endereco.trim(),
        payment: labelPagamento(formaPagamento),
      });
      window.open(`https://wa.me/${numeroWhats}?text=${msg}`, "_blank");
      toast.success(`Pedido ${res.numero} registrado! Confirma no WhatsApp que abriu.`);
      navigate({ to: "/s/$slug", params: { slug } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar pedido");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-32 pt-4 md:px-8">
      <Link
        to="/s/$slug"
        params={{ slug }}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-brown"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="font-display text-2xl font-bold">Finalizar pedido</h1>

      <div className="mt-6 space-y-4 rounded-3xl bg-card p-5 card-shadow">
        <div>
          <Label htmlFor="nome" className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" /> Seu nome
          </Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="tel" className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" /> Telefone / WhatsApp
          </Label>
          <Input
            id="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(00) 00000-0000"
            className="mt-1"
          />
        </div>
        {bairros.length > 0 ? (
          <div className="space-y-3">
            <Label className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Endereço de entrega
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Label htmlFor="rua" className="text-xs text-muted-foreground">
                  Rua
                </Label>
                <Input
                  id="rua"
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                  placeholder="Ex: Rua das Flores"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="numero" className="text-xs text-muted-foreground">
                  Número
                </Label>
                <Input
                  id="numero"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Ex: 123"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bairro" className="text-xs text-muted-foreground">
                Bairro
              </Label>
              <select
                id="bairro"
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={bairroId}
                onChange={(e) => setBairroId(e.target.value)}
              >
                <option value="">Selecione o bairro...</option>
                {bairros.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {brl(b.fee)}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                A taxa de entrega é calculada automaticamente pelo bairro escolhido.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <Label htmlFor="end" className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Endereço de entrega (opcional se for retirar)
            </Label>
            <Textarea
              id="end"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, número, bairro, referência..."
              className="mt-1"
            />
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3 rounded-3xl bg-card p-5 card-shadow">
        <div className="font-display text-base font-semibold">Forma de pagamento</div>
        <div className="grid grid-cols-3 gap-2">
          {(["pix", "cartao", "dinheiro"] as FormaPagamento[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormaPagamento(f)}
              className={cn(
                "rounded-2xl border px-3 py-2 text-sm font-semibold transition",
                formaPagamento === f
                  ? "border-brand-red bg-brand-red text-white"
                  : "border-border bg-background hover:bg-muted",
              )}
            >
              {labelPagamento(f)}
            </button>
          ))}
        </div>

        {formaPagamento === "pix" && (
          <div className="rounded-2xl border border-brand-yellow/40 bg-brand-yellow/10 p-3 text-sm">
            {empresa.pix_chave ? (
              <>
                <p className="font-semibold">Chave Pix da loja:</p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 break-all rounded-lg bg-background px-2 py-1.5 text-xs">
                    {empresa.pix_chave}
                  </code>
                  <Button type="button" size="sm" variant="outline" onClick={copiarPix}>
                    {pixCopiado ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Copie a chave, faça o Pix e envie o comprovante junto com o
                  pedido pelo WhatsApp.
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Essa loja ainda não cadastrou uma chave Pix. Combine o
                pagamento direto pelo WhatsApp ou escolha outra forma.
              </p>
            )}
          </div>
        )}

        {formaPagamento === "cartao" && (
          <p className="text-xs text-muted-foreground">
            Leva a maquininha (débito/crédito) na hora da entrega ou retirada.
          </p>
        )}

        {formaPagamento === "dinheiro" && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={precisaTroco}
                onChange={(e) => {
                  setPrecisaTroco(e.target.checked);
                  if (!e.target.checked) setTrocoPara("");
                }}
              />
              Vou precisar de troco
            </label>
            {precisaTroco && (
              <div>
                <Label htmlFor="troco">Troco para quanto?</Label>
                <Input
                  id="troco"
                  type="number"
                  step="0.01"
                  min={total}
                  placeholder={`Ex: ${Math.ceil(total / 10) * 10}`}
                  value={trocoPara}
                  onChange={(e) => setTrocoPara(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1 rounded-3xl bg-card p-5 text-sm card-shadow">
        <div className="mb-3 font-display text-base font-semibold">Resumo</div>
        {items.map((it) => (
          <div key={it.id} className="flex justify-between gap-2 py-1">
            <span className="text-muted-foreground">
              {it.quantity}x {it.name}
            </span>
            <span>{brl(itemUnitPrice(it) * it.quantity)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t pt-2">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{brl(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Entrega</span>
          <span>{entregaGratis ? "Grátis" : brl(taxaEntrega)}</span>
        </div>
        {desconto > 0 && (
          <div className="flex justify-between text-brand-red">
            <span>Desconto</span>
            <span>-{brl(desconto)}</span>
          </div>
        )}
        <div className="flex justify-between border-t pt-2 font-display text-lg font-bold">
          <span>Total</span>
          <span className="text-brand-red">{brl(total)}</span>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card p-4 shadow-2xl">
        <div className="mx-auto max-w-2xl">
          <Button
            onClick={finalizar}
            disabled={enviando}
            className="h-12 w-full rounded-full bg-brand-red text-base font-bold hover:bg-brand-red/90"
          >
            {enviando ? "Enviando..." : `Confirmar e enviar no WhatsApp · ${brl(total)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
