import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { ArrowRight } from "lucide-react";
import type { AnuncioHome } from "@/lib/admin-server";

const INTERVALO_MS = 5000;
// Quanto precisa arrastar (fração da largura) pra trocar de slide.
const LIMITE_ARRASTO = 0.2;
// Ou um "flick" rápido: distância mínima (px) + velocidade mínima (px/ms).
const LIMITE_FLICK_PX = 30;
const LIMITE_FLICK_VEL = 0.4;
// Movimento mínimo antes de considerar que é um arrasto (e não um toque).
const LIMITE_INICIO_PX = 8;

// Carrossel de propaganda — 100% controlado pelo super-admin em
// /plataforma/anuncios. Troca sozinho a cada 5s e também dá pra arrastar
// com o dedo (ou mouse) pro lado. Enquanto o usuário arrasta, o timer
// pausa; depois de qualquer troca a contagem dos 5s recomeça.
export function PromoCarousel({ anuncios }: { anuncios: AnuncioHome[] }) {
  const total = anuncios.length;
  const [indice, setIndice] = useState(0);
  const [arrastando, setArrastando] = useState(false);
  const [dragX, setDragX] = useState(0);

  const janelaRef = useRef<HTMLDivElement>(null);
  const inicio = useRef<{ x: number; y: number; t: number } | null>(null);
  const arrastou = useRef(false);

  const atual = Math.min(indice, Math.max(total - 1, 0));

  // Autoplay: um timeout por slide. Reinicia a cada troca (manual ou
  // automática) e fica parado enquanto o dedo está na tela.
  useEffect(() => {
    if (total <= 1 || arrastando) return;
    const id = setTimeout(() => setIndice((i) => (i + 1) % total), INTERVALO_MS);
    return () => clearTimeout(id);
  }, [total, atual, arrastando]);

  if (total === 0) return null;

  function aoPressionar(e: PointerEvent<HTMLDivElement>) {
    if (total <= 1) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    inicio.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    arrastou.current = false;
  }

  function aoMover(e: PointerEvent<HTMLDivElement>) {
    if (!inicio.current) return;
    const dx = e.clientX - inicio.current.x;
    const dy = e.clientY - inicio.current.y;

    if (!arrastando) {
      // Só vira arrasto se for mais horizontal que vertical.
      if (Math.abs(dx) < LIMITE_INICIO_PX || Math.abs(dx) < Math.abs(dy)) return;
      setArrastando(true);
      arrastou.current = true;
      // Captura só agora, pra um simples toque ainda clicar no link.
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setDragX(dx);
  }

  function encerrar(e: PointerEvent<HTMLDivElement>, cancelado: boolean) {
    const ini = inicio.current;
    inicio.current = null;
    if (!ini || !arrastando) return;

    const dx = e.clientX - ini.x;
    const largura = janelaRef.current?.offsetWidth ?? 1;
    const velocidade = Math.abs(dx) / Math.max(performance.now() - ini.t, 1);
    const passou =
      !cancelado &&
      (Math.abs(dx) > largura * LIMITE_ARRASTO ||
        (Math.abs(dx) > LIMITE_FLICK_PX && velocidade > LIMITE_FLICK_VEL));

    if (passou) {
      // Arrastou pra esquerda -> próximo; pra direita -> anterior.
      if (dx < 0 && atual < total - 1) setIndice(atual + 1);
      else if (dx > 0 && atual > 0) setIndice(atual - 1);
    }
    setArrastando(false);
    setDragX(0);
  }

  // Resistência nas pontas (sem slide pra puxar): o arrasto "amortece".
  const noInicio = atual === 0 && dragX > 0;
  const noFim = atual === total - 1 && dragX < 0;
  const deslocamento = noInicio || noFim ? dragX * 0.3 : dragX;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-5">
      <div
        ref={janelaRef}
        // pan-y: rolagem vertical continua funcionando; o horizontal é nosso.
        className="-mb-2 select-none overflow-hidden pb-2"
        style={{ touchAction: "pan-y" }}
        onPointerDown={aoPressionar}
        onPointerMove={aoMover}
        onPointerUp={(e) => encerrar(e, false)}
        onPointerCancel={(e) => encerrar(e, true)}
        // Se foi arrasto, não deixa o "soltar" virar clique no link.
        onClickCapture={(e) => {
          if (arrastou.current) {
            e.preventDefault();
            e.stopPropagation();
            arrastou.current = false;
          }
        }}
      >
        <div
          className={"flex " + (arrastando ? "" : "transition-transform duration-300 ease-out")}
          style={{
            transform: `translate3d(calc(${-atual * 100}% + ${deslocamento}px), 0, 0)`,
          }}
        >
          {anuncios.map((anuncio, i) => (
            <Slide key={i} anuncio={anuncio} ativo={i === atual} />
          ))}
        </div>
      </div>

      {total > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {anuncios.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndice(i)}
              aria-label={`Anúncio ${i + 1}`}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === atual ? "16px" : "6px",
                backgroundColor: i === atual ? "var(--tp-orange)" : "var(--border)",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Slide({ anuncio, ativo }: { anuncio: AnuncioHome; ativo: boolean }) {
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
            draggable={false}
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
    <div className="w-full shrink-0 grow-0 basis-full" aria-hidden={!ativo}>
      {anuncio.link_url ? (
        <a
          href={anuncio.link_url}
          target={ehExterno ? "_blank" : undefined}
          rel={ehExterno ? "noreferrer" : undefined}
          draggable={false}
          tabIndex={ativo ? 0 : -1}
          className="block"
        >
          {conteudo}
        </a>
      ) : (
        conteudo
      )}
    </div>
  );
}