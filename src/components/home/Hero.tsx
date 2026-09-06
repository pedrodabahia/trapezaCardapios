import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="topo" className="relative overflow-hidden text-white">
      {/* Vídeo de fundo. Arquivo esperado em public/videos/hero-bg.mp4 —
          se ele não existir, o gradiente abaixo (hero-gradient) continua
          servindo de fallback visual, então nada quebra visualmente. */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/logo.webp"
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Overlay escuro/gradiente por cima do vídeo — garante contraste
          pro texto branco independente do que estiver rodando no vídeo. */}
      <div className="hero-gradient absolute inset-0 opacity-60" />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
            Trapeza
          </span>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Encontre empresas. Descubra produtos. Compre de forma simples.
          </h1>
          <p className="mt-4 max-w-lg text-base text-white/85 md:text-lg">
            Encontre lojas e empresas no Trapeza, explore seus catálogos e
            entre em contato diretamente pelo WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/painel/login">
              <Button
                size="lg"
                className="rounded-full bg-brand-yellow text-white hover:bg-brand-yellow/90"
              >
                Cadastre sua empresa
              </Button>
            </Link>
            <a href="#empresas">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20"
              >
                Ver lojas
              </Button>
            </a>
          </div>
        </div>

        {/* Mockup do produto: cards de catálogo empilhados, só com CSS —
            sem foto de banco de imagem desconectada do produto. */}
        <div className="relative mx-auto hidden h-72 w-full max-w-sm md:block">
          <div className="absolute inset-x-6 top-6 rounded-2xl bg-white/10 p-4 shadow-xl backdrop-blur">
            <div className="h-3 w-24 rounded-full bg-white/40" />
            <div className="mt-3 h-2 w-32 rounded-full bg-white/25" />
          </div>
          <div className="absolute inset-x-3 top-16 rounded-2xl bg-white p-4 text-brand-brown shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 rounded-full bg-brand-brown/20" />
              <span className="rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-bold text-white">
                Novo
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-brand-yellow/40" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2 w-3/4 rounded-full bg-brand-brown/15" />
                    <div className="h-2 w-1/3 rounded-full bg-brand-brown/10" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-full bg-brand-red py-2 text-center text-xs font-bold text-white">
              Fazer pedido no WhatsApp
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
