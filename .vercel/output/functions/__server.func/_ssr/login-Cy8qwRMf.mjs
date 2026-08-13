import { a as __toESM } from "../__23tanstack-start-server-fn-resolver-RQ4HTkDC.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as adminLogin, u as getEmpresaById } from "./admin-server-CnyVybEG.mjs";
import { C as ArrowLeft } from "../_libs/lucide-react.mjs";
import { t as useAuthSession } from "./auth-session-mj2pzSt5.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-Cy8qwRMf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PainelLogin() {
	const navigate = useNavigate();
	const setSession = useAuthSession((s) => s.setSession);
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		setLoading(true);
		try {
			const res = await adminLogin({ data: {
				email,
				password
			} });
			if (!res.ok) {
				toast.error(res.error);
				return;
			}
			const empresa = res.empresaId ? await getEmpresaById({ data: {
				token: res.accessToken,
				empresaId: res.empresaId
			} }) : null;
			setSession({
				accessToken: res.accessToken,
				refreshToken: res.refreshToken,
				email: res.email,
				empresaId: res.empresaId,
				role: res.role
			});
			if (empresa) navigate({ to: `/painel/${empresa.slug}` });
			else {
				toast.success("Login efetuado.");
				navigate({ to: "/" });
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Erro inesperado");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit,
			className: "w-full max-w-md rounded-3xl bg-card p-8 card-shadow",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl font-bold",
						children: "Painel admin"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Entre com o email e senha cadastrados pela plataforma."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "email",
							children: "Email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "email",
							type: "email",
							autoComplete: "email",
							required: true,
							value: email,
							onChange: (e) => setEmail(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "password",
							children: "Senha"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "password",
							type: "password",
							autoComplete: "current-password",
							required: true,
							value: password,
							onChange: (e) => setPassword(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: loading,
							className: "w-full",
							children: loading ? "Entrando..." : "Entrar"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-center text-xs text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "inline-flex items-center gap-1 underline underline-offset-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3 w-3" }), " voltar para o site"]
					})
				})
			]
		})
	});
}
//#endregion
export { PainelLogin as component };
