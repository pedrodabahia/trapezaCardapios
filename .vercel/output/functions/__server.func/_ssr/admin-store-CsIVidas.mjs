import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { M as getEmpresaCompletaAuth, j as getEmpresaBySlug } from "./router-DYFXKq1T.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-store-CsIVidas.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var DEFAULT_FRETE = {
	taxa: 6.9,
	gratis_acima_de: 80,
	gratis_habilitado: true
};
var DEFAULT_CORES = {
	primary: "#4A6741",
	accent: "#8FA876",
	bg: "#FFFFFF",
	fg: "#2E3B27"
};
function useEmpresaPublica(slug) {
	return useQuery({
		queryKey: ["empresa-publica", slug],
		queryFn: async () => {
			if (!slug) return null;
			return getEmpresaBySlug({ data: { slug } });
		},
		enabled: !!slug,
		staleTime: 3e4
	});
}
function useEmpresaAdmin(token, empresaId) {
	return useQuery({
		queryKey: ["empresa-admin", empresaId],
		queryFn: async () => {
			if (!token || !empresaId) return null;
			return getEmpresaCompletaAuth({ data: {
				token,
				empresaId
			} });
		},
		enabled: !!token && !!empresaId,
		staleTime: 1e4
	});
}
function useProdutosPorEmpresa(empresaCompleta, categoriaSlug) {
	return (0, import_react.useMemo)(() => {
		if (!empresaCompleta) return [];
		const list = empresaCompleta.produtos.filter((p) => p.ativo);
		if (!categoriaSlug) return list;
		if (categoriaSlug === "promocoes") return list.filter((p) => p.tag === "promocao" || empresaCompleta.categorias.find((c) => c.slug === "promocoes")?.id === p.categoria_id);
		const cat = empresaCompleta.categorias.find((c) => c.slug === categoriaSlug);
		return list.filter((p) => p.categoria_id === cat?.id);
	}, [empresaCompleta, categoriaSlug]);
}
function useDestaques(empresaCompleta) {
	return (0, import_react.useMemo)(() => {
		if (!empresaCompleta) return [];
		return empresaCompleta.produtos.filter((p) => p.ativo && p.tag);
	}, [empresaCompleta]);
}
function useCategoriasAtivas(empresaCompleta) {
	return (0, import_react.useMemo)(() => {
		if (!empresaCompleta) return [];
		return empresaCompleta.categorias.filter((c) => c.ativo);
	}, [empresaCompleta]);
}
function useProdutoById(empresaCompleta, id) {
	return (0, import_react.useMemo)(() => {
		if (!empresaCompleta || !id) return null;
		return empresaCompleta.produtos.find((p) => p.id === id) ?? null;
	}, [empresaCompleta, id]);
}
function useCategoriaBySlug(empresaCompleta, slug) {
	return (0, import_react.useMemo)(() => {
		if (!empresaCompleta || !slug) return null;
		return empresaCompleta.categorias.find((c) => c.slug === slug) ?? null;
	}, [empresaCompleta, slug]);
}
function useOpcoes(empresaCompleta, categoriaOpcaoId) {
	return (0, import_react.useMemo)(() => {
		if (!empresaCompleta) return [];
		const list = empresaCompleta.opcoes;
		return categoriaOpcaoId ? list.filter((o) => o.categoria_opcao_id === categoriaOpcaoId) : list;
	}, [empresaCompleta, categoriaOpcaoId]);
}
function useCategoriasOpcao(empresaCompleta) {
	return (0, import_react.useMemo)(() => {
		if (!empresaCompleta) return [];
		return empresaCompleta.categoriasOpcao;
	}, [empresaCompleta]);
}
function useIngredientesDoProduto(empresaCompleta, produtoId) {
	return (0, import_react.useMemo)(() => {
		if (!empresaCompleta || !produtoId) return [];
		return empresaCompleta.produtoIngredientes[produtoId] ?? [];
	}, [empresaCompleta, produtoId]);
}
function getCores(cfg) {
	const cores = cfg?.cores ?? {};
	return {
		primary: cores.primary ?? DEFAULT_CORES.primary,
		accent: cores.accent ?? DEFAULT_CORES.accent,
		bg: cores.bg ?? DEFAULT_CORES.bg,
		fg: cores.fg ?? DEFAULT_CORES.fg
	};
}
function getCupons(cfg) {
	return cfg?.cupons ?? [];
}
function getFrete(cfg) {
	const f = cfg?.frete ?? {};
	return {
		taxa: f.taxa ?? DEFAULT_FRETE.taxa,
		gratis_acima_de: f.gratis_acima_de ?? DEFAULT_FRETE.gratis_acima_de,
		gratis_habilitado: f.gratis_habilitado ?? DEFAULT_FRETE.gratis_habilitado
	};
}
function getBairros(cfg) {
	return cfg?.bairros ?? [];
}
function getHorarios(cfg) {
	const map = cfg?.horarios ?? {};
	const labels = [
		"domingo",
		"segunda",
		"terca",
		"quarta",
		"quinta",
		"sexta",
		"sabado"
	];
	const labelsDisplay = [
		"Domingo",
		"Segunda",
		"Terça",
		"Quarta",
		"Quinta",
		"Sexta",
		"Sábado"
	];
	return labels.map((k, i) => {
		const h = map[k];
		return {
			day: i,
			label: labelsDisplay[i],
			open: h?.abre ?? "18:00",
			close: h?.fecha ?? "23:00",
			closed: h?.fechado ?? false
		};
	});
}
function getCidadeEntrega(cfg) {
	return cfg?.cidade_entrega ?? "";
}
function toMinutes(t) {
	const [h, m] = t.split(":").map(Number);
	return (h ?? 0) * 60 + (m ?? 0);
}
function isStoreOpenNow(hours, now = /* @__PURE__ */ new Date()) {
	const nowMinutes = now.getHours() * 60 + now.getMinutes();
	const day = now.getDay();
	const prevDay = (day + 6) % 7;
	const today = hours.find((h) => h.day === day);
	if (today && !today.closed) {
		const open = toMinutes(today.open);
		const close = toMinutes(today.close);
		if (close > open && nowMinutes >= open && nowMinutes < close) return true;
		if (close <= open && nowMinutes >= open) return true;
	}
	const yesterday = hours.find((h) => h.day === prevDay);
	if (yesterday && !yesterday.closed) {
		const open = toMinutes(yesterday.open);
		const close = toMinutes(yesterday.close);
		if (close <= open && nowMinutes < close) return true;
	}
	return false;
}
function useStoreOpenStatus(cfg) {
	const hours = (0, import_react.useMemo)(() => getHorarios(cfg), [cfg]);
	const [, forceUpdate] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const id = setInterval(() => forceUpdate((n) => n + 1), 3e4);
		return () => clearInterval(id);
	}, []);
	return isStoreOpenNow(hours);
}
function useInvalidateEmpresa() {
	const qc = useQueryClient();
	return (opts = {}) => {
		if (opts.slug) qc.invalidateQueries({ queryKey: ["empresa-publica", opts.slug] });
		if (opts.empresaId) qc.invalidateQueries({ queryKey: ["empresa-admin", opts.empresaId] });
	};
}
//#endregion
export { useProdutosPorEmpresa as _, getFrete as a, useCategoriasAtivas as c, useEmpresaAdmin as d, useEmpresaPublica as f, useProdutoById as g, useOpcoes as h, getCupons as i, useCategoriasOpcao as l, useInvalidateEmpresa as m, getCidadeEntrega as n, getHorarios as o, useIngredientesDoProduto as p, getCores as r, useCategoriaBySlug as s, getBairros as t, useDestaques as u, useStoreOpenStatus as v };
