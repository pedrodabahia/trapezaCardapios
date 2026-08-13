import { j as redirect, m as createFileRoute, p as lazyRouteComponent } from "./_libs/@tanstack/react-router+[...].mjs";
import { t as useAuthSession } from "./_ssr/auth-session-mj2pzSt5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-D51oK573.js
var $$splitComponentImporter = () => import("./_id-BTWqT_53.mjs");
var Route = createFileRoute("/plataforma/empresas/$id")({
	beforeLoad: () => {
		const session = useAuthSession.getState().session;
		if (!session || session.role !== "super_admin") throw redirect({ to: "/plataforma/login" });
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
