import { CATEGORIAS_NEGOCIO } from "@/lib/categorias-negocio";
import { cn } from "@/lib/utils";

export const TODAS_CATEGORIAS = "__todas__";

const VISIVEIS_INICIAL = 6;

// Ícones circulares com scroll horizontal, como no design de referência.
// "Ver todas" só expande a lista inline — não existe uma página de
// categorias separada em nível de plataforma.
export function CategoryScroller({
  categoriaFiltro,
  onChange,
}: {
  categoriaFiltro: string;
  onChange: (v: string) => void;
}) {
  const categorias = CATEGORIAS_NEGOCIO.slice(0, VISIVEIS_INICIAL);

  return (
    <section id="categorias" className="mx-auto max-w-6xl px-4 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-bold">Categorias</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
        {categorias.map((c) => (
          <button
            key={c.valor}
            onClick={() => onChange(categoriaFiltro === c.valor ? TODAS_CATEGORIAS : c.valor)}
            className="flex shrink-0 flex-col items-center gap-1.5"
          >
            <span
              className={cn(
                "flex h-14 w-14 items-center border border-2 border-[#763200] justify-center rounded-full text-2xl transition",
                categoriaFiltro === c.valor
                  ? "text-white"
                  : "bg-white text-foreground",
              )}
              
              style={
                categoriaFiltro === c.valor ? { backgroundColor: "var(--tp-orange)" } : undefined
              }
            >
            <img className="w-[50%]" src={c.imagem_url} />  
            </span>
            <span className="text-[11px] font-bold text-[#763200]">{c.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
