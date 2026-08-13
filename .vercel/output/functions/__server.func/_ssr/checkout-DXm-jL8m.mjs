import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as Route$7, m as createPedido } from "./router-DYFXKq1T.mjs";
import { a as getFrete, f as useEmpresaPublica, i as getCupons, t as getBairros } from "./admin-store-CsIVidas.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as brl } from "./format-GUzbl2Vi.mjs";
import { i as itemUnitPrice, n as cartSubtotal, r as getCartStore } from "./store-CCH2-yNj.mjs";
import { C as ArrowLeft, S as Check, f as Phone, m as MapPin, n as User, v as Copy } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checkout-DXm-jL8m.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function customizationResumo(it) {
	const partes = [];
	const c = it.customization;
	for (const sel of c.selecoes) {
		if (!sel.valores.length) continue;
		partes.push(sel.valores.length > 1 ? `${sel.categoriaNome}: ${sel.valores.join(", ")}` : sel.valores[0]);
	}
	if (c.adicionais.length) partes.push(`+ ${c.adicionais.map((a) => a.name).join(", ")}`);
	if (c.remover.length) partes.push(`sem ${c.remover.join(", ")}`);
	if (c.observacoes) partes.push(`obs: ${c.observacoes}`);
	return partes.join(" · ");
}
function CheckoutPagina() {
	const { slug } = Route$7.useParams();
	const navigate = useNavigate();
	const { data: empresaCompleta } = useEmpresaPublica(slug);
	const { items, coupon, placeOrder } = getCartStore(slug)();
	const [nome, setNome] = (0, import_react.useState)("");
	const [telefone, setTelefone] = (0, import_react.useState)("");
	const [endereco, setEndereco] = (0, import_react.useState)("");
	const [rua, setRua] = (0, import_react.useState)("");
	const [numero, setNumero] = (0, import_react.useState)("");
	const [bairroId, setBairroId] = (0, import_react.useState)("");
	const [enviando, setEnviando] = (0, import_react.useState)(false);
	const [formaPagamento, setFormaPagamento] = (0, import_react.useState)("pix");
	const [trocoPara, setTrocoPara] = (0, import_react.useState)("");
	const [precisaTroco, setPrecisaTroco] = (0, import_react.useState)(false);
	const [pixCopiado, setPixCopiado] = (0, import_react.useState)(false);
	if (!empresaCompleta) return null;
	const { empresa, config } = empresaCompleta;
	getCupons(config);
	const frete = getFrete(config);
	const bairros = getBairros(config);
	const subtotal = cartSubtotal(items);
	const entregaGratis = frete.gratis_habilitado && frete.gratis_acima_de != null && subtotal >= Number(frete.gratis_acima_de);
	const bairroSelecionado = bairros.find((b) => b.id === bairroId);
	const taxaEntregaBase = bairros.length > 0 ? Number(bairroSelecionado?.fee ?? 0) : Number(frete.taxa);
	const taxaEntrega = subtotal > 0 && !entregaGratis ? taxaEntregaBase : 0;
	const desconto = coupon ? subtotal * coupon.discount / 100 : 0;
	const total = subtotal + taxaEntrega - desconto;
	if (items.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg px-4 py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-6xl",
				children: "🛒"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 font-display text-lg font-semibold",
				children: "Seu carrinho está vazio"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/s/$slug",
				params: { slug },
				className: "mt-4 inline-block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "rounded-full bg-brand-red hover:bg-brand-red/90",
					children: "Ver cardápio"
				})
			})
		]
	});
	function copiarPix() {
		if (!empresa.pix_chave) return;
		navigator.clipboard.writeText(empresa.pix_chave).then(() => {
			setPixCopiado(true);
			setTimeout(() => setPixCopiado(false), 2e3);
		});
	}
	function labelPagamento(f) {
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
		const trocoParaNum = precisaTroco && trocoPara ? Number(trocoPara) : void 0;
		if (formaPagamento === "dinheiro" && precisaTroco) {
			if (!trocoParaNum || trocoParaNum < total) {
				toast.error(`Informe um valor de troco maior ou igual ao total (${brl(total)}).`);
				return;
			}
		}
		const enderecoFinal = bairros.length > 0 ? `${rua.trim()}, ${numero.trim()} - ${bairroSelecionado?.name ?? ""}` : endereco.trim();
		setEnviando(true);
		try {
			const itensPedido = items.map((it) => ({
				produtoId: it.productId,
				qtd: it.quantity,
				customization: {
					opcoes: it.customization.selecoes.flatMap((s) => s.valores),
					ingredientesRemovidos: it.customization.remover
				},
				obs: customizationResumo(it) || void 0
			}));
			const res = await createPedido({ data: {
				empresaId: empresaCompleta.empresa.id,
				clienteNome: nome.trim(),
				clienteTelefone: telefone.trim(),
				endereco: enderecoFinal || void 0,
				bairroId: bairros.length > 0 ? bairroId : void 0,
				itens: itensPedido,
				cupom: coupon?.code,
				formaPagamento,
				trocoPara: trocoParaNum
			} });
			const entregaGratisReal = res.taxaEntrega === 0 && res.subtotal > 0;
			const linhaPagamento = res.formaPagamento === "dinheiro" ? `Pagamento: Dinheiro${res.trocoPara ? ` (troco para ${brl(res.trocoPara)})` : " (sem troco)"}` : res.formaPagamento === "pix" ? `Pagamento: Pix${empresa.pix_chave ? ` (chave: ${empresa.pix_chave})` : ""}` : res.formaPagamento === "cartao" ? "Pagamento: Cartão (na entrega)" : "";
			const linhas = [
				`Olá! Meu nome é *${nome.trim()}*, quero fazer um pedido (${res.numero}):`,
				"",
				...res.itens.map((it) => `• ${it.qtd}x ${it.nome}${it.obs ? ` (${it.obs})` : ""} — ${brl(it.preco_unit * it.qtd)}`),
				"",
				`Subtotal: ${brl(res.subtotal)}`,
				entregaGratisReal ? "Entrega: Grátis" : `Entrega: ${brl(res.taxaEntrega)}`,
				...res.desconto > 0 ? [`Desconto (${res.cupom}): -${brl(res.desconto)}`] : [],
				`*Total: ${brl(res.valorTotal)}*`,
				"",
				...linhaPagamento ? [linhaPagamento] : [],
				...enderecoFinal ? [`Endereço: ${enderecoFinal}`] : [],
				`Telefone: ${telefone.trim()}`
			];
			const msg = encodeURIComponent(linhas.join("\n"));
			const numeroWhats = empresa.whatsapp.replace(/\D/g, "");
			placeOrder({
				items,
				total: res.valorTotal,
				address: endereco.trim(),
				payment: labelPagamento(formaPagamento)
			});
			window.open(`https://wa.me/${numeroWhats}?text=${msg}`, "_blank");
			toast.success(`Pedido ${res.numero} registrado! Confirma no WhatsApp que abriu.`);
			navigate({
				to: "/s/$slug",
				params: { slug }
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Erro ao enviar pedido");
		} finally {
			setEnviando(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 pb-32 pt-4 md:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/s/$slug",
				params: { slug },
				className: "mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-brown",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Voltar"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold",
				children: "Finalizar pedido"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-4 rounded-3xl bg-card p-5 card-shadow",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: "nome",
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-3.5 w-3.5" }), " Seu nome"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "nome",
						value: nome,
						onChange: (e) => setNome(e.target.value),
						className: "mt-1"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: "tel",
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3.5 w-3.5" }), " Telefone / WhatsApp"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "tel",
						value: telefone,
						onChange: (e) => setTelefone(e.target.value),
						placeholder: "(00) 00000-0000",
						className: "mt-1"
					})] }),
					bairros.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" }), " Endereço de entrega"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "rua",
										className: "text-xs text-muted-foreground",
										children: "Rua"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "rua",
										value: rua,
										onChange: (e) => setRua(e.target.value),
										placeholder: "Ex: Rua das Flores",
										className: "mt-1"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "numero",
									className: "text-xs text-muted-foreground",
									children: "Número"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "numero",
									value: numero,
									onChange: (e) => setNumero(e.target.value),
									placeholder: "Ex: 123",
									className: "mt-1"
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "bairro",
									className: "text-xs text-muted-foreground",
									children: "Bairro"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									id: "bairro",
									className: "mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm",
									value: bairroId,
									onChange: (e) => setBairroId(e.target.value),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Selecione o bairro..."
									}), bairros.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: b.id,
										children: [
											b.name,
											" — ",
											brl(b.fee)
										]
									}, b.id))]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: "A taxa de entrega é calculada automaticamente pelo bairro escolhido."
								})
							] })
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: "end",
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" }), " Endereço de entrega (opcional se for retirar)"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "end",
						value: endereco,
						onChange: (e) => setEndereco(e.target.value),
						placeholder: "Rua, número, bairro, referência...",
						className: "mt-1"
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-3 rounded-3xl bg-card p-5 card-shadow",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-base font-semibold",
						children: "Forma de pagamento"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 gap-2",
						children: [
							"pix",
							"cartao",
							"dinheiro"
						].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setFormaPagamento(f),
							className: cn("rounded-2xl border px-3 py-2 text-sm font-semibold transition", formaPagamento === f ? "border-brand-red bg-brand-red text-white" : "border-border bg-background hover:bg-muted"),
							children: labelPagamento(f)
						}, f))
					}),
					formaPagamento === "pix" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-2xl border border-brand-yellow/40 bg-brand-yellow/10 p-3 text-sm",
						children: empresa.pix_chave ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: "Chave Pix da loja:"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "flex-1 break-all rounded-lg bg-background px-2 py-1.5 text-xs",
									children: empresa.pix_chave
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									size: "sm",
									variant: "outline",
									onClick: copiarPix,
									children: pixCopiado ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-3.5 w-3.5" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: "Copie a chave, faça o Pix e envie o comprovante junto com o pedido pelo WhatsApp."
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Essa loja ainda não cadastrou uma chave Pix. Combine o pagamento direto pelo WhatsApp ou escolha outra forma."
						})
					}),
					formaPagamento === "cartao" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Leva a maquininha (débito/crédito) na hora da entrega ou retirada."
					}),
					formaPagamento === "dinheiro" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: precisaTroco,
								onChange: (e) => {
									setPrecisaTroco(e.target.checked);
									if (!e.target.checked) setTrocoPara("");
								}
							}), "Vou precisar de troco"]
						}), precisaTroco && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "troco",
							children: "Troco para quanto?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "troco",
							type: "number",
							step: "0.01",
							min: total,
							placeholder: `Ex: ${Math.ceil(total / 10) * 10}`,
							value: trocoPara,
							onChange: (e) => setTrocoPara(e.target.value),
							className: "mt-1"
						})] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-1 rounded-3xl bg-card p-5 text-sm card-shadow",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-3 font-display text-base font-semibold",
						children: "Resumo"
					}),
					items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between gap-2 py-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								it.quantity,
								"x ",
								it.name
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: brl(itemUnitPrice(it) * it.quantity) })]
					}, it.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex justify-between border-t pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Subtotal"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: brl(subtotal) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Entrega"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: entregaGratis ? "Grátis" : brl(taxaEntrega) })]
					}),
					desconto > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-brand-red",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Desconto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["-", brl(desconto)] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between border-t pt-2 font-display text-lg font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-brand-red",
							children: brl(total)
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card p-4 shadow-2xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-2xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: finalizar,
						disabled: enviando,
						className: "h-12 w-full rounded-full bg-brand-red text-base font-bold hover:bg-brand-red/90",
						children: enviando ? "Enviando..." : `Confirmar e enviar no WhatsApp · ${brl(total)}`
					})
				})
			})
		]
	});
}
//#endregion
export { CheckoutPagina as component };
