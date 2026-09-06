import type { EmpresaCard } from "./BusinessCard";
import { BusinessCard } from "./BusinessCard";

export function FeaturedBusinesses({ empresas }: { empresas: EmpresaCard[] }) {
  if (empresas.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h2 className="font-display text-2xl font-bold md:text-3xl">Empresas em destaque</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {empresas.map((e) => (
          <BusinessCard key={e.id} empresa={e} destaque />
        ))}
      </div>
    </section>
  );
}
