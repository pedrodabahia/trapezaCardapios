import { a as __toESM } from "../__23tanstack-start-server-fn-resolver-RQ4HTkDC.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { _ as useProdutosPorEmpresa, f as useEmpresaPublica } from "./admin-store-AVdk2wK5.mjs";
import { u as Search } from "../_libs/lucide-react.mjs";
import { t as ProductCard } from "./ProductCard-rl6rSAdN.mjs";
import { t as Route } from "./search-mpg0LN98.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-Ci0w24FP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BuscaPagina() {
	const { slug } = Route.useParams();
	const { data: empresaCompleta } = useEmpresaPublica(slug);
	const produtos = useProdutosPorEmpresa(empresaCompleta);
	const [termo, setTermo] = (0, import_react.useState)("");
	const resultado = (0, import_react.useMemo)(() => {
		const t = termo.trim().toLowerCase();
		if (!t) return produtos;
		return produtos.filter((p) => p.nome.toLowerCase().includes(t) || (p.descricao_curta ?? "").toLowerCase().includes(t) || (p.descricao ?? "").toLowerCase().includes(t) || p.ingredientes.some((i) => i.toLowerCase().includes(t)));
	}, [produtos, termo]);
	if (!empresaCompleta) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-12 items-center gap-3 rounded-full border border-brand-yellow/40 bg-white px-5 card-shadow",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-5 w-5 text-brand-red" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				autoFocus: true,
				value: termo,
				onChange: (e) => setTermo(e.target.value),
				placeholder: "Buscar por nome, ingrediente ou categoria...",
				className: "w-full bg-transparent text-sm outline-none"
			})]
		}), resultado.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-8 text-sm text-muted-foreground",
			children: [
				"Nada encontrado",
				termo ? ` para "${termo}"` : "",
				"."
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
			children: resultado.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
				produto: p,
				slug
			}, p.id))
		})]
	});
}
//#endregion
export { BuscaPagina as component };
