import { a as __toESM } from "./__23tanstack-start-server-fn-resolver-RQ4HTkDC.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate, g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "./_libs/@radix-ui/react-arrow+[...].mjs";
import { D as updateEmpresaStatus, m as listEmpresasAdmin, n as changeClientPassword, s as deleteEmpresa } from "./_ssr/admin-server-CnyVybEG.mjs";
import { t as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as useAuthSession } from "./_ssr/auth-session-mj2pzSt5.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./_ssr/card-BXjpJ96D.mjs";
import { t as Button } from "./_ssr/button-Bq5vK6RO.mjs";
import { t as Input } from "./_ssr/input-B8Q2ztVi.mjs";
import { t as Label } from "./_ssr/label-DBD1bRRP.mjs";
import { t as Badge } from "./_ssr/badge-D1Dupn2y.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { t as Route } from "./_id-D51oK573.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-BTWqT_53.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function EmpresaDetail() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const session = useAuthSession((s) => s.session);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const { data: empresas = [], refetch } = useQuery({
		queryKey: ["plataforma-empresas"],
		queryFn: () => listEmpresasAdmin({ data: { token: session.accessToken } }),
		enabled: !!session
	});
	const empresa = empresas.find((e) => e.id === id);
	if (!session) return null;
	if (!empresa) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl p-8 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Empresa não encontrada." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/plataforma",
			className: "mt-4 inline-block underline",
			children: "Voltar"
		})]
	});
	async function setStatus(status) {
		setBusy(true);
		try {
			await updateEmpresaStatus({ data: {
				token: session.accessToken,
				empresaId: empresa.id,
				status
			} });
			toast.success(`Status atualizado para ${status}.`);
			refetch();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Erro");
		} finally {
			setBusy(false);
		}
	}
	async function onDelete() {
		if (!confirm(`Excluir empresa ${empresa.nome}? Esta ação é irreversível.`)) return;
		setBusy(true);
		try {
			await deleteEmpresa({ data: {
				token: session.accessToken,
				empresaId: empresa.id
			} });
			toast.success("Empresa excluída.");
			navigate({ to: "/plataforma" });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Erro");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-border bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-4xl items-center justify-between px-6 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-xl font-bold",
						children: empresa.nome
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: empresa.status_pagamento === "ativo" ? "default" : empresa.status_pagamento === "atrasado" ? "secondary" : "destructive",
						children: empresa.status_pagamento
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/plataforma",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						children: "← Voltar"
					})
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-4xl space-y-6 px-6 py-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Dados" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Slug: "
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
							className: "rounded bg-muted px-1.5 py-0.5",
							children: ["/s/", empresa.slug]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Plano: "
						}), empresa.plano_id] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "WhatsApp: "
						}), empresa.whatsapp] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Endereço: "
						}), empresa.endereco ?? "—"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Criada em: "
						}), new Date(empresa.criado_em).toLocaleString("pt-BR")] })
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Status de pagamento" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: empresa.status_pagamento === "ativo" ? "default" : "outline",
							onClick: () => setStatus("ativo"),
							disabled: busy,
							children: "Ativo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: empresa.status_pagamento === "atrasado" ? "default" : "outline",
							onClick: () => setStatus("atrasado"),
							disabled: busy,
							children: "Atrasado"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: empresa.status_pagamento === "suspenso" ? "default" : "outline",
							onClick: () => setStatus("suspenso"),
							disabled: busy,
							children: "Suspenso"
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Acesso rápido" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: `/s/${empresa.slug}`,
						target: "_blank",
						rel: "noreferrer",
						className: "rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white",
						children: "Ver cardápio público"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/painel/login",
						className: "rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold",
						children: "Página de login do admin"
					})]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrocarSenhaCard, {
					token: session.accessToken,
					empresaId: empresa.id
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-destructive",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-destructive",
						children: "Zona de perigo"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-4 text-sm text-muted-foreground",
						children: "Excluir a empresa remove cardápio, categorias, configurações e pedidos associados. Esta ação é irreversível."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "destructive",
						onClick: onDelete,
						disabled: busy,
						children: "Excluir empresa"
					})] })]
				})
			]
		})]
	});
}
function TrocarSenhaCard({ token, empresaId }) {
	const [novaSenha, setNovaSenha] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSave() {
		if (novaSenha.length < 6) {
			toast.error("A senha precisa ter pelo menos 6 caracteres");
			return;
		}
		setBusy(true);
		try {
			await changeClientPassword({ data: {
				token,
				empresaId,
				novaSenha
			} });
			toast.success("Senha do cliente atualizada");
			setNovaSenha("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Erro ao trocar senha");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Trocar senha do cliente" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "max-w-sm space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Define uma senha nova pro admin dessa empresa entrar no painel dele. Avise o cliente pelo WhatsApp depois de trocar."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nova senha" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "text",
				value: novaSenha,
				onChange: (e) => setNovaSenha(e.target.value),
				placeholder: "Mínimo 6 caracteres"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: onSave,
				disabled: busy,
				children: busy ? "Salvando..." : "Salvar senha"
			})
		]
	})] });
}
//#endregion
export { EmpresaDetail as component };
