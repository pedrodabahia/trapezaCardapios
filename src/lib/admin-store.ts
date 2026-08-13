import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useEffect, useState } from "react";
import {
  getEmpresaBySlug,
  getEmpresaCompletaAuth,
  type EmpresaCompleta,
  type Empresa,
  type Categoria,
  type CategoriaOpcao,
  type Produto,
  type OpcaoPersonalizacao,
  type ProdutoIngrediente,
} from "./admin-server";

// ============================================================================
// Tipos públicos
// ============================================================================

export type Coupon = { code: string; discount: number; desc: string };

export type DayHours = {
  day: number; // 0 = domingo ... 6 = sábado
  label: string;
  open: string;
  close: string;
  closed: boolean;
};

export type Neighborhood = { id: string; name: string; fee: number };

export type EmpresaConfig = {
  cores?: {
    primary?: string;
    accent?: string;
    bg?: string;
    fg?: string;
  };
  cupons?: Coupon[];
  frete?: {
    taxa: number;
    gratis_acima_de: number | null;
    gratis_habilitado: boolean;
  };
  horarios?: Record<
    "domingo" | "segunda" | "terca" | "quarta" | "quinta" | "sexta" | "sabado",
    { abre: string; fecha: string; fechado: boolean }
  >;
  cidade_entrega?: string;
  // Taxa de entrega por bairro. Se essa lista tiver algum item, o checkout
  // passa a exigir escolher um bairro (em vez do endereço livre) e a taxa
  // de entrega vem do bairro escolhido, não mais da taxa fixa em `frete`.
  bairros?: Neighborhood[];
};

// ============================================================================
// Helpers de config
// ============================================================================

const DEFAULT_FRETE = { taxa: 6.9, gratis_acima_de: 80 as number | null, gratis_habilitado: true };
const DEFAULT_CORES = {
  primary: "#4A6741",
  accent: "#8FA876",
  bg: "#FFFFFF",
  fg: "#2E3B27",
};

export function useEmpresaPublica(slug: string | undefined) {
  return useQuery({
    queryKey: ["empresa-publica", slug] as const,
    queryFn: async (): Promise<EmpresaCompleta | null> => {
      if (!slug) return null;
      return getEmpresaBySlug({ data: { slug } });
    },
    enabled: !!slug,
    staleTime: 30_000,
  });
}

export function useEmpresaAdmin(token: string | null, empresaId: string | undefined) {
  return useQuery({
    queryKey: ["empresa-admin", empresaId] as const,
    queryFn: async (): Promise<EmpresaCompleta | null> => {
      if (!token || !empresaId) return null;
      return getEmpresaCompletaAuth({ data: { token, empresaId } });
    },
    enabled: !!token && !!empresaId,
    staleTime: 10_000,
  });
}

// ============================================================================
// Selectors derivados (memoizados)
// ============================================================================

export function useProdutos() {
  const q = useEmpresaPublica(undefined); // hook genérico; melhor usar via props
  return q;
}

export function useProdutosPorEmpresa(
  empresaCompleta: EmpresaCompleta | null | undefined,
  categoriaSlug?: string,
) {
  return useMemo(() => {
    if (!empresaCompleta) return [];
    const list = empresaCompleta.produtos.filter((p) => p.ativo);
    if (!categoriaSlug) return list;
    if (categoriaSlug === "promocoes") {
      return list.filter(
        (p) =>
          p.tag === "promocao" ||
          empresaCompleta.categorias.find((c) => c.slug === "promocoes")?.id === p.categoria_id,
      );
    }
    const cat = empresaCompleta.categorias.find((c) => c.slug === categoriaSlug);
    return list.filter((p) => p.categoria_id === cat?.id);
  }, [empresaCompleta, categoriaSlug]);
}

export function useDestaques(empresaCompleta: EmpresaCompleta | null | undefined) {
  return useMemo(() => {
    if (!empresaCompleta) return [];
    return empresaCompleta.produtos.filter((p) => p.ativo && p.tag);
  }, [empresaCompleta]);
}

export function useCategoriasAtivas(
  empresaCompleta: EmpresaCompleta | null | undefined,
) {
  return useMemo(() => {
    if (!empresaCompleta) return [];
    return empresaCompleta.categorias.filter((c) => c.ativo);
  }, [empresaCompleta]);
}

export function useProdutoById(
  empresaCompleta: EmpresaCompleta | null | undefined,
  id: string | undefined,
) {
  return useMemo(() => {
    if (!empresaCompleta || !id) return null;
    return empresaCompleta.produtos.find((p) => p.id === id) ?? null;
  }, [empresaCompleta, id]);
}

