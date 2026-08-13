import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { d as useRouterState, m as Outlet, v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { f as Route$11 } from "./_ssr/router-DYFXKq1T.mjs";
import { a as getFrete, f as useEmpresaPublica, i as getCupons, n as getCidadeEntrega, o as getHorarios, r as getCores, t as getBairros, v as useStoreOpenStatus } from "./_ssr/admin-store-CsIVidas.mjs";
import { t as cva } from "./_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./_ssr/utils-C_uf36nf.mjs";
import { t as brl } from "./_ssr/format-GUzbl2Vi.mjs";
import { i as itemUnitPrice, n as cartSubtotal, r as getCartStore, t as cartCount } from "./_ssr/store-CCH2-yNj.mjs";
import { _ as Heart, d as Plus, g as House, l as ShoppingBag, m as MapPin, o as Trash2, p as Minus, s as Tag, t as X, u as Search } from "./_libs/lucide-react.mjs";
import { t as Button } from "./_ssr/button-Bq5vK6RO.mjs";
import { t as Input } from "./_ssr/input-B8Q2ztVi.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "./_libs/@radix-ui/react-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-DoWzKsxg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Sheet = Dialog;
var SheetPortal = DialogPortal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = DialogContent.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = DialogTitle.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = DialogDescription.displayName;
function CartDrawer({ slug, config }) {
	const { drawerOpen, closeDrawer, items, updateQty, removeItem, coupon, applyCoupon } = getCartStore(slug)();
	const [code, setCode] = (0, import_react.useState)("");
	const cupons = getCupons(config);
	const frete = getFrete(config);
	const bairros = getBairros(config);
	const subtotal = cartSubtotal(items);
	const entregaGratis = frete.gratis_habilitado && frete.gratis_acima_de != null && subtotal >= Number(frete.gratis_acima_de);
	const delivery = subtotal > 0 && !entregaGratis && bairros.length === 0 ? Number(frete.taxa) : 0;
	const calculaNoCheckout = bairros.length > 0 && subtotal > 0 && !entregaGratis;
	const discount = coupon ? subtotal * coupon.discount / 100 : 0;
	const total = subtotal + delivery - discount;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open: drawerOpen,
		onOpenChange: (o) => o ? null : closeDrawer(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			side: "right",
			className: "flex w-full flex-col gap-0 p-0 sm:max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetHeader, {
				className: "border-b bg-brand-cream p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetTitle, {
					className: "flex items-center gap-2 font-display text-2xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-6 w-6 text-brand-red" }), "Seu Carrinho"]
				})
			}), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-24 w-24 place-items-center rounded-full bg-muted text-4xl",
						children: "🛒"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg font-semibold",
						children: "Seu carrinho está vazio"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Que tal um dos nossos clássicos?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: closeDrawer,
						className: "mt-2 rounded-full bg-brand-red hover:bg-brand-red/90",
						children: "Ver cardápio"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 overflow-y-auto p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4",
					children: items.map((it) => {
						const unit = itemUnitPrice(it);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3 rounded-2xl bg-card p-3 card-shadow",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: it.image,
								alt: it.name,
								className: "h-20 w-20 shrink-0 rounded-xl object-cover"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "truncate font-display font-semibold",
											children: it.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => removeItem(it.id),
											className: "text-muted-foreground hover:text-brand-red",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
										})]
									}),
									it.customization.selecoes.some((s) => s.valores.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 text-xs text-muted-foreground",
										children: it.customization.selecoes.flatMap((s) => s.valores).join(" · ")
									}),
									it.customization.adicionais.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-0.5 text-xs text-muted-foreground",
										children: ["+ ", it.customization.adicionais.map((a) => a.name).join(", ")]
									}),
									it.customization.remover.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-0.5 text-xs text-brand-red",
										children: ["Sem ", it.customization.remover.join(", ")]
									}),
									it.customization.observacoes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-0.5 line-clamp-1 text-xs italic text-muted-foreground",
										children: [
											"\"",
											it.customization.observacoes,
											"\""
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1 rounded-full border bg-background p-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => updateQty(it.id, it.quantity - 1),
													className: "grid h-7 w-7 place-items-center rounded-full hover:bg-muted",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-3 w-3" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "w-6 text-center text-sm font-semibold",
													children: it.quantity
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => updateQty(it.id, it.quantity + 1),
													className: "grid h-7 w-7 place-items-center rounded-full bg-brand-red text-white hover:bg-brand-red/90",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" })
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-display font-bold text-brand-red",
											children: brl(unit * it.quantity)
										})]
									})
								]
							})]
						}, it.id);
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 rounded-2xl border border-dashed border-brand-yellow bg-brand-yellow/10 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center gap-2 text-sm font-semibold text-brand-brown",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-4 w-4" }), " Cupom de desconto"]
						}),
						coupon ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-semibold text-brand-red",
							children: [
								"Cupom ",
								coupon.code,
								" aplicado! -",
								coupon.discount,
								"%"
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "CUPOM",
								value: code,
								onChange: (e) => setCode(e.target.value),
								className: "rounded-full bg-white"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => {
									if (applyCoupon(code, cupons)) toast.success("Cupom aplicado!");
									else toast.error("Cupom inválido");
								},
								className: "rounded-full bg-brand-brown hover:bg-brand-brown/90",
								children: "Aplicar"
							})]
						}),
						cupons.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-[11px] text-muted-foreground",
							children: ["Disponíveis: ", cupons.map((c) => c.code).join(", ")]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t bg-white p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "Subtotal"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: brl(subtotal) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "Taxa de entrega"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: entregaGratis ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-green-700",
								children: "Grátis"
							}) : calculaNoCheckout ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "calculada no checkout"
							}) : brl(delivery) })]
						}),
						discount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between text-brand-red",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Desconto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["-", brl(discount)] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between border-t pt-2 font-display text-lg font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: calculaNoCheckout ? "Total (sem entrega)" : "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-brand-red",
								children: brl(total)
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/s/$slug/checkout",
					params: { slug },
					className: "mt-4 block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full rounded-full bg-brand-red py-6 font-bold text-base hover:bg-brand-red/90",
						children: "Finalizar pedido"
					})
				})]
			})] })]
		})
	});
}
function AppShell({ children, empresaCompleta, slug }) {
	const { empresa, config } = empresaCompleta;
	const cores = getCores(config);
	getHorarios(config);
	const cidade = getCidadeEntrega(config);
	const cssVars = `:root{${[
		`--brand-red:${cores.primary};`,
		`--brand-yellow:${cores.accent};`,
		`--brand-cream:${cores.bg};`,
		`--brand-brown:${cores.fg};`
	].join("")}}`;
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background pb-20 md:pb-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { dangerouslySetInnerHTML: { __html: cssVars } }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartDrawer, {
				slug,
				config
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-40 border-b border-brand-yellow/30 bg-brand-cream/95 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/s/$slug",
							params: { slug },
							className: "flex min-w-0 items-center gap-2",
							children: [empresa.logo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: empresa.logo_url,
								alt: empresa.nome,
								className: "h-10 w-10 shrink-0 rounded-2xl object-cover shadow-md"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-red font-display text-lg font-bold text-white shadow-md",
								children: empresa.nome[0]?.toUpperCase()
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate font-display text-2xl font-bold leading-none text-brand-brown sm:text-lg",
									children: empresa.nome
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-muted-foreground sm:text-[11px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex min-w-0 items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate",
											children: cidade || "—"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpenBadge, { cfg: config })]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "ml-6 hidden items-center gap-1 md:flex",
							children: [
								{
									to: "/s/$slug",
									label: "Cardápio",
									params: { slug }
								},
								{
									to: "/s/$slug/promotions",
									label: "Promoções",
									params: { slug }
								},
								{
									to: "/s/$slug/location",
									label: "Localização",
									params: { slug }
								},
								{
									to: "/s/$slug/favorites",
									label: "Favoritos",
									params: { slug }
								}
							].map((l) => {
								const path = l.to.replace("$slug", slug).replace(/\/\$slug\/promotions$/, "/s/" + slug + "/promotions");
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: l.to,
									params: l.params,
									className: cn("rounded-full px-4 py-2 text-sm font-semibold transition", pathname === path ? "bg-brand-red text-white" : "text-brand-brown hover:bg-brand-yellow/30"),
									children: l.label
								}, l.label);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex shrink-0 items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/s/$slug/favorites",
								params: { slug },
								className: "hidden h-11 w-11 place-items-center rounded-full border border-brand-yellow/40 bg-white text-brand-brown transition hover:bg-brand-yellow/20 md:grid",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartButton, { slug })]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 border-t border-brand-yellow/40 bg-white/95 backdrop-blur md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto flex max-w-md items-center justify-around px-2 py-2",
					children: [
						{
							to: "/s/$slug",
							label: "Início",
							icon: House,
							params: { slug }
						},
						{
							to: "/s/$slug/search",
							label: "Buscar",
							icon: Search,
							params: { slug }
						},
						{
							to: "/s/$slug/orders",
							label: "Pedidos",
							icon: ShoppingBag,
							params: { slug }
						},
						{
							to: "/s/$slug/favorites",
							label: "Favoritos",
							icon: Heart,
							params: { slug }
						}
					].map((n) => {
						const path = n.to.replace("$slug", slug);
						const active = pathname === path;
						const Icon = n.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: n.to,
							params: n.params,
							className: cn("flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-[11px] font-semibold transition", active ? "text-brand-red" : "text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("h-5 w-5", active && "scale-110") }), n.label]
						}, n.label);
					})
				})
			})
		]
	});
}
function OpenBadge({ cfg }) {
	const open = useStoreOpenStatus(cfg);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "flex shrink-0 items-center gap-1 font-semibold",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1.5 w-1.5 shrink-0 rounded-full", open ? "bg-green-500" : "bg-red-500") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: open ? "text-green-700" : "text-red-700",
			children: open ? "Aberto agora" : "Fechado"
		})]
	});
}
function CartButton({ slug }) {
	const { items, openDrawer } = useCart(slug);
	const count = cartCount(items);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: openDrawer,
		className: "relative flex h-11 items-center gap-2 rounded-full bg-brand-red px-4 text-sm font-bold text-white shadow-lg transition hover:scale-105",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-5 w-5" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden sm:inline",
				children: "Carrinho"
			}),
			count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-6 min-w-6 place-items-center rounded-full bg-brand-yellow px-1.5 text-xs font-bold text-brand-brown",
				children: count
			})
		]
	});
}
function useCart(slug) {
	return getCartStore(slug)();
}
function TenantLayout() {
	const { slug } = Route$11.useParams();
	const { data, isLoading, error } = useEmpresaPublica(slug);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-brand-cream",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-brand-yellow border-t-brand-red" })
	});
	if (error || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-7xl",
					children: "🍽️"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 font-display text-2xl font-bold",
					children: "Cardápio indisponível"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted-foreground",
					children: "Esse link não corresponde a uma empresa ativa no pedidoPronto."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mt-6 inline-flex items-center justify-center rounded-full bg-brand-red px-6 py-3 font-semibold text-white",
					children: "Ver outros cardápios"
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		empresaCompleta: data,
		slug,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	});
}
//#endregion
export { TenantLayout as component };
