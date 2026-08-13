import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { o as Route$4 } from "./router-DYFXKq1T.mjs";
import { f as useEmpresaPublica } from "./admin-store-CsIVidas.mjs";
import { t as brl } from "./format-GUzbl2Vi.mjs";
import { i as itemUnitPrice, r as getCartStore } from "./store-CCH2-yNj.mjs";
import { l as ShoppingBag } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-DNYnffEp.js
var import_jsx_runtime = require_jsx_runtime();
function PedidosPagina() {
	const { slug } = Route$4.useParams();
	const { data: empresaCompleta } = useEmpresaPublica(slug);
	const { orders } = getCartStore(slug)();
	if (!empresaCompleta) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "flex items-center gap-2 font-display text-2xl font-bold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-6 w-6 text-brand-red" }), " Meus pedidos"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: "Histórico salvo só neste navegador/aparelho."
			}),
			orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-sm text-muted-foreground",
				children: "Você ainda não fez nenhum pedido por aqui."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-3",
				children: orders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-card p-4 card-shadow",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-display font-bold",
								children: ["#", o.id]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: new Date(o.createdAt).toLocaleString("pt-BR")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs font-semibold text-brand-red",
							children: o.status
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 space-y-0.5 text-sm text-muted-foreground",
							children: o.items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								it.quantity,
								"x ",
								it.name,
								" — ",
								brl(itemUnitPrice(it) * it.quantity)
							] }, it.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex justify-between border-t pt-2 font-display font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-brand-red",
								children: brl(o.total)
							})]
						})
					]
				}, o.id))
			})
		]
	});
}
//#endregion
export { PedidosPagina as component };
