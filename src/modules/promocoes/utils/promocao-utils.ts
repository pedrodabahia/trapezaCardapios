// Funções compartilhadas por home, lista, página da oferta e página da empresa.

export function formatarPreco(valor: number | null | undefined) {
  if (valor == null) return null;
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Desconto calculado a partir dos dois preços. Retorna null se não houver desconto real. */
export function calcularDesconto(
  atual: number | null | undefined,
  anterior: number | null | undefined,
) {
  if (atual == null || anterior == null || anterior <= 0 || atual >= anterior) {
    return null;
  }
  const economia = anterior - atual;
  const percentual = Math.round((economia / anterior) * 100);
  if (percentual < 1) return null;
  return { percentual, economia };
}

function paraDataLocal(valor: string): Date | null {
  // "2026-10-18" puro seria lido como UTC e cairia no dia anterior no Brasil.
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  const data = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

/** Texto de urgência só quando existe prazo real e ele está perto. */
export function getUrgencia(fimEm: string | null | undefined): string | null {
  if (!fimEm) return null;
  const fim = paraDataLocal(fimEm);
  if (!fim) return null;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  fim.setHours(0, 0, 0, 0);
  const dias = Math.round((fim.getTime() - hoje.getTime()) / 86_400_000);

  if (dias < 0) return null;
  if (dias === 0) return "Termina hoje";
  if (dias === 1) return "Termina amanhã";
  if (dias <= 6) {
    const dia = fim.toLocaleDateString("pt-BR", { weekday: "long" });
    return `Até ${dia}`;
  }
  return null;
}

/**
 * Título curto para o card: corta no primeiro emoji
 * ("Bermuda Fitness Rosa 🔥 Saia do Básico..." -> "Bermuda Fitness Rosa").
 * O título completo continua na página da oferta.
 */
export function tituloCurto(titulo: string) {
  const idx = titulo.search(/\p{Extended_Pictographic}/u);
  if (idx >= 8) return titulo.slice(0, idx).trim();
  return titulo
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

interface Ofertavel {
  empresa_slug?: string | null;
  empresa_nome?: string | null;
  preco_promocional?: number | null;
  preco_anterior?: number | null;
}

/**
 * Limita a N ofertas por empresa e intercala as empresas,
 * começando pelas de maior desconto. Use na home.
 */
export function diversificar<T extends Ofertavel>(lista: T[], max = 2): T[] {
  const pct = (p: T) =>
    calcularDesconto(p.preco_promocional, p.preco_anterior)?.percentual ?? 0;

  const grupos = new Map<string, T[]>();
  for (const p of lista) {
    const chave = p.empresa_slug || p.empresa_nome || "?";
    const g = grupos.get(chave) ?? [];
    g.push(p);
    grupos.set(chave, g);
  }

  const filas = [...grupos.values()]
    .map((g) => [...g].sort((a, b) => pct(b) - pct(a)).slice(0, max))
    .sort((a, b) => pct(b[0]) - pct(a[0]));

  const saida: T[] = [];
  for (let rodada = 0; rodada < max; rodada++) {
    for (const fila of filas) {
      if (fila[rodada]) saida.push(fila[rodada]);
    }
  }
  return saida;
}

/**
 * Registro central de eventos. Hoje usa gtag se existir e console.debug em dev.
 * Para trocar de ferramenta, mude só esta função.
 */
export function registrarEvento(
  nome: string,
  dados: Record<string, string | number | null | undefined> = {},
) {
  if (typeof window === "undefined") return;
  (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.(
    "event",
    nome,
    dados,
  );
  if (import.meta.env.DEV) console.debug("[evento]", nome, dados);
}