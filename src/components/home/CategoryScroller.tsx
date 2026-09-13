import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { CATEGORIAS_NEGOCIO } from "@/lib/categorias-negocio";
import { cn } from "@/lib/utils";

export const TODAS_CATEGORIAS = "__todas__";

// No mobile mostra só as 7 primeiras + um botão "Mais" (grade 4 colunas:
// 4 numa linha, 3 + "Mais" na outra). Clicar em "Mais" revela o resto.
// No tablet/desktop (sm+) continua em scroll horizontal com todas, sem
// precisar de "Mais" (o scroll já resolve o espaço).
const VISIVEIS_MOBILE = 7;

type CategoriaNegocio = (typeof CATEGORIAS_NEGOCIO)[number];

// Ícones circulares. Clicar leva pra página com TODOS os comércios
// daquela categoria (/categoria/$valor) — não filtra mais a própria home.
// `categoriaFiltro` continua existindo só pra manter o destaque visual
// caso algo mais na home ainda dependa dele.
export function CategoryScroller({
  categoriaFiltro,
}: {
  categoriaFiltro: string;
}) {
  const [expandidoMobile, setExpandidoMobile] = useState(false);

  const primeirasMobile = CATEGORIAS_NEGOCIO.slice(0, VISIVEIS_MOBILE);
  const restoMobile = CATEGORIAS_NEGOCIO.slice(VISIVEIS_MOBILE);
  const categoriasMobile = expandidoMobile ? CATEGORIAS_NEGOCIO : primeirasMobile;

  return (
    <section id="categorias" className="mx-auto max-w-6xl px-4 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-bold">O que você está procurando?</h2>
      </div>

      {/* Mobile: grade fixa 4 colunas (2 linhas = 7 categorias + "Mais") */}
      <div className="grid grid-cols-4 gap-x-2 gap-y-4 sm:hidden">
        {categoriasMobile.map((c) => (
          <CategoriaIcone key={c.valor} categoria={c} ativa={categoriaFiltro === c.valor} />
        ))}
        {!expandidoMobile && restoMobile.length > 0 && (
          <button
            onClick={() => setExpandidoMobile(true)}
            className="flex flex-col items-center gap-1.5"
          >
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--tp-cream, #63baab" }}
            >
              <MoreHorizontal className="h-6 w-6" style={{ color: "#763200" }} />
            </span>
            <span className="text-[11px] font-bold text-[#763200]">Mais</span>
          </button>
        )}
      </div>

      {/* Tablet/desktop: scroll horizontal com todas as categorias */}
      <div className="hidden gap-4 overflow-x-auto no-scrollbar pb-1 sm:flex">
        {CATEGORIAS_NEGOCIO.map((c) => (
          <CategoriaIcone key={c.valor} categoria={c} ativa={categoriaFiltro === c.valor} />
        ))}
      </div>
    </section>
  );
}

function CategoriaIcone({ categoria: c, ativa }: { categoria: CategoriaNegocio; ativa: boolean }) {
  return (
    <Link
      to="/categoria/$valor"
      params={{ valor: c.valor }}
      className="flex shrink-0 flex-col items-center gap-1.5"
    >
      <span
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full",
          "text-2xl transition-all duration-200",
          ativa && "scale-105",
        )}
        style={{ backgroundColor: ativa ? "var(--tp-orange)" : "#e9e9ff" }}
      >
        <img className="w-[50%]" src={c.imagem_url} />
      </span>
      <span className="text-center text-[11px] font-bold leading-tight text-[#763200]">
        {c.label}
      </span>
    </Link>
  );
}
