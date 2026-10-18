import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  listarPromocoes,
  listarCategoriasPromocao,
} from "@/modules/promocoes/controllers/promocao.controller";
import { PromoCard } from "@/components/promocoes/Promocard";
import { diversificar, registrarEvento } from "@/modules/promocoes/utils/promocao-utils";

type PromocoesDestaqueProps = {
  /** Quantidade de cards no carrossel. */
  limite?: number;
  /** Máximo de ofertas por empresa. */
  maxPorEmpresa?: number;
  titulo?: string;
  subtitulo?: string;
  mostrarVerTodas?: boolean;
};

export function PromocoesDestaque({
  limite = 10,
  maxPorEmpresa = 2,
  titulo = "🔥 Ofertas de hoje na sua região",
  subtitulo = "Descontos de lojas da cidade. Toque em um filtro para ver só o que interessa.",
  mostrarVerTodas = true,
}: PromocoesDestaqueProps) {
  const [categoriaId, setCategoriaId] = useState<string | null>(null);

  // Mesma chave da página /promocoes: o cache é reaproveitado.
  // Buscamos mais itens para ter variedade de lojas antes de limitar.
  const {
    data: promocoes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["promocoes-lista"],
    queryFn: () => listarPromocoes({ data: { limite: 100 } }),
    staleTime: 30_000,
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["promocoes-categorias"],
    queryFn: () => listarCategoriasPromocao({ data: {} }),
    staleTime: 60_000,
  });

  // Só categorias ativas que têm oferta.
  const categoriasComOferta = useMemo(() => {
    const ids = new Set(
      promocoes
        .map((p) => p.categoria_negocio_id)
        .filter((id): id is string => Boolean(id)),
    );
    return [...categorias]
      .filter((c) => c.ativo && ids.has(c.id))
      .sort(
        (a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR"),
      );
  }, [categorias, promocoes]);

  const exibidas = useMemo(() => {
    const base = categoriaId
      ? promocoes.filter((p) => p.categoria_negocio_id === categoriaId)
      : promocoes;
    return diversificar(base, maxPorEmpresa).slice(0, limite);
  }, [promocoes, categoriaId, maxPorEmpresa, limite]);

  // Registra uma vez quando a seção aparece na tela.
  const secaoRef = useRef<HTMLElement>(null);
  const visualizacaoRegistrada = useRef(false);
  const temConteudo = promocoes.length > 0;

  useEffect(() => {
    const el = secaoRef.current;
    if (!el || !temConteudo || visualizacaoRegistrada.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visualizacaoRegistrada.current) {
          visualizacaoRegistrada.current = true;
          registrarEvento("promo_home_view");
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [temConteudo]);

  if (isLoading || isError || promocoes.length === 0) {
    return null;
  }

  function escolherCategoria(id: string | null, nome: string) {
    setCategoriaId(id);
    registrarEvento("promo_filtro", { tipo: "categoria_home", valor: nome });
  }

  const chip = (ativo: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
      ativo
        ? "border-orange-500 bg-orange-500 text-white"
        : "bg-card hover:border-orange-400"
    }`;

  return (
    <section ref={secaoRef} className="mx-auto max-w-6xl space-y-3 px-4 py-6">
      <div>
        <h2 className="font-display text-lg font-bold">{titulo}</h2>
        <p className="text-sm text-muted-foreground">{subtitulo}</p>
      </div>

      {categoriasComOferta.length > 1 && (
        <div className="carrossel-sem-barra -mx-4 overflow-x-auto px-4">
          <div className="flex w-max gap-2 pb-1">
            <button
              type="button"
              aria-pressed={categoriaId === null}
              onClick={() => escolherCategoria(null, "todas")}
              className={chip(categoriaId === null)}
            >
              Tudo
            </button>
            {categoriasComOferta.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={categoriaId === c.id}
                onClick={() =>
                  escolherCategoria(categoriaId === c.id ? null : c.id, c.nome)
                }
                className={chip(categoriaId === c.id)}
              >
                {c.emoji ? `${c.emoji} ` : ""}
                {c.nome}
              </button>
            ))}
          </div>
        </div>
      )}

      {exibidas.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Nenhuma oferta nessa categoria hoje.
        </p>
      ) : (
        <div className="carrossel-sem-barra -mx-4 scroll-pl-4 snap-x snap-mandatory overflow-x-auto overscroll-x-contain px-4">
          <div className="flex w-max gap-3 pb-3">
            {exibidas.map((promocao) => (
              <PromoCard
                key={promocao.id}
                promocao={promocao}
                modo="carrossel"
                origem="home"
              />
            ))}
          </div>
        </div>
      )}

      {mostrarVerTodas && (
        <Link
          to="/promocoes"
          onClick={() => registrarEvento("promo_ver_todas_click", { origem: "home" })}
          className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition hover:bg-muted"
        >
          Ver todas as promoções
          <ArrowRight size={16} />
        </Link>
      )}
    </section>
  );
}