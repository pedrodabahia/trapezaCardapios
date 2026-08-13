import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { _ as useProdutosPorEmpresa, f as useEmpresaPublica } from "./admin-store-AVdk2wK5.mjs";
import { t as ProductCard } from "./ProductCard-rl6rSAdN.mjs";
import { t as Route } from "./promotions-Cgbd-W_1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/promotions-DmLfJ6Q9.js
var import_jsx_runtime = require_jsx_runtime();
function PromocoesPagina() {
	const { slug } = Route.useParams();
	const { data: empresaCompleta } = useEmpresaPublica(slug);
	const promos = useProdutosPorEmpresa(empresaCompleta).filter((p) => p.tag === "promocao");
	if (!empresaCompleta) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-bold",
			children: "🔥 Promoções"
		}), promos.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-8 text-sm text-muted-foreground",
			children: "Nenhuma promoção ativa no momento."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
			children: promos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
				produto: p,
				slug
			}, p.id))
		})]
	});
}
//#endregion
export { PromocoesPagina as component };
