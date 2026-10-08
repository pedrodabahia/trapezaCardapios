import { Link } from "@tanstack/react-router";
import { BusinessCard } from "./BusinessCard";
import type { EmpresaCard } from "./BusinessCard";

// Carrossel genérico por INTENÇÃO.
// Exibe empresas em uma faixa horizontal e, ao final,
// disponibiliza "Ver mais" para acessar a categoria completa.
export function IntentCarousel({
  titulo,
  subtitulo,
  empresas,
  categoriaUrl,
  minimo = 1,
  limite = 22,
}: {
  titulo: string;
  subtitulo: string;
  empresas: EmpresaCard[];
  categoriaUrl?: string;
  minimo?: number;
  limite?: number;
}) {
  if (empresas.length < minimo) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-6">
      {/* Cabeçalho */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold">
            {titulo}
          </h2>

          <p className="mt-0.5 text-xs text-muted-foreground">
            {subtitulo}
          </p>
        </div>
      </div>

      {/* Carrossel */}
      <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {empresas.slice(0, limite).map((e) => (
          <div
            key={e.id}
            className="w-[160px] shrink-0"
          >
            <BusinessCard
              empresa={e}
              variant="grid"
            />
          </div>
        ))}

        {/* Ver mais */}
        {categoriaUrl && (
          <Link
            to={categoriaUrl}
            className="
              flex
              w-40
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-border
              border-2
              border-orange-400
              bg-muted/30
              px-4
              text-center
              text-xs
              font-semibold
              text-orange-700
              transition
              hover:bg-muted
              active:scale-[0.98]
            "
          >
            Ver mais
            <span className="ml-1">→</span>
          </Link>
        )}
      </div>
    </section>
  );
}