import { j as redirect, m as createFileRoute, p as lazyRouteComponent } from "./_libs/@tanstack/react-router+[...].mjs";
import { t as useAuthSession } from "./_ssr/auth-session-mj2pzSt5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_empresaSlug-CL5LLwyC.js
var $$splitComponentImporter = () => import("./_empresaSlug-BXE5aNN2.mjs");
var Route = createFileRoute("/painel/$empresaSlug")({
	beforeLoad: ({ params }) => {
		const session = useAuthSession.getState().session;
		if (!session || session.role !== "admin") throw redirect({ to: "/painel/login" });
		return { empresaSlug: params.empresaSlug };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
