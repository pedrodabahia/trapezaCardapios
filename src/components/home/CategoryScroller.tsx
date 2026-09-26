import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { CATEGORIAS_NEGOCIO, useCategoriasNegocio, type CategoriaNegocio } from "@/lib/categorias-negocio";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const TODAS_CATEGORIAS = "__todas__";

// A home mostra sete categorias-pai mais úteis e o botão "Mais" em todos
// os tamanhos. Assim não mistura categorias principais com subcategorias
// específicas logo na primeira tela. O botão abre a lista completa, sempre
// só com categorias-pai.
const VISIVEIS_MOBILE = 7;

const PRIORIDADE_HOME = [
  "lanchonete",
  "restaurante",
  "pizzaria",
  "mercado",
  "farmacia",
  "distribuidora",
  "barbearia",
];

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

  // Lista vem do banco (gerenciável em /plataforma/categorias-negocio) —
  // só cai no fallback fixo se a consulta ainda não voltou.
  const { data: categorias = CATEGORIAS_NEGOCIO } = useCategoriasNegocio();

  // `== null` também trata o fallback local (que não tem a propriedade)
  // como categoria pai até a lista atualizada do banco chegar.
  const categoriasPai = categorias.filter((categoria) => categoria.categoria_pai_id == null);
  const categoriasOrdenadas = [...categoriasPai].sort((a, b) => {
    const prioridadeA = PRIORIDADE_HOME.indexOf(a.valor);
    const prioridadeB = PRIORIDADE_HOME.indexOf(b.valor);
    const ordemA = prioridadeA === -1 ? PRIORIDADE_HOME.length : prioridadeA;
    const ordemB = prioridadeB === -1 ? PRIORIDADE_HOME.length : prioridadeB;
    return ordemA - ordemB;
  });
  const visiveis = categoriasOrdenadas.slice(0, VISIVEIS_MOBILE);

  return (
    <section id="categorias" className="mx-auto max-w-6xl px-4 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-bold">O que você está procurando?</h2>
      </div>

      <div className="grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-8 sm:gap-x-4">
        {visiveis.map((c) => (
          <CategoriaIcone key={c.valor} categoria={c} ativa={categoriaFiltro === c.valor} />
        ))}
        {categoriasOrdenadas.length > 0 && (
          <button
            onClick={() => setAbrirTodas(true)}
            className="flex flex-col items-center gap-1.5"
          >
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: " #ffb958" }}
            >
              <MoreHorizontal className="h-6 w-6" style={{ color: "#763200" }} />
            </span>
            <span className="text-[11px] font-bold text-[#763200]">Mais</span>
          </button>
        )}
      </div>

      {/* Folha subindo de baixo com todas as categorias-pai. */}
      <Sheet open={abrirTodas} onOpenChange={setAbrirTodas}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Explore por categoria</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid grid-cols-4 gap-x-2 gap-y-5 pb-6">
            {categoriasOrdenadas.map((c) => (
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
        <img className="w-[70%]" src={c.imagem_url ?? undefined} />
      </span>
      <span className="text-center text-[11px] font-bold leading-tight text-[#763200]">
        {c.label}
      </span>
    </Link>
  );
}
