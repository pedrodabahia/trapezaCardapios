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
  <Link
    to="/s/$slug"
    params={{ slug: empresa.slug }}
    className="group block w-[180px] shrink-0"
  >
    <Card className="animate-gold-glow overflow-hidden rounded-md border-2 border-[#D4AF37]">
      
      <div className="relative h-28 overflow-hidden bg-muted">
        {empresa.logo_url ? (
          <img
            src={empresa.logo_url}
            alt={empresa.nome}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-orange-50" />
        )}

        {aberto !== undefined && (
          <span
            className={
              "absolute right-2 top-2 rounded px-1.5 py-0.5 text-[9px] font-bold " +
              (aberto
                ? "bg-emerald-500 text-white"
                : "bg-red-700 text-white")
            }
          >
            {aberto ? "Aberto" : "Fechado"}
          </span>
        )}
      </div>

      <CardContent className="p-2.5">
        <h3 className="truncate text-sm font-bold">
          {empresa.nome}
        </h3>

        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
          {[categoriaLabel, empresa.cidade].filter(Boolean).join(" • ")}
        </p>

        <span
          className="mt-1.5 block text-[10px] font-bold"
          style={{ color: "var(--tp-orange, #c65d3a)" }}
        >
          Ver cardápio →
        </span>
      </CardContent>
    </Card>
  </Link>
);
}
