import { CATEGORIAS_NEGOCIO } from "@/lib/categorias-negocio";
import { cn } from "@/lib/utils";

export const TODAS_CATEGORIAS = "__todas__";

const VISIVEIS_INICIAL =10

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
        <h2 className="font-display text-base font-bold">O que você está procurando?</h2>
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
    "flex h-14 w-14 items-center justify-center rounded-full",
    "border-2 border-[#763200]",
    "text-2xl transition-all duration-200",
    categoriaFiltro === c.valor && "scale-105",
  )}
  style={{
    backgroundColor:
      categoriaFiltro === c.valor
        ? "var(--tp-orange)"
        : c.cor,
  }}
>
  <img
    className="w-[50%]"
    src={c.imagem_url}
  />
</span>
            <span className="text-[11px] font-bold text-[#763200]">{c.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
