import { a as __toESM } from "../__23tanstack-start-server-fn-resolver-RQ4HTkDC.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, j as redirect, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Route$6 } from "../_catSlug-CfTwkL1t.mjs";
import { y as refreshAdminSession } from "./admin-server-CnyVybEG.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as useAuthSession } from "./auth-session-mj2pzSt5.mjs";
import { t as Route$7 } from "../_empresaSlug-CL5LLwyC.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as Route$8 } from "../_id-D51oK573.mjs";
import { t as Route$9 } from "../_id-B6zXrOP_.mjs";
import { t as Route$10 } from "../_slug-D17qUFsT.mjs";
import { t as Route$11 } from "../_slug-BdsJDxPi.mjs";
import { t as Route$12 } from "./checkout-C9Y8AYIn.mjs";
import { t as Route$13 } from "./favorites-76BSpIts.mjs";
import { t as Route$14 } from "./location-BSyDkrmy.mjs";
import { t as Route$15 } from "./orders-DuZj-27D.mjs";
import { t as Route$16 } from "./promotions-Cgbd-W_1.mjs";
import { t as Route$17 } from "./search-mpg0LN98.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-ChilGn2h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-W_1Go4-i.css";
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
		const msAteRefresh = expMs ? Math.max(5e3, expMs - Date.now() - 2 * 6e4) : 5 * 6e4;
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
var Route$5 = createRootRouteWithContext()({
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
	const { queryClient } = Route$5.useRouteContext();
	useAutoRefreshSession();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			position: "top-center",
			richColors: true
		})]
	});
}
var $$splitComponentImporter$4 = () => import("./routes-BIcvDGwY.mjs");
var Route$4 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./plataforma-CNWO7jZi.mjs");
var Route$3 = createFileRoute("/plataforma/")({
	beforeLoad: () => {
		const session = useAuthSession.getState().session;
		if (!session || session.role !== "super_admin") throw redirect({ to: "/plataforma/login" });
	},
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./login-AQqfDL8l.mjs");
var Route$2 = createFileRoute("/plataforma/login")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./login-Cy8qwRMf.mjs");
var Route$1 = createFileRoute("/painel/login")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./nova-DxHtxIbN.mjs");
var Route = createFileRoute("/plataforma/empresas/nova")({
	beforeLoad: () => {
		const session = useAuthSession.getState().session;
		if (!session || session.role !== "super_admin") throw redirect({ to: "/plataforma/login" });
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$4.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$5
});
var PlataformaIndexRoute = Route$3.update({
	id: "/plataforma/",
	path: "/plataforma/",
	getParentRoute: () => Route$5
});
var SSlugRoute = Route$11.update({
	id: "/s/$slug",
	path: "/s/$slug",
	getParentRoute: () => Route$5
});
var PlataformaLoginRoute = Route$2.update({
	id: "/plataforma/login",
	path: "/plataforma/login",
	getParentRoute: () => Route$5
});
var PainelLoginRoute = Route$1.update({
	id: "/painel/login",
	path: "/painel/login",
	getParentRoute: () => Route$5
});
var PainelEmpresaSlugRoute = Route$7.update({
	id: "/painel/$empresaSlug",
	path: "/painel/$empresaSlug",
	getParentRoute: () => Route$5
});
var SSlugIndexRoute = Route$10.update({
	id: "/",
	path: "/",
	getParentRoute: () => SSlugRoute
});
var SSlugSearchRoute = Route$17.update({
	id: "/search",
	path: "/search",
	getParentRoute: () => SSlugRoute
});
var SSlugPromotionsRoute = Route$16.update({
	id: "/promotions",
	path: "/promotions",
	getParentRoute: () => SSlugRoute
});
var SSlugOrdersRoute = Route$15.update({
	id: "/orders",
	path: "/orders",
	getParentRoute: () => SSlugRoute
});
var SSlugLocationRoute = Route$14.update({
	id: "/location",
	path: "/location",
	getParentRoute: () => SSlugRoute
});
var SSlugFavoritesRoute = Route$13.update({
	id: "/favorites",
	path: "/favorites",
	getParentRoute: () => SSlugRoute
});
var SSlugCheckoutRoute = Route$12.update({
	id: "/checkout",
	path: "/checkout",
	getParentRoute: () => SSlugRoute
});
var PlataformaEmpresasNovaRoute = Route.update({
	id: "/plataforma/empresas/nova",
	path: "/plataforma/empresas/nova",
	getParentRoute: () => Route$5
});
var PlataformaEmpresasIdRoute = Route$8.update({
	id: "/plataforma/empresas/$id",
	path: "/plataforma/empresas/$id",
	getParentRoute: () => Route$5
});
var SSlugProductIdRoute = Route$9.update({
	id: "/product/$id",
	path: "/product/$id",
	getParentRoute: () => SSlugRoute
});
var SSlugRouteChildren = {
	SSlugCheckoutRoute,
	SSlugFavoritesRoute,
	SSlugLocationRoute,
	SSlugOrdersRoute,
	SSlugPromotionsRoute,
	SSlugSearchRoute,
	SSlugIndexRoute,
	SSlugCategoryCatSlugRoute: Route$6.update({
		id: "/category/$catSlug",
		path: "/category/$catSlug",
		getParentRoute: () => SSlugRoute
	}),
	SSlugProductIdRoute
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
var routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
