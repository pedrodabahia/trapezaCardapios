import { ArrowRight } from "lucide-react";

// Banner compacto de destaque, com a paleta laranja própria da home.
// Mantive a copy genérica (ver comentário anterior): "Frete grátis hoje"
// seria uma promessa falsa pra empresas que cobram entrega.
export function FeaturedBanner({ onVerAgora }: { onVerAgora: () => void }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-5">
      <div className="trapeza-banner-gradient relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl px-4 py-4 text-white shadow-sm">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
        <div className="relative">
          <p className="font-display text-sm font-bold">Empresas perto de você 🎉</p>
          <p className="mt-0.5 text-xs text-white/85">
            Tudo num só lugar, contato direto pelo WhatsApp.
          </p>
        </div>
        <button
          onClick={onVerAgora}
          className="relative flex shrink-0 items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold"
          style={{ color: "var(--tp-brown)" }}
        >
          Ver agora <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}
