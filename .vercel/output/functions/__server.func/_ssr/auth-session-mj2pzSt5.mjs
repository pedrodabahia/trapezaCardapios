import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-session-mj2pzSt5.js
var useAuthSession = create()(persist((set) => ({
	session: null,
	setSession: (session) => set({ session }),
	clear: () => set({ session: null })
}), { name: "pedidopronto-session" }));
//#endregion
export { useAuthSession as t };
