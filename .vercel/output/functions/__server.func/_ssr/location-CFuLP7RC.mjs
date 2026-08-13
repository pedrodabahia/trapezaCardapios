import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { f as useEmpresaPublica, o as getHorarios } from "./admin-store-AVdk2wK5.mjs";
import { m as MapPin, y as Clock } from "../_libs/lucide-react.mjs";
import { t as Route } from "./location-BSyDkrmy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/location-CFuLP7RC.js
var import_jsx_runtime = require_jsx_runtime();
function LocalizacaoPagina() {
	const { slug } = Route.useParams();
	const { data: empresaCompleta } = useEmpresaPublica(slug);
	if (!empresaCompleta) return null;
	const { empresa, config } = empresaCompleta;
	const horarios = getHorarios(config);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold",
				children: "Localização e horários"
			}),
			empresa.endereco && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 overflow-hidden rounded-3xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
					title: "Mapa",
					src: `https://www.google.com/maps?q=${encodeURIComponent(empresa.endereco)}&output=embed`,
					className: "h-64 w-full border-0",
					loading: "lazy",
					referrerPolicy: "no-referrer-when-downgrade"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex items-start gap-3 rounded-2xl bg-card p-4 card-shadow",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mt-0.5 h-5 w-5 shrink-0 text-brand-red" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: "Endereço"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: empresa.endereco || "Endereço não informado"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-start gap-3 rounded-2xl bg-card p-4 card-shadow",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "mt-0.5 h-5 w-5 shrink-0 text-brand-red" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: "Horário de funcionamento"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-1 text-sm text-muted-foreground",
						children: horarios.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: h.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: h.closed ? "Fechado" : `${h.open} – ${h.close}` })]
						}, h.day))
					})]
				})]
			})
		]
	});
}
//#endregion
export { LocalizacaoPagina as component };
