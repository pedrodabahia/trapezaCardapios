import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { CATEGORIAS_NEGOCIO } from "@/lib/categorias-negocio";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const TODAS_CATEGORIAS = "__todas__";

// No mobile mostra só as 7 primeiras + um botão "Mais" (grade 4 colunas:
// 4 numa linha, 3 + "Mais" na outra). Clicar em "Mais" abre uma folha
// (Sheet) subindo de baixo pra cima com TODAS as categorias — fecha no X
// do canto ou clicando fora, comportamento padrão do componente Sheet.
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
  const [abrirTodas, setAbrirTodas] = useState(false);

  const primeirasMobile = CATEGORIAS_NEGOCIO.slice(0, VISIVEIS_MOBILE);
  const restoMobile = CATEGORIAS_NEGOCIO.slice(VISIVEIS_MOBILE);

  return (
    <section id="categorias" className="mx-auto max-w-6xl px-4 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-bold">O que você está procurando?</h2>
      </div>

      {/* Mobile: grade fixa 4 colunas (2 linhas = 7 categorias + "Mais") */}
      <div className="grid grid-cols-4 gap-x-2 gap-y-4 sm:hidden">
        {primeirasMobile.map((c) => (
          <CategoriaIcone key={c.valor} categoria={c} ativa={categoriaFiltro === c.valor} />
        ))}
        {restoMobile.length > 0 && (
          <button
            onClick={() => setAbrirTodas(true)}
            className="flex flex-col items-center gap-1.5"
          >
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--tp-cream, #fdf6ec)" }}
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

      {/* Folha subindo de baixo com todas as categorias (só relevante no
          mobile, mas o Sheet funciona igual em qualquer tamanho de tela). */}
      <Sheet open={abrirTodas} onOpenChange={setAbrirTodas}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Todas as categorias</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid grid-cols-4 gap-x-2 gap-y-5 pb-6">
            {CATEGORIAS_NEGOCIO.map((c) => (
              <div key={c.valor} onClick={() => setAbrirTodas(false)}>
                <CategoriaIcone categoria={c} ativa={categoriaFiltro === c.valor} />
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
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
        style={{ backgroundColor: ativa ? "var(--tp-orange)" : "var(--tp-cream, #fdf6ec)" }}
      >
        <img className="w-[50%]" src={c.imagem_url} />
      </span>
      <span className="text-center text-[11px] font-bold leading-tight text-[#763200]">
        {c.label}
      </span>
    </Link>
  );
}
