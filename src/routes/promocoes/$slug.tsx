import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, MapPin, MessageCircle, Tag } from "lucide-react";
import { useEffect, useRef } from "react";

import {
  getPromocaoPorSlug,
  listarPromocoes,
  listarPromocoesPorEmpresa,
} from "@/modules/promocoes/controllers/promocao.controller";
import {
  trackPromotionView,
  trackPromotionWhatsAppClick,
} from "@/lib/analytics";
import { PromoCard, type PromoCardData } from "@/components/promocoes/Promocard";
import {
  calcularDesconto,
  diversificar,
  formatarPreco,
  getUrgencia,
} from "@/modules/promocoes/utils/promocao-utils.ts";

export const Route = createFileRoute("/promocoes/$slug")({
  component: PaginaDetalhePromocao,
});

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

function Faixa({
  titulo,
  ofertas,
  origem,
}: {
  titulo: string;
  ofertas: PromoCardData[];
  origem: string;
}) {
  if (ofertas.length === 0) return null;
  return (
    <section className="mt-10 w-full min-w-0">
      <h2 className="mb-3 font-display text-lg font-bold sm:text-xl">{titulo}</h2>
      <div className="carrossel-sem-barra w-full min-w-0 snap-x snap-mandatory overflow-x-auto overscroll-x-contain pb-3">
        <div className="flex w-max gap-3 px-1 sm:gap-4">
          {ofertas.map((o) => (
            <PromoCard key={o.id} promocao={o} modo="carrossel" origem={origem} />
          ))}
        </div>
      </div>
    </section>
  );
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

  // Outras ofertas da mesma loja
  const { data: daLoja = [] } = useQuery({
    queryKey: ["promocoes-empresa", promocao?.empresa_id],
    queryFn: () =>
      listarPromocoesPorEmpresa({ data: { empresaId: promocao!.empresa_id } }),
    enabled: Boolean(promocao?.empresa_id),
    staleTime: 30_000,
  });

  // Mesma chave da lista: reaproveita o cache
  const { data: todas = [] } = useQuery({
    queryKey: ["promocoes-lista"],
    queryFn: () => listarPromocoes({ data: { limite: 100 } }),
    staleTime: 30_000,
  });

  const visualizacaoRegistrada = useRef<string | null>(null);

  useEffect(() => {
    if (!promocao?.id) return;
    if (visualizacaoRegistrada.current === promocao.id) return;
    visualizacaoRegistrada.current = promocao.id;
    void trackPromotionView(promocao.id, promocao.empresa_id);
  }, [promocao?.id, promocao?.empresa_id]);

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
        <Link
          to="/promocoes"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:underline"
        >
          <ArrowLeft size={16} /> Ver outras ofertas
        </Link>
      </main>
    );
  }

  const precoAtual = formatarPreco(promocao.preco_promocional);
  const precoAnterior = formatarPreco(promocao.preco_anterior);
  const desconto = calcularDesconto(
    promocao.preco_promocional,
    promocao.preco_anterior,
  );
  const urgencia = getUrgencia(promocao.fim_em);
  const inicio = formatarData(promocao.inicio_em);
  const fim = formatarData(promocao.fim_em);
  const whatsapp = linkWhatsApp(promocao.empresa_whatsapp, promocao.titulo);

  const maisDaLoja = daLoja.filter((o) => o.id !== promocao.id).slice(0, 10);
  const outrasPerto = diversificar(
    todas.filter(
      (o) => o.id !== promocao.id && o.empresa_slug !== promocao.empresa_slug,
    ),
    1,
  ).slice(0, 10);

  const registrarWhatsApp = () =>
    void trackPromotionWhatsAppClick(promocao.id, promocao.empresa_id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:py-10 md:pb-10">
      <Link
        to="/promocoes"
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

            {desconto && (
              <span className="absolute left-4 top-4 rounded-xl bg-red-600 px-3 py-1.5 text-base font-extrabold text-white shadow">
                -{desconto.percentual}%
              </span>
            )}
          </div>

          <div className="flex flex-col p-5 sm:p-8">
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
              {promocao.titulo}
            </h1>

            {/* Preço logo no topo, antes do bloco da empresa */}
            <div className="mt-4">
              {precoAtual ? (
                <p className="text-4xl font-extrabold text-orange-700 dark:text-orange-400">
                  {precoAtual}
                </p>
              ) : (
                <p className="text-lg font-semibold">Consulte o preço com a empresa</p>
              )}

              {precoAnterior && desconto && (
                <p className="mt-1 text-sm text-muted-foreground">
                  De <span className="line-through">{precoAnterior}</span>
                </p>
              )}

              {desconto && (
                <p className="mt-1 text-base font-bold text-green-700 dark:text-green-400">
                  Você economiza {formatarPreco(desconto.economia)}
                </p>
              )}

              {urgencia && (
                <p className="mt-3 inline-block rounded-full bg-amber-300 px-3 py-1 text-sm font-bold text-black">
                  {urgencia}
                </p>
              )}
            </div>

            <Link
              to="/promocoes/empresa/$slug"
              params={{ slug: promocao.empresa_slug }}
              className="mt-5 flex w-fit items-center gap-3 rounded-xl border p-3 transition hover:bg-muted/50"
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
                    {[promocao.empresa_bairro, promocao.empresa_cidade]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
              </span>
            </Link>

            {(inicio || fim) && (
              <div className="mt-5 flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
                <CalendarDays size={17} className="mt-0.5 shrink-0" />
                <span>
                  {inicio && fim
                    ? `Válida de ${inicio} até ${fim}`
                    : fim
                      ? `Válida até ${fim}`
                      : `Disponível a partir de ${inicio}`}
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

            {/* Botão no desktop. No celular, ele fica na barra fixa lá embaixo. */}
            <div className="mt-auto hidden pt-7 md:block">
              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={registrarWhatsApp}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-4 font-bold text-white transition hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                >
                  <MessageCircle size={20} /> Pedir pelo WhatsApp
                </a>
              ) : (
                <p className="rounded-xl bg-muted p-4 text-center text-sm text-muted-foreground">
                  O contato desta empresa ainda não está disponível.
                </p>
              )}
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Confirme disponibilidade e condições direto com a empresa.
              </p>
            </div>

            {!whatsapp && (
              <p className="mt-6 rounded-xl bg-muted p-4 text-center text-sm text-muted-foreground md:hidden">
                O contato desta empresa ainda não está disponível.
              </p>
            )}
          </div>
        </div>
      </article>

      <Faixa
        titulo={`Mais ofertas de ${promocao.empresa_nome}`}
        ofertas={maisDaLoja}
        origem="produto_loja"
      />
      <Faixa
        titulo="Outras ofertas perto de você"
        ofertas={outrasPerto}
        origem="produto_outras"
      />

      <Link
        to="/promocoes"
        className="mt-6 block rounded-xl border border-dashed py-3 text-center text-sm font-semibold hover:bg-muted/50"
      >
        Ver todas as promoções
      </Link>

      {/* Barra fixa no celular */}
      {whatsapp && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            {precoAtual && (
              <div className="min-w-0">
                <p className="text-lg font-extrabold leading-none text-orange-700 dark:text-orange-400">
                  {precoAtual}
                </p>
                {desconto && (
                  <p className="mt-1 text-xs font-bold text-red-600">
                    -{desconto.percentual}%
                  </p>
                )}
              </div>
            )}
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={registrarWhatsApp}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3.5 font-bold text-white transition hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              <MessageCircle size={20} /> Pedir pelo WhatsApp
            </a>
          </div>
        </div>
      )}
    </main>
  );
}