import { PremiumBusinessCard } from "./PremiumBusinessCard";
import type { EmpresaCard } from "./BusinessCard";

// "Perto de você" — só mostra empresas do PRÓPRIO sistema Trapeza
// (empresa externa nunca entra aqui; essa vitrine é justamente a isca
// pra atrair empresas novas pro sistema, mostrando o card bonito que só
// quem tem Trapeza ganha). Cards grandes/premium, não a listagem
// compacta usada em "Explore lojas".
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
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-base font-bold">📍 Perto de você</h2>
        <button
          onClick={onVerMais}
          className="text-xs font-semibold"
          style={{ color: "var(--tp-orange, #c65d3a)" }}
        >
          Ver mais
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {empresas.slice(0, 6).map((e) => (
          <PremiumBusinessCard key={e.id} empresa={e} aberto={abertoPorEmpresa[e.id]} />
        ))}
      </div>
    </section>
  );
}
