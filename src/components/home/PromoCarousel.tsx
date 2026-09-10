import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { brl } from "@/lib/format";
import type { AnuncioPromocao } from "@/lib/admin-server";

const INTERVALO_MS = 5000;

// Mesmo layout/visual do banner de destaque que existia antes — só que
// agora com propaganda de verdade: produtos em promoção sorteados entre
// as empresas do próprio sistema (mín/máx 4, ver getAnunciosPromocao).
// Troca sozinho a cada 5s; os pontinhos embaixo deixam claro que tem mais
// de um anúncio (e dá pra clicar pra pular direto).
export function PromoCarousel({ anuncios }: { anuncios: AnuncioPromocao[] }) {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (anuncios.length <= 1) return;
    const id = setInterval(() => setIndice((i) => (i + 1) % anuncios.length), INTERVALO_MS);
    return () => clearInterval(id);
  }, [anuncios.length]);

  if (anuncios.length === 0) return null;
  const anuncio = anuncios[indice % anuncios.length];

  return (
    <section className="mx-auto max-w-6xl px-4 pt-5">
      <Link
        to="/s/$slug/product/$id"
        params={{ slug: anuncio.empresaSlug, id: anuncio.produtoId }}
        className="block"
      >
        <div className="trapeza-banner-gradient relative flex items-center gap-3 overflow-hidden rounded-2xl p-3 text-white shadow-sm">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />

          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/15">
            {anuncio.imagemUrl ? (
              <img
                src={anuncio.imagemUrl}
                alt={anuncio.produtoNome}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl">🔥</div>
            )}
          </div>

          <div className="relative min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/70">
              Oferta de {anuncio.empresaNome}
            </p>
            <p className="truncate font-display text-sm font-bold">{anuncio.produtoNome}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold">{brl(anuncio.precoAtual)}</span>
              {anuncio.precoAntigo && anuncio.precoAntigo > anuncio.precoAtual && (
                <span className="text-xs text-white/60 line-through">
                  {brl(anuncio.precoAntigo)}
                </span>
              )}
            </div>
          </div>

          <div className="relative flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold" style={{ color: "var(--tp-brown)" }}>
            Ver oferta <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </Link>

      {anuncios.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {anuncios.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                setIndice(i);
              }}
              aria-label={`Anúncio ${i + 1}`}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === indice ? "16px" : "6px",
                backgroundColor: i === indice ? "var(--tp-orange)" : "var(--border)",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
