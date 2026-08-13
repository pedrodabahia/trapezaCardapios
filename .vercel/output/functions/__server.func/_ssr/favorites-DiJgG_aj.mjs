import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as Route$6 } from "./router-DYFXKq1T.mjs";
import { _ as useProdutosPorEmpresa, f as useEmpresaPublica } from "./admin-store-CsIVidas.mjs";
import { r as getCartStore } from "./store-CCH2-yNj.mjs";
import { _ as Heart } from "../_libs/lucide-react.mjs";
import { t as ProductCard } from "./ProductCard-rl6rSAdN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/favorites-DiJgG_aj.js
var import_jsx_runtime = require_jsx_runtime();
function FavoritosPagina() {
	const { slug } = Route$6.useParams();
	const { data: empresaCompleta } = useEmpresaPublica(slug);
	const produtos = useProdutosPorEmpresa(empresaCompleta);
	const { favorites } = getCartStore(slug)();
	const favoritos = produtos.filter((p) => favorites.includes(p.id));
	if (!empresaCompleta) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
			className: "flex items-center gap-2 font-display text-2xl font-bold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-6 w-6 text-brand-red" }), " Favoritos"]
		}), favoritos.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-8 text-sm text-muted-foreground",
			children: "Você ainda não favoritou nenhum produto. Toque no coraçãozinho de um produto pra guardar aqui."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
			children: favoritos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
				produto: p,
				slug
			}, p.id))
		})]
	});
}
//#endregion
export { FavoritosPagina as component };
