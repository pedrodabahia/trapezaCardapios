import { Link } from "@tanstack/react-router";

// CTA discreto de fim de página — de propósito bem pequeno, sem virar uma
// landing page de venda dentro do app de descoberta.
export function BusinessCTASmall() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-6 pt-6">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-border/70 px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Tem uma empresa?</p>
          <p className="text-xs text-muted-foreground">
            Coloque seu negócio no Trapeza e seja encontrado por clientes da sua cidade.
          </p>
        </div>
        <Link
          to="/painel/login"
          className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold text-white"
          style={{ backgroundColor: "var(--tp-orange)" }}
        >
          Cadastrar
        </Link>
      </div>
    </section>
  );
}
