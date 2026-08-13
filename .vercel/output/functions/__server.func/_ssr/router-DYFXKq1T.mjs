import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { R as redirect, _ as createRootRouteWithContext, b as useRouter, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as getServerFnById, n as __exportAll, r as createServerFn, t as TSS_SERVER_FUNCTION } from "./server-dox-0I6C.mjs";
import "./container-BBaES79Y.mjs";
import "./container-CzhoLjbe.mjs";
import "./container-Bkg_Gy42.mjs";
import "./container-GNCTH5N9.mjs";
import "./container-8xUqQOV3.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-session-mj2pzSt5.js
var useAuthSession = create()(persist((set) => ({
	session: null,
	setSession: (session) => set({ session }),
	clear: () => set({ session: null })
}), { name: "pedidopronto-session" }));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-DYFXKq1T.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-C20OgOvr.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var adminLogin = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("5fb9c17a7f65e824ca15449d35eb2df903d46a6552c2f94421ba35f6ba342305"));
var refreshAdminSession = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("2b7879f4d8c0771131cee89e860337c7b8a73629df83e1f8452652c714f295e6"));
var platformLogin = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("63032f8bd5f9ffd5d9565109280793d4bef00cd07960981d2a61a5e35f207617"));
var changeOwnPassword = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("91ec63f35e1d1ef8a60aa883b532f7e88b6e2c24f7c4c713b3deda4c5967488a"));
var changeClientPassword = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("2e3617712acafe716affcc9522fe3b185e0c2c961a3f276f879e118c9493f182"));
var getEmpresaBySlug = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("6ea2d98a1ecfad98f8484399c1a7d0a510e6b3747dfec77d30830be64f91e56d"));
var getEmpresaById = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("241adb6fcb1448978786d7f8c42c588e18dd642a070f3b1f4feb688031722199"));
var listEmpresasPublicas = createServerFn({ method: "POST" }).validator((d) => d ?? {}).handler(createSsrRpc("92416fb2fa11d21dd9fa1c4f919aa13f2c0045f241cd82d47971dea648a397bb"));
var getEmpresaCompletaAuth = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("2d295819431050779b7804c3ab727a5ede716aa85d5b0679bddbba94566f9d3c"));
var updateEmpresa = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("4f77d60e0497f31580e0d7e49c565e064b7a00263edea423d0036b21e260af08"));
var saveEmpresaConfig = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("b7b30b624f88b5e4470babb7277aef8d4daf64caa6559d3b5c101b90cdb46631"));
var listEmpresasAdmin = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("3687be9505a0fa14d06dee159030afb7297b1ca97f31bbcc0e6f039b4a4003c8"));
var createEmpresa = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("f7b2690e84c389d5b7764ea782c14107331524bf592de17d10cefb8714d3dcf8"));
var updateEmpresaStatus = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("5de3a93d98cf34e035e16d4f2933f7dd6ed81c63a080ad4c06ed60a196a9b292"));
createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("345d1d5db58b0eb64c47bb4379699312caa7efa25dbe238a9f130c48400013f0"));
createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("cc771878d76a004fc06dd11c235d5d6a7309aea75e073f6bd84cfce0753b7d8d"));
var deleteEmpresa = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("3cfbb44be2aff76575a265297dfa40d13cc35ad5bcf824467862168dc6dd8780"));
createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("1f9d2f5d98086325923975f5f2c156d0dc1be2c719485ece61a6ed5e40d4548b"));
var saveProduto = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("d3002c7ac2300d6b3faf55868eed773ce66dc0dbd32033eda7bd716726b1c336"));
var deleteProduto = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("b08d2730b39d7bf3e00a4166a4d6af0642fe2cffd9493b553421b0e4a7951351"));
var saveProdutoIngredientes = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("4ce2766800d651f3076ac10b5ee0583470e42d0b8c0a56bd2eaf3462aa870696"));
var uploadImagem = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("33c6dc0de50ef43e4996d12b6e285f786409978446e8ea7b58361aee074138cf"));
var saveCategoria = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("c817796febe6c6ef85a304e6d3cffda27de3fa7a399f4fe39b47a5490b63e100"));
createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("2bdf6a74e6357cc8ff42efa5c2548a5a84c77bb765e73d92ca4f865dd20758d4"));
var saveCategoriaOpcao = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("3b60bd2b28051440eb5ae7e1121d4861df8859f164d004b96b63d9c670e48bf4"));
var deleteCategoriaOpcao = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("e11acc85f284c21ed9af0a36d20ec40e9d3a53cf459161962f1f35fcccda4f0f"));
var saveOpcao = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("5efaa99e9b3ac3b713e3095fa0cf51fb3e79779eaab71df88668f659cff89c49"));
var deleteOpcao = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("505eaba48c5b6469e48b41baae42bfee4ec28a74828f48f5842b717b6843a3bf"));
var listPlanos = createServerFn({ method: "POST" }).validator((d) => d ?? {}).handler(createSsrRpc("f96a317ecccbff5fe44206eb282123875246525248201e5de2b854602f171c38"));
var getPlanoDaEmpresa = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("b920b277ab64e44a347e2283871330378a8a43017a8445cc0131467bae80a178"));
var createPedido = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("924a5c648d95bd03df0735ce12f5d19a979664db56157e9e9b9ba52b123831c6"));
var listPedidosEmpresa = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("13507aeda2343367cbb4dce494db3add3c471f9d0860e83c08afbaef1e1e238c"));
var updatePedidoStatus = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("b5d80d80521796800eb58e4af63d6f825ecd3e3bf9138505f719576634947db9"));
function getExpiryMs(token) {
	try {
		const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
		return typeof payload.exp === "number" ? payload.exp * 1e3 : null;
	} catch {
		return null;
	}
}
function useAutoRefreshSession() {
	const session = useAuthSession((s) => s.session);
	const setSession = useAuthSession((s) => s.setSession);
	const timerRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		if (!session) return;
		const expMs = getExpiryMs(session.accessToken);
		const msAteRefresh = expMs ? Math.max(5e3, expMs - Date.now() - 12e4) : 3e5;
		timerRef.current = setTimeout(async () => {
			try {
				const res = await refreshAdminSession({ data: { refreshToken: session.refreshToken } });
				if (res.ok) setSession({
					accessToken: res.accessToken,
					refreshToken: res.refreshToken,
					email: res.email || session.email,
					empresaId: res.empresaId ?? session.empresaId,
					role: res.role
				});
			} catch {}
		}, msAteRefresh);
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [session?.accessToken, session?.refreshToken]);
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-7xl",
					children: "🍽️"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 font-display text-3xl font-bold",
					children: "Página não encontrada"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted-foreground",
					children: "Essa página fugiu do cardápio."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mt-6 inline-flex items-center justify-center rounded-full bg-brand-red px-6 py-3 font-semibold text-white",
					children: "Voltar pro início"
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-xl font-semibold",
					children: "Algo deu errado"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Tenta de novo em instantes."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						router.invalidate();
						reset();
					},
					className: "mt-4 rounded-full bg-brand-red px-6 py-3 font-semibold text-white",
					children: "Tentar de novo"
				})
			]
		})
	});
}
var Route$17 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "TRAPEZA — Seu negócio à mesa" },
			{
				name: "description",
				content: "TRAPEZA: plataforma de cardápios digitais multi-tenant. Sua empresa, seu link, seu cardápio."
			},
			{
				property: "og:title",
				content: "TRAPEZA — Seu negócio à mesa"
			},
			{
				property: "og:description",
				content: "Plataforma de cardápios digitais para vários restaurantes. Encontre sua lanchonete favorita."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/logo.png",
				type: "image/png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: ""
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "pt-BR",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$17.useRouteContext();
	useAutoRefreshSession();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			position: "top-center",
			richColors: true
		})]
	});
}
var $$splitComponentImporter$16 = () => import("./routes--6JPu7-M.mjs");
var Route$16 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
var $$splitComponentImporter$15 = () => import("../_empresaSlug-BN8OYfzM.mjs");
var Route$15 = createFileRoute("/painel/$empresaSlug")({
	beforeLoad: ({ params }) => {
		const session = useAuthSession.getState().session;
		if (!session || session.role !== "admin") throw redirect({ to: "/painel/login" });
		return { empresaSlug: params.empresaSlug };
	},
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./login-gQ5wvMxS.mjs");
var Route$14 = createFileRoute("/painel/login")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = () => import("./plataforma-BAx5-DZ5.mjs");
var Route$13 = createFileRoute("/plataforma/")({
	beforeLoad: () => {
		const session = useAuthSession.getState().session;
		if (!session || session.role !== "super_admin") throw redirect({ to: "/plataforma/login" });
	},
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./login-HZgId5DH.mjs");
var Route$12 = createFileRoute("/plataforma/login")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("../_slug-DoWzKsxg.mjs");
var Route$11 = createFileRoute("/s/$slug")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("../_id-C9ECwhwT.mjs");
var Route$10 = createFileRoute("/plataforma/empresas/$id")({
	beforeLoad: () => {
		const session = useAuthSession.getState().session;
		if (!session || session.role !== "super_admin") throw redirect({ to: "/plataforma/login" });
	},
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./nova-bzlvNdmC.mjs");
var Route$9 = createFileRoute("/plataforma/empresas/nova")({
	beforeLoad: () => {
		const session = useAuthSession.getState().session;
		if (!session || session.role !== "super_admin") throw redirect({ to: "/plataforma/login" });
	},
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("../_slug-3OJ6eSjd.mjs");
var Route$8 = createFileRoute("/s/$slug/")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./checkout-DXm-jL8m.mjs");
var Route$7 = createFileRoute("/s/$slug/checkout")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./favorites-DiJgG_aj.mjs");
var Route$6 = createFileRoute("/s/$slug/favorites")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./location-CXRZabS-.mjs");
var Route$5 = createFileRoute("/s/$slug/location")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./orders-DNYnffEp.mjs");
var Route$4 = createFileRoute("/s/$slug/orders")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./promotions-CIsxi02C.mjs");
var Route$3 = createFileRoute("/s/$slug/promotions")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./search-D5Ju1Y77.mjs");
var Route$2 = createFileRoute("/s/$slug/search")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("../_catSlug-DLRbzdqA.mjs");
var Route$1 = createFileRoute("/s/$slug/category/$catSlug")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("../_id-BB4sj6xC.mjs");
var Route = createFileRoute("/s/$slug/product/$id")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$16.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$17
});
var PainelEmpresaSlugRoute = Route$15.update({
	id: "/painel/$empresaSlug",
	path: "/painel/$empresaSlug",
	getParentRoute: () => Route$17
});
var PainelLoginRoute = Route$14.update({
	id: "/painel/login",
	path: "/painel/login",
	getParentRoute: () => Route$17
});
var PlataformaIndexRoute = Route$13.update({
	id: "/plataforma/",
	path: "/plataforma/",
	getParentRoute: () => Route$17
});
var PlataformaLoginRoute = Route$12.update({
	id: "/plataforma/login",
	path: "/plataforma/login",
	getParentRoute: () => Route$17
});
var SSlugRoute = Route$11.update({
	id: "/s/$slug",
	path: "/s/$slug",
	getParentRoute: () => Route$17
});
var PlataformaEmpresasIdRoute = Route$10.update({
	id: "/plataforma/empresas/$id",
	path: "/plataforma/empresas/$id",
	getParentRoute: () => Route$17
});
var PlataformaEmpresasNovaRoute = Route$9.update({
	id: "/plataforma/empresas/nova",
	path: "/plataforma/empresas/nova",
	getParentRoute: () => Route$17
});
var SSlugIndexRoute = Route$8.update({
	id: "/",
	path: "/",
	getParentRoute: () => SSlugRoute
});
var SSlugRouteChildren = {
	SSlugCheckoutRoute: Route$7.update({
		id: "/checkout",
		path: "/checkout",
		getParentRoute: () => SSlugRoute
	}),
	SSlugFavoritesRoute: Route$6.update({
		id: "/favorites",
		path: "/favorites",
		getParentRoute: () => SSlugRoute
	}),
	SSlugLocationRoute: Route$5.update({
		id: "/location",
		path: "/location",
		getParentRoute: () => SSlugRoute
	}),
	SSlugOrdersRoute: Route$4.update({
		id: "/orders",
		path: "/orders",
		getParentRoute: () => SSlugRoute
	}),
	SSlugPromotionsRoute: Route$3.update({
		id: "/promotions",
		path: "/promotions",
		getParentRoute: () => SSlugRoute
	}),
	SSlugSearchRoute: Route$2.update({
		id: "/search",
		path: "/search",
		getParentRoute: () => SSlugRoute
	}),
	SSlugIndexRoute,
	SSlugCategoryCatSlugRoute: Route$1.update({
		id: "/category/$catSlug",
		path: "/category/$catSlug",
		getParentRoute: () => SSlugRoute
	}),
	SSlugProductIdRoute: Route.update({
		id: "/product/$id",
		path: "/product/$id",
		getParentRoute: () => SSlugRoute
	})
};
var rootRouteChildren = {
	IndexRoute,
	PainelEmpresaSlugRoute,
	PainelLoginRoute,
	PlataformaLoginRoute,
	SSlugRoute: SSlugRoute._addFileChildren(SSlugRouteChildren),
	PlataformaIndexRoute,
	PlataformaEmpresasIdRoute,
	PlataformaEmpresasNovaRoute
};
var routeTree = Route$17._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getEmpresaById as A, changeOwnPassword as B, saveOpcao as C, saveProdutoIngredientes as D, saveProduto as E, saveEmpresaConfig as F, useAuthSession as H, updateEmpresa as I, updateEmpresaStatus as L, getEmpresaCompletaAuth as M, listEmpresasAdmin as N, createEmpresa as O, listEmpresasPublicas as P, adminLogin as R, saveCategoriaOpcao as S, deleteProduto as T, platformLogin as V, getPlanoDaEmpresa as _, Route$3 as a, deleteOpcao as b, Route$6 as c, Route$10 as d, Route$11 as f, updatePedidoStatus as g, listPedidosEmpresa as h, Route$2 as i, getEmpresaBySlug as j, deleteEmpresa as k, Route$7 as l, createPedido as m, Route as n, Route$4 as o, Route$15 as p, Route$1 as r, Route$5 as s, router_exports as t, Route$8 as u, listPlanos as v, uploadImagem as w, saveCategoria as x, deleteCategoriaOpcao as y, changeClientPassword as z };
