import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { AnuncioHome } from "@/lib/admin-server";

const INTERVALO_MS = 5000;

// Carrossel de propaganda — 100% controlado pelo super-admin em
// /plataforma/anuncios. Layout maior (estilo banner de app de e-commerce:
// texto grande à esquerda, foto redonda grande à direita, CTA embaixo do
// texto) em vez do banner fino de antes. Troca sozinho a cada 5s.
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
    <div
      className={
        "relative flex min-h-[150px] items-center gap-4 overflow-hidden rounded p-5 py-1 pr-1 text-white shadow-md sm:min-h-[170px] sm:p-6 " +
        (anuncio.cor_fundo ? "" : "trapeza-banner-gradient")
      }
      style={anuncio.cor_fundo ? { backgroundColor: anuncio.cor_fundo } : undefined}
    >
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 left-1/3 h-20 w-20 rounded-full bg-white/5" />

      <div className="relative min-w-0 flex-1">
        <p className="font-display text-xl font-extrabold leading-tight sm:text-2xl">
          {anuncio.titulo}
        </p>
        {anuncio.subtitulo && (
          <p className="mt-1.5 text-sm text-white/80">{anuncio.subtitulo}</p>
        )}
        {anuncio.link_url && (
          <div
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold"
            style={{ color: "var(--tp-brown)" }}
          >
            Ver mais <ArrowRight className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      <div className="relative h-[150px] w-[40%] shrink-0 overflow-hidden rounded border-4 border-white/20 sm:h-32 sm:w-32">
        {anuncio.imagem_url ? (
          <img
            src={anuncio.imagem_url}
            alt={anuncio.titulo}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/10 text-4xl">
            🔥
          </div>
        )}
      </div>
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
