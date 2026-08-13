import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { m as listEmpresasAdmin } from "./admin-server-CnyVybEG.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as useAuthSession } from "./auth-session-mj2pzSt5.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BXjpJ96D.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plataforma-CNWO7jZi.js
var import_jsx_runtime = require_jsx_runtime();
function PlatformDashboard() {
	const navigate = useNavigate();
	const session = useAuthSession((s) => s.session);
	const clear = useAuthSession((s) => s.clear);
	const { data: empresas = [], isLoading } = useQuery({
		queryKey: ["plataforma-empresas"],
		queryFn: () => listEmpresasAdmin({ data: { token: session.accessToken } }),
		enabled: !!session
	});
	if (!session) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-border bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-xl font-bold",
					children: "TRAPEZA · plataforma"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: session.email
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							children: "Ver site"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => {
							clear();
							navigate({ to: "/plataforma/login" });
						},
						children: "Sair"
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-6xl px-6 py-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-bold",
					children: "Empresas cadastradas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						empresas.length,
						" ",
						empresas.length === 1 ? "empresa" : "empresas",
						" no sistema"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/plataforma/empresas/nova",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "+ Nova empresa" })
				})]
			}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Carregando..."
			}) : empresas.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "py-12 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Nenhuma empresa cadastrada ainda. Comece criando a primeira."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/plataforma/empresas/nova",
					className: "mt-4 inline-block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "+ Cadastrar primeira empresa" })
				})]
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
				children: empresas.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/plataforma/empresas/$id",
					params: { id: e.id },
					className: "block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "transition hover:shadow-lg hover:-translate-y-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "font-display text-lg",
								children: e.nome
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: e.status_pagamento === "ativo" ? "default" : e.status_pagamento === "atrasado" ? "secondary" : "destructive",
								children: e.status_pagamento
							})]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Slug:"
									}),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
										className: "rounded bg-muted px-1.5 py-0.5 text-xs",
										children: ["/s/", e.slug]
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Plano:"
									}),
									" ",
									e.plano_id
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "WhatsApp:"
									}),
									" ",
									e.whatsapp
								] })
							]
						})]
					})
				}, e.id))
			})]
		})]
	});
}
//#endregion
export { PlatformDashboard as component };
