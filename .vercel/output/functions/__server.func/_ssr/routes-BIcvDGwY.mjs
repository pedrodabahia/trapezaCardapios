import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { h as listEmpresasPublicas } from "./admin-server-CnyVybEG.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as CardContent, t as Card } from "./card-BXjpJ96D.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BIcvDGwY.js
var import_jsx_runtime = require_jsx_runtime();
function Landing() {
	const { data: empresas = [], isLoading } = useQuery({
		queryKey: ["empresas-publicas"],
		queryFn: () => listEmpresasPublicas({ data: {} }),
		staleTime: 3e4
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "hero-gradient text-white",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-6xl px-6 py-20 md:py-28",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-4  font-display text-2xl font-manrope leading-tight  md:text-2xl",
							children: "TRAPEZA"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-2xl text-sm font-semibold uppercase tracking-wide text-white/80",
							children: "Seu negócio à mesa"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-2 font-display text-4xl font-manrope leading-tight md:text-6xl",
							children: [
								"Cardápios digitais",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"para sua cidade"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 max-w-2xl text-base text-white/85 md:text-lg",
							children: "Plataforma multi-tenant: cada empresa com seu link, suas cores, seu cardápio. O cliente final monta o pedido e manda pelo WhatsApp em segundos."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex flex-wrap gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/painel/login",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "lg",
									className: "rounded-full bg-brand-yellow text-brand-brown hover:bg-brand-yellow/90",
									children: "Sou dono de empresa →"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#empresas",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "lg",
									variant: "outline",
									className: "rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20",
									children: "Ver cardápios"
								})
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "empresas",
				className: "mx-auto max-w-6xl px-6 py-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-8 flex items-end justify-between",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl font-bold",
						children: "Empresas na TRAPEZA"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: empresas.length === 0 ? "Nenhuma empresa ativa ainda. Cadastre a primeira pelo painel." : `${empresas.length} ${empresas.length === 1 ? "empresa ativa" : "empresas ativas"}`
					})] })
				}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Carregando..."
				}) : empresas.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "py-12 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground",
						children: "Em breve os primeiros cardápios aqui."
					})
				}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
					children: empresas.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/s/$slug",
						params: { slug: e.slug },
						className: "group",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "overflow-hidden transition hover:-translate-y-1 hover:shadow-lg",
							children: [e.logo_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "aspect-[4/3] overflow-hidden bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: e.logo_url,
									alt: e.nome,
									className: "h-full w-full object-cover transition group-hover:scale-105"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "space-y-2 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display text-lg font-semibold",
										children: e.nome
									}),
									e.endereco && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "line-clamp-2 text-sm text-muted-foreground",
										children: e.endereco
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center gap-2 pt-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-brand-red px-3 py-1 text-xs font-bold text-white",
											children: "Ver cardápio →"
										})
									})
								]
							})]
						})
					}, e.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-border bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						className: "text-foreground",
						children: "TRAPEZA"
					}), " · seu negócio à mesa — cardápios digitais multi-tenant"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/painel/login",
							className: "hover:underline",
							children: "Painel admin"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/plataforma/login",
							className: "hover:underline",
							children: "Plataforma"
						})]
					})]
				})
			})
		]
	});
}
//#endregion
export { Landing as component };
