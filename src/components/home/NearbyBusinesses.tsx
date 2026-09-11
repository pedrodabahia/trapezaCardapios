import { PremiumBusinessCard } from "./PremiumBusinessCard";
import type { EmpresaCard } from "./BusinessCard";

// "⚡ Peça rápido" — só mostra empresas do PRÓPRIO sistema Trapeza
// (empresa externa nunca entra aqui; essa vitrine é a isca pra atrair
// empresa nova pro sistema, mostrando o card "premium" que só quem tem
// Trapeza ganha). Card grande/dourado, diferente do card padrão usado nos
// outros carrosséis de intenção.
export function NearbyBusinesses({
  empresas,
  abertoPorEmpresa,
  onVerMais,
}: {
  empresas: EmpresaCard[];
  // Mapa empresaId -> aberto agora (undefined = ainda não sabemos).
  abertoPorEmpresa: Record<string, boolean | undefined>;
  onVerMais: () => void;
}) {
  if (empresas.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-5">
      <div className="mb-0.5 flex items-center justify-between">
        <h2 className="font-display text-base font-bold">⚡ Peça rápido</h2>
        <button
          onClick={onVerMais}
          className="text-xs font-semibold"
          style={{ color: "var(--tp-orange, #c65d3a)" }}
        >
          Ver mais
        </button>
      </div>
      <p className="text-xs text-muted-foreground">Bateu aquela fome? Resolve rapidinho.</p>
      <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {empresas.slice(0, 12).map((e) => (
          <PremiumBusinessCard key={e.id} empresa={e} aberto={abertoPorEmpresa[e.id]} />
        ))}
      </div>
    </section>
  );
}
