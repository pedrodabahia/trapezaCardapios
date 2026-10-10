import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, MapPin, MessageCircle, Tag } from "lucide-react";
import { getPromocaoPorSlug } from "@/modules/promocoes/controllers/promocao.controller";
import { trackWhatsAppClick } from "@/lib/analytics";

export const Route = createFileRoute("/promocoes/$slug")({
  component: PaginaDetalhePromocao,
});

function formatarPreco(valor: number | null | undefined) {
  if (valor == null) return null;
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(valor: string | null | undefined) {
  if (!valor) return null;
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return null;
  return data.toLocaleDateString("pt-BR");
}

function linkWhatsApp(numero: string | null, titulo: string) {
  if (!numero) return null;
  let telefone = numero.replace(/\D/g, "");
  if (!telefone) return null;
  // O wa.me espera o código do país. Para números brasileiros sem DDI, adiciona 55.
  if (!telefone.startsWith("55")) telefone = `55${telefone}`;
  const mensagem = encodeURIComponent(
    `Olá! Vi a promoção "${titulo}" no Trapeza e gostaria de saber mais.`,
  );
  return `https://wa.me/${telefone}?text=${mensagem}`;
}

function PaginaDetalhePromocao() {
  const { slug } = Route.useParams();
  const {
    data: promocao,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["promocao-detalhe", slug],
    queryFn: () => getPromocaoPorSlug({ data: { slug } }),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-muted-foreground">Carregando oferta...</p>
      </main>
    );
  }

  if (isError || !promocao) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-xl font-bold">Oferta não encontrada</h1>
        <p className="mt-2 text-muted-foreground">
          Essa promoção pode ter expirado ou não estar mais disponível.
        </p>
        <Link to="/" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:underline">
          <ArrowLeft size={16} /> Voltar para as promoções
        </Link>
      </main>
    );
  }

  const precoAtual = formatarPreco(promocao.preco_promocional);
  const precoAnterior = formatarPreco(promocao.preco_anterior);
  const inicio = formatarData(promocao.inicio_em);
  const fim = formatarData(promocao.fim_em);
  const whatsapp = linkWhatsApp(promocao.empresa_whatsapp, promocao.titulo);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      <Link
        to="/"
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft size={18} /> Voltar às ofertas
      </Link>

      <article className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid md:grid-cols-2">
          <div className="relative flex min-h-64 items-center justify-center bg-muted/50 p-4 sm:min-h-[420px] sm:p-8">
            {promocao.imagem_url ? (
              <img
                src={promocao.imagem_url}
                alt={promocao.titulo}
                className="max-h-[520px] w-full object-contain"
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center text-muted-foreground">
                <Tag size={56} />
              </div>
            )}
            {promocao.destaque && (
              <span className="absolute left-4 top-4 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-bold text-black">
                OFERTA EM DESTAQUE
              </span>
            )}
          </div>

          <div className="flex flex-col p-5 sm:p-8">
            <p className="text-sm font-semibold text-orange-600">TRAPEZA PROMOÇÕES</p>
            <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
              {promocao.titulo}
            </h1>

            <Link
              to="/promocoes/empresa/$slug"
              params={{ slug: promocao.empresa_slug }}
              className="mt-4 flex w-fit items-center gap-3 rounded-xl border p-3 transition hover:bg-muted/50"
            >
              {promocao.empresa_logo_url ? (
                <img
                  src={promocao.empresa_logo_url}
                  alt={`Logo de ${promocao.empresa_nome}`}
                  className="h-11 w-11 rounded-lg border bg-white object-contain p-1"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
                  <Tag size={20} />
                </div>
              )}
              <span>
                <span className="block text-xs text-muted-foreground">Oferta de</span>
                <span className="block font-semibold">{promocao.empresa_nome}</span>
                {(promocao.empresa_bairro || promocao.empresa_cidade) && (
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin size={12} />
                    {[promocao.empresa_bairro, promocao.empresa_cidade].filter(Boolean).join(", ")}
                  </span>
                )}
              </span>
            </Link>

            <div className="mt-6">
              {precoAtual ? (
                <p className="text-3xl font-extrabold text-green-700">{precoAtual}</p>
              ) : (
                <p className="text-lg font-semibold">Consulte o preço com a empresa</p>
              )}
              {precoAnterior && (
                <p className="mt-1 text-sm text-muted-foreground">
                  De <span className="line-through">{precoAnterior}</span>
                </p>
              )}
            </div>

            {(inicio || fim) && (
              <div className="mt-5 flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
                <CalendarDays size={17} className="mt-0.5 shrink-0" />
                <span>
                  {inicio && fim ? `Válida de ${inicio} até ${fim}` : fim ? `Válida até ${fim}` : `Disponível a partir de ${inicio}`}
                </span>
              </div>
            )}

            {promocao.descricao && (
              <section className="mt-6">
                <h2 className="font-semibold">Sobre esta oferta</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                  {promocao.descricao}
                </p>
              </section>
            )}

            <div className="mt-auto pt-7">
              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => void trackWhatsAppClick(promocao.empresa_id)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-4 font-bold text-white transition hover:bg-green-700"
                >
                  <MessageCircle size={20} /> Consultar oferta no WhatsApp
                </a>
              ) : (
                <p className="rounded-xl bg-muted p-4 text-center text-sm text-muted-foreground">
                  O contato desta empresa ainda não está disponível.
                </p>
              )}
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Consulte a disponibilidade e as condições diretamente com a empresa.
              </p>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
