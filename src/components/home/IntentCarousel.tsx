import { BusinessCard } from "./BusinessCard";
import type { EmpresaCard } from "./BusinessCard";

// Carrossel gen\u00e9rico por INTEN\u00c7\u00c3O (\u00e9 a pe\u00e7a central da reformula\u00e7\u00e3o: em
// vez de "Categorias > Lanchonetes > Pizzarias...", cada bloco responde a
// uma pergunta tipo "t\u00f4 com fome" / "quero cortar o cabelo"). Reaproveita
// o BusinessCard j\u00e1 existente (variant="grid"), s\u00f3 encaixado numa faixa
// de scroll horizontal com largura fixa por card (~160px).
//
// N\u00e3o renderiza nada se n\u00e3o tiver empresa suficiente pra preencher o
// bloco de verdade \u2014 "\u00e9 melhor ter poucas se\u00e7\u00f5es boas do que muitas vazias
// ou artificiais" (regra expl\u00edcita do briefing).
export function IntentCarousel({
  titulo,
  subtitulo,
  empresas,
  minimo = 3,
  limite = 12,
}: {
  titulo: string;
  subtitulo: string;
  empresas: EmpresaCard[];
  // Abaixo disso, a se\u00e7\u00e3o inteira some em vez de mostrar 1-2 cards
  // isolados parecendo vazia/artificial.
  minimo?: number;
  limite?: number;
}) {
  if (empresas.length < minimo) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-6">
      <h2 className="font-display text-base font-bold">{titulo}</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{subtitulo}</p>
      <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {empresas.slice(0, limite).map((e) => (
          <div key={e.id} className="w-[160px] shrink-0">
            <BusinessCard empresa={e} variant="grid" />
          </div>
        ))}
      </div>
    </section>
  );
}
