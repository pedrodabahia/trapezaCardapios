import { CATEGORIAS_NEGOCIO } from "@/lib/categorias-negocio";
import { cn } from "@/lib/utils";

export const TODAS_CATEGORIAS = "__todas__";

export function CategoriesSection({
  categoriaFiltro,
  onChange,
}: {
  categoriaFiltro: string;
  onChange: (v: string) => void;
}) {
  return (
    <section id="categorias" className="mx-auto max-w-6xl px-6 py-10">
      <h2 className="text-center font-display text-2xl font-bold md:text-3xl">
        Explore por categoria
      </h2>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => onChange(TODAS_CATEGORIAS)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-semibold transition",
            categoriaFiltro === TODAS_CATEGORIAS
              ? "border-brand-red bg-brand-red text-white"
              : "border-border bg-card hover:border-brand-red/50",
          )}
        >
          Todas
        </button>
        {CATEGORIAS_NEGOCIO.map((c) => (
          <button
            key={c.valor}
            onClick={() => onChange(c.valor)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition",
              categoriaFiltro === c.valor
                ? "border-brand-red bg-brand-red text-white"
                : "border-border bg-card hover:border-brand-red/50",
            )}
          >
            <span className="mr-1.5">{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>
    </section>
  );
}
