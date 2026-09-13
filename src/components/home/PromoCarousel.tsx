import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { AnuncioHome } from "@/lib/admin-server";

const INTERVALO_MS = 5000;

// Carrossel de propaganda — 100% controlado pelo super-admin em
// /plataforma/anuncios (ver AnuncioHome). Substituiu a ideia anterior de
// sortear automaticamente um produto em promoção; agora é curadoria
// manual mesma. Troca sozinho a cada 5s; os pontinhos embaixo deixam
// claro que tem mais de um anúncio (e dá pra clicar pra pular direto).
export function PromoCarousel({ anuncios }: { anuncios: AnuncioHome[] }) {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (anuncios.length <= 1) return;
    const id = setInterval(() => setIndice((i) => (i + 1) % anuncios.length), INTERVALO_MS);
    return () => clearInterval(id);
  }, [anuncios.length]);

  if (anuncios.length === 0) return null;
  const anuncio = anuncios[indice % anuncios.length];

  // Link interno (começa com /) usa navegação da própria SPA; link
  // externo (http...) abre em aba nova; sem link, o slide não é clicável.
  const ehExterno = anuncio.link_url?.startsWith("http");

  const conteudo = (
    <div className="trapeza-banner-gradient relative flex items-center gap-3 overflow-hidden rounded-2xl p-3 text-white shadow-sm">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />

      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/15">
        {anuncio.imagem_url ? (
          <img src={anuncio.imagem_url} alt={anuncio.titulo} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">🔥</div>
        )}
      </div>

      <div className="relative min-w-0 flex-1">
        <p className="truncate font-display text-sm font-bold">{anuncio.titulo}</p>
        {anuncio.subtitulo && (
          <p className="truncate text-xs text-white/80">{anuncio.subtitulo}</p>
        )}
      </div>

      {anuncio.link_url && (
        <div
          className="relative flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold"
          style={{ color: "var(--tp-brown)" }}
        >
          Ver mais <ArrowRight className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );

  return (
    <section className="mx-auto max-w-6xl px-4 pt-5">
      {anuncio.link_url ? (
        <a
          href={anuncio.link_url}
          target={ehExterno ? "_blank" : undefined}
          rel={ehExterno ? "noreferrer" : undefined}
          className="block"
        >
          {conteudo}
        </a>
      ) : (
        conteudo
      )}

      {anuncios.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {anuncios.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndice(i)}
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
