import { g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "./_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Route } from "./_catSlug-CfTwkL1t.mjs";
import { _ as useProdutosPorEmpresa, f as useEmpresaPublica, s as useCategoriaBySlug } from "./_ssr/admin-store-AVdk2wK5.mjs";
import { C as ArrowLeft } from "./_libs/lucide-react.mjs";
import { t as ProductCard } from "./_ssr/ProductCard-rl6rSAdN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_catSlug-kT8pIyg-.js
var import_jsx_runtime = require_jsx_runtime();
function CategoriaPagina() {
	const { slug, catSlug } = Route.useParams();
	const { data: empresaCompleta } = useEmpresaPublica(slug);
	const categoria = useCategoriaBySlug(empresaCompleta, catSlug);
	const produtos = useProdutosPorEmpresa(empresaCompleta, catSlug);
	if (!empresaCompleta) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/s/$slug",
				params: { slug },
				className: "mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-brown",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Voltar"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold",
				children: categoria ? `${categoria.emoji ?? ""} ${categoria.nome}` : "Categoria"
			}),
			produtos.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-sm text-muted-foreground",
				children: "Nenhum produto nessa categoria ainda."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
				children: produtos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
					produto: p,
					slug
				}, p.id))
			})
		]
	});
}
//#endregion
export { CategoriaPagina as component };