export function useCategoriaBySlug(
  empresaCompleta: EmpresaCompleta | null | undefined,
  slug: string | undefined,
) {
  return useMemo(() => {
    if (!empresaCompleta || !slug) return null;
    return empresaCompleta.categorias.find((c) => c.slug === slug) ?? null;
  }, [empresaCompleta, slug]);
}

export function useOpcoes(
  empresaCompleta: EmpresaCompleta | null | undefined,
  categoriaOpcaoId?: string,
) {
  return useMemo(() => {
    if (!empresaCompleta) return [];
    const list = empresaCompleta.opcoes;
    return categoriaOpcaoId
      ? list.filter((o) => o.categoria_opcao_id === categoriaOpcaoId)
      : list;
  }, [empresaCompleta, categoriaOpcaoId]);
}

export function useCategoriasOpcao(
  empresaCompleta: EmpresaCompleta | null | undefined,
) {
  return useMemo(() => {
    if (!empresaCompleta) return [];
    return empresaCompleta.categoriasOpcao;
  }, [empresaCompleta]);
}

// Ingredientes cadastrados pra um produto específico (vazio se o produto
// não tiver nenhum ingrediente configurado — é esse o sinal que a UI usa
// pra decidir se mostra ou não a seção de remover ingrediente).
export function useIngredientesDoProduto(
  empresaCompleta: EmpresaCompleta | null | undefined,
  produtoId: string | undefined,
) {
  return useMemo(() => {
    if (!empresaCompleta || !produtoId) return [];
    return empresaCompleta.produtoIngredientes[produtoId] ?? [];
  }, [empresaCompleta, produtoId]);
}

// ============================================================================
// Config helpers
// ============================================================================

export function getCores(
  cfg: Record<string, unknown> | undefined,
): Required<NonNullable<EmpresaConfig["cores"]>> {
  const cores = (cfg?.cores ?? {}) as Partial<NonNullable<EmpresaConfig["cores"]>>;
  return {
    primary: cores.primary ?? DEFAULT_CORES.primary,
    accent: cores.accent ?? DEFAULT_CORES.accent,
    bg: cores.bg ?? DEFAULT_CORES.bg,
    fg: cores.fg ?? DEFAULT_CORES.fg,
  };
}

export function getCupons(cfg: Record<string, unknown> | undefined): Coupon[] {
  const cupons = (cfg?.cupons ?? []) as Coupon[];
  return cupons;
}

export function getFrete(
  cfg: Record<string, unknown> | undefined,
): Required<NonNullable<EmpresaConfig["frete"]>> {
  const f = (cfg?.frete ?? {}) as Partial<NonNullable<EmpresaConfig["frete"]>>;
  return {
    taxa: f.taxa ?? DEFAULT_FRETE.taxa,
    gratis_acima_de: f.gratis_acima_de ?? DEFAULT_FRETE.gratis_acima_de,
    gratis_habilitado: f.gratis_habilitado ?? DEFAULT_FRETE.gratis_habilitado,
  };
}

export function getBairros(cfg: Record<string, unknown> | undefined): Neighborhood[] {
  return (cfg?.bairros ?? []) as Neighborhood[];
}

export function getHorarios(
  cfg: Record<string, unknown> | undefined,
): DayHours[] {
  const map = (cfg?.horarios ?? {}) as Record<
    string,
    { abre: string; fecha: string; fechado: boolean } | undefined
  >;
  const labels = [
    "domingo",
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado",
  ];
  const labelsDisplay = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];
  return labels.map((k, i) => {
    const h = map[k];
    return {
      day: i,
      label: labelsDisplay[i],
      open: h?.abre ?? "18:00",
      close: h?.fecha ?? "23:00",
      closed: h?.fechado ?? false,
    };
  });
}

export function getCidadeEntrega(cfg: Record<string, unknown> | undefined): string {
  return (cfg?.cidade_entrega as string | undefined) ?? "";
}

// ============================================================================
// Horário aberto/fechado
// ============================================================================

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function isStoreOpenNow(hours: DayHours[], now = new Date()): boolean {
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

export function useStoreOpenStatus(cfg: Record<string, unknown> | undefined): boolean {
  const hours = useMemo(() => getHorarios(cfg), [cfg]);
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  return isStoreOpenNow(hours);
}

// ============================================================================
// Invalidação
// ============================================================================

export function useInvalidateEmpresa() {
  const qc = useQueryClient();
  return (opts: { slug?: string; empresaId?: string } = {}) => {
    if (opts.slug) {
      qc.invalidateQueries({ queryKey: ["empresa-publica", opts.slug] });
    }
    if (opts.empresaId) {
      qc.invalidateQueries({ queryKey: ["empresa-admin", opts.empresaId] });
    }
  };
}

// ============================================================================
// Re-exports para componentes que só precisam do tipo
// ============================================================================

export type { Empresa, Categoria, CategoriaOpcao, Produto, OpcaoPersonalizacao, ProdutoIngrediente };
