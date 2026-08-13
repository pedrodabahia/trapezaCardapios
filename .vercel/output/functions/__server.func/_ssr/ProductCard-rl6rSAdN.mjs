import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as brl } from "./format-GUzbl2Vi.mjs";
import { r as getCartStore } from "./store-CCH2-yNj.mjs";
import { _ as Heart, d as Plus } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ProductCard-rl6rSAdN.js
var import_jsx_runtime = require_jsx_runtime();
var tagStyles = {
	"mais-vendido": "bg-brand-yellow text-brand-brown",
	"promocao": "bg-brand-red text-white",
	"novo": "bg-brand-brown text-white"
};
var tagLabels = {
	"mais-vendido": "Mais vendido",
	"promocao": "Promoção",
	"novo": "Novo"
};
function ProductCard({ produto, slug, layout = "grid" }) {
	const { favorites, toggleFav } = getCartStore(slug)();
	const fav = favorites.includes(produto.id);
	if (layout === "row") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/s/$slug/product/$id",
		params: {
			slug,
			id: produto.id
		},
		className: "group flex min-w-0 gap-3 rounded-2xl bg-card p-3 card-shadow transition hover:-translate-y-0.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted",
			children: produto.imagem_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: produto.imagem_url,
				alt: produto.nome,
				className: "h-full w-full object-cover",
				loading: "lazy"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "min-w-0 truncate font-display text-base font-semibold",
						children: produto.nome
					}), produto.tag && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", tagStyles[produto.tag]),
						children: tagLabels[produto.tag]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 line-clamp-2 text-xs text-muted-foreground",
					children: produto.descricao_curta
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex items-end justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-lg font-bold text-brand-red",
							children: brl(produto.preco)
						}), produto.preco_antigo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground line-through",
							children: brl(produto.preco_antigo)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: (e) => {
							e.preventDefault();
							e.stopPropagation();
							toggleFav(produto.id);
						},
						className: "grid h-8 w-8 place-items-center rounded-full bg-muted",
						"aria-label": "Favoritar",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("h-4 w-4", fav ? "fill-brand-red text-brand-red" : "text-muted-foreground") })
					})]
				})
			]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/s/$slug/product/$id",
		params: {
			slug,
			id: produto.id
		},
		className: "group relative flex flex-col overflow-hidden rounded-3xl bg-card card-shadow transition hover:-translate-y-1 hover:shadow-lg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-[4/3] overflow-hidden bg-muted",
			children: [
				produto.imagem_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: produto.imagem_url,
					alt: produto.nome,
					className: "h-full w-full object-cover transition group-hover:scale-105",
					loading: "lazy"
				}),
				produto.tag && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow", tagStyles[produto.tag]),
					children: tagLabels[produto.tag]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: (e) => {
						e.preventDefault();
						e.stopPropagation();
						toggleFav(produto.id);
					},
					className: "absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur transition hover:scale-110",
					"aria-label": "Favoritar",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("h-4 w-4", fav ? "fill-brand-red text-brand-red" : "text-brand-brown") })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col gap-2 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg font-semibold leading-tight",
					children: produto.nome
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "line-clamp-2 text-sm text-muted-foreground",
					children: produto.descricao_curta
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-auto flex items-end justify-between pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col",
						children: [produto.preco_antigo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground line-through",
							children: brl(produto.preco_antigo)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xl font-bold text-brand-red",
							children: brl(produto.preco)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-10 w-10 place-items-center rounded-full bg-brand-red text-white shadow-md transition group-hover:scale-110",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-5 w-5" })
					})]
				})
			]
		})]
	});
}
//#endregion
export { ProductCard as t };
