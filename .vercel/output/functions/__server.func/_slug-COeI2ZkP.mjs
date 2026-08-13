import { a as __toESM } from "./__23tanstack-start-server-fn-resolver-RQ4HTkDC.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "./_libs/@radix-ui/react-arrow+[...].mjs";
import { _ as useProdutosPorEmpresa, c as useCategoriasAtivas, f as useEmpresaPublica, u as useDestaques } from "./_ssr/admin-store-AVdk2wK5.mjs";
import { t as brl } from "./_ssr/format-GUzbl2Vi.mjs";
import { c as Star, i as Truck, u as Search, y as Clock } from "./_libs/lucide-react.mjs";
import { t as ProductCard } from "./_ssr/ProductCard-rl6rSAdN.mjs";
import { t as Route } from "./_slug-D17qUFsT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-COeI2ZkP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TenantHome() {
	const { slug } = Route.useParams();
	const { data: empresaCompleta } = useEmpresaPublica(slug);
	const categorias = useCategoriasAtivas(empresaCompleta);
	const produtos = useProdutosPorEmpresa(empresaCompleta);
	const feats = useDestaques(empresaCompleta);
	const promo = (0, import_react.useMemo)(() => {
		return produtos.find((p) => p.tag === "promocao") ?? produtos[0];
	}, [produtos]);
	const maisVendidos = (0, import_react.useMemo)(() => produtos.filter((p) => p.tag === "mais-vendido"), [produtos]);
	(0, import_react.useMemo)(() => produtos.filter((p) => p.tag != null), [produtos]);
	if (!empresaCompleta) return null;
	const { empresa, config } = empresaCompleta;
	const cidade = config.cidade_entrega ?? "";
	const whatsapp = empresa.whatsapp;
	const frete = config.frete ?? {};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/s/$slug/search",
				params: { slug },
				className: "flex h-12 items-center gap-3 rounded-full border border-brand-yellow/40 bg-white px-5 text-muted-foreground card-shadow",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-5 w-5 text-brand-red" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm",
					children: "Buscar por nome, ingrediente ou categoria..."
				})]
			}),
			promo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hero-gradient relative overflow-hidden rounded-3xl p-6 text-white md:p-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative z-10 max-w-md",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-flex items-center gap-1 rounded-full bg-brand-yellow px-3 py-1 text-xs font-bold text-brand-brown",
								children: "🔥 Promoção do dia"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "mt-4 font-display text-4xl font-bold leading-tight md:text-5xl",
								children: [promo.nome, promo.preco_antigo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"com ",
									Math.round((1 - promo.preco / promo.preco_antigo) * 100),
									"% OFF"
								] }) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-sm text-white/85 md:text-base",
								children: [promo.descricao_curta, " Só hoje!"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/s/$slug/product/$id",
									params: {
										slug,
										id: promo.id
									},
									className: "rounded-full bg-brand-yellow px-6 py-3 font-display font-bold text-brand-brown shadow-lg transition hover:scale-105",
									children: ["Pedir agora — ", brl(promo.preco)]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/s/$slug/promotions",
									params: { slug },
									className: "text-sm font-semibold text-white/90 underline underline-offset-4",
									children: "Ver todas"
								})]
							})
						]
					}), promo.imagem_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: promo.imagem_url,
						alt: promo.nome,
						className: "pointer-events-none absolute -right-8 -bottom-8 h-64 w-64 rounded-full object-cover opacity-95 shadow-2xl md:h-80 md:w-80"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-4 rounded-3xl bg-card p-5 card-shadow",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-14 w-14 place-items-center rounded-2xl bg-brand-yellow/30 text-brand-red",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-6 w-6" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display font-bold",
								children: "25-40 min"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: "Entrega rápida na sua casa"
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-4 rounded-3xl bg-brand-red p-5 text-white shadow-lg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-white",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "h-6 w-6" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display font-bold",
								children: "Frete por bairro"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-white/80",
								children: frete.gratis_habilitado && frete.gratis_acima_de ? `Grátis em pedidos +${brl(frete.gratis_acima_de)}` : "Valor calculado no checkout"
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-4 rounded-3xl bg-card p-5 card-shadow sm:col-span-2 lg:col-span-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-14 w-14 place-items-center rounded-2xl bg-brand-brown/10 text-brand-brown",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-6 w-6 fill-current" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display font-bold",
								children: "4.9 · +2.3k avaliações"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: "O melhor da cidade"
							})] })]
						})
					]
				})]
			}),
			categorias.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-4 flex items-end justify-between",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-bold",
						children: "Categorias"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-3 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-6 md:overflow-visible",
					children: categorias.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/s/$slug/category/$catSlug",
						params: {
							slug,
							catSlug: c.slug
						},
						className: "group flex min-w-[110px] shrink-0 flex-col items-center gap-2 rounded-3xl bg-card p-4 card-shadow transition hover:-translate-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-brand-cream text-3xl",
							children: c.imagem_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: c.imagem_url,
								alt: c.nome,
								className: "h-full w-full object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: c.emoji })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-semibold text-brand-brown",
							children: c.nome
						})]
					}, c.id))
				})]
			}),
			feats.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-end justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-bold",
						children: "Destaques"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/s/$slug/category/$catSlug",
						params: {
							slug,
							catSlug: categorias[0]?.slug ?? ""
						},
						className: "text-sm font-semibold text-brand-red",
						children: "Ver tudo →"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
					children: feats.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
						produto: p,
						slug
					}, p.id))
				})]
			}),
			maisVendidos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-4 flex items-end justify-between",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-bold",
						children: "Mais vendidos"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 md:grid-cols-2",
					children: maisVendidos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
						produto: p,
						layout: "row",
						slug
					}, p.id))
				})]
			}),
			categorias.length > 0 && categorias.map((c) => {
				const produtosDaCategoria = produtos.filter((p) => p.categoria_id === c.id);
				if (produtosDaCategoria.length === 0) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-4 flex items-end justify-between",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl font-bold",
							children: c.nome
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
						children: produtosDaCategoria.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
							produto: p,
							slug
						}, p.id))
					})]
				}, c.id);
			}),
			empresa.endereco && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mt-10 overflow-hidden rounded-3xl bg-brand-brown text-white",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 p-6 md:grid-cols-2 md:p-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-block rounded-full bg-brand-yellow px-3 py-1 text-xs font-bold text-brand-brown",
							children: "Visite a loja"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-3 font-display text-3xl font-bold",
							children: "Passa lá pra provar"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-white/80",
							children: [
								empresa.endereco,
								" ",
								cidade ? `· ${cidade}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex flex-wrap gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/s/$slug/location",
								params: { slug },
								className: "rounded-full bg-brand-red px-5 py-2.5 font-semibold",
								children: "Como chegar"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: `https://wa.me/${whatsapp}`,
								target: "_blank",
								rel: "noopener",
								className: "rounded-full bg-white px-5 py-2.5 font-semibold text-brand-brown",
								children: "WhatsApp"
							})]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/s/$slug/location",
						params: { slug },
						className: "relative block min-h-40 overflow-hidden rounded-2xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
							title: "Mapa",
							src: `https://www.google.com/maps?q=${encodeURIComponent(empresa.endereco)}&output=embed`,
							className: "pointer-events-none h-full w-full border-0",
							loading: "lazy",
							referrerPolicy: "no-referrer-when-downgrade"
						})
					})]
				})
			})
		]
	});
}
//#endregion
export { TenantHome as component };
