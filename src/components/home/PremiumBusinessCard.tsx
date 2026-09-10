import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { labelCategoriaNegocio } from "@/lib/categorias-negocio";
import type { EmpresaCard } from "./BusinessCard";

// Card "premium" — bem maior e mais chamativo que o BusinessCard normal,
// só pra empresas do PRÓPRIO sistema Trapeza (nunca pra empresa externa,
// que não tem cardápio pra "vender" aqui). O selo "⚡ Peça rápido" é a
// isca visual: mostra pro cliente final (e indiretamente pros donos de
// empresa que ainda não têm Trapeza) que pedir aqui é mais rápido que
// mandar mensagem e esperar resposta no zap.
export function PremiumBusinessCard({
  empresa,
  aberto,
}: {
  empresa: EmpresaCard;
  // undefined = não sabemos ainda (horário ainda carregando, ou empresa
  // não configurou horário nenhum) — nesse caso não mostra o selo, em vez
  // de inventar um status.
  aberto: boolean | undefined;
}) {
  const categoriaLabel = labelCategoriaNegocio(empresa.categoria);

  return (
    <Link to="/s/$slug" params={{ slug: empresa.slug }} className="group block h-full">
      <Card className="h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {empresa.logo_url ? (
            <img
              src={empresa.logo_url}
              alt={empresa.nome}
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 text-5xl">
              
            </div>
          )}

          <span
            className="absolute left-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow"
            style={{ backgroundColor: "var(--tp-orange, #c65d3a)" }}
          >
            ⚡ Peça rápido
          </span>

          {aberto !== undefined && (
            <span
              className={
                "absolute right-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-bold shadow " +
                (aberto ? "bg-emerald-500 text-white" : "bg-neutral-700 text-white")
              }
            >
              {aberto ? "Aberto agora" : "Fechado"}
            </span>
          )}
        </div>

        <CardContent className="space-y-1 p-3.5">
          <h3 className="truncate font-display text-base font-bold leading-tight">
            {empresa.nome}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {[categoriaLabel, empresa.cidade].filter(Boolean).join(" • ")}
          </p>
          <span
            className="mt-1 inline-block text-xs font-bold"
            style={{ color: "var(--tp-orange, #c65d3a)" }}
          >
            Ver cardápio →
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
