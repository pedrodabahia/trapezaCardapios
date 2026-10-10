
import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, MessageCircle, Tag } from "lucide-react";

import { listEmpresasPublicas } from "@/lib/admin-server";
import {
  trackPromotionView,
  trackPromotionWhatsAppClick,
} from "@/lib/analytics";
import { listarPromocoesPorEmpresa } from "@/modules/promocoes/controllers/promocao.controller";
import type { PromocaoPublica } from "@/modules/promocoes/types/promocao.types";

export const Route = createFileRoute("/promocoes/empresa/$slug")({
  component: PaginaPromocoesEmpresa,
});

function formatarPreco(valor: number | null | undefined) {
  if (valor == null) return null;

  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function linkWhatsApp(numero: string | null, titulo: string) {
  if (!numero) return null;

  const telefone = numero.replace(/\D/g, "");
  if (!telefone) return null;

  const mensagem = encodeURIComponent(
    `Olá! Vi a promoção "${titulo}" no Trapeza e gostaria de saber mais.`,
  );

  return `https://wa.me/${telefone}?text=${mensagem}`;
}

function CardPromocao({
  promocao,
}: {
  promocao: PromocaoPublica;
}) {
  const precoAnterior = formatarPreco(promocao.preco_anterior);
  const precoAtual = formatarPreco(promocao.preco_promocional);

  const whatsapp = linkWhatsApp(
    promocao.empresa_whatsapp,
    promocao.titulo,
  );

  useEffect(() => {
    void trackPromotionView(promocao.id, promocao.empresa_id);
  }, [promocao.id, promocao.empresa_id]);

  function registrarCliqueWhatsApp() {
    void trackPromotionWhatsAppClick(
      promocao.id,
      promocao.empresa_id,
    );
  }

  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      <div className="aspect-[4/3] bg-gray-100">
        {promocao.imagem_url ? (
          <img
            src={promocao.imagem_url}
            alt={promocao.titulo}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <Tag size={36} />
          </div>
        )}
      </div>

      <div className="space-y-2 p-4">
        {promocao.destaque && (
          <span className="inline-block rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
            Oferta em destaque
          </span>
        )}

        <h2 className="line-clamp-2 font-semibold text-gray-900">
          {promocao.titulo}
        </h2>

        {promocao.descricao && (
          <p className="line-clamp-3 text-sm text-gray-600">
            {promocao.descricao}
          </p>
        )}

        {precoAtual && (
          <p className="text-xl font-bold text-green-700">
            {precoAtual}
          </p>
        )}

        {precoAnterior && (
          <p className="text-sm text-gray-500 line-through">
            {precoAnterior}
          </p>
        )}

        {promocao.fim_em && (
          <p className="text-xs text-gray-500">
            Válida até{" "}
            {new Date(promocao.fim_em).toLocaleDateString("pt-BR")}
          </p>
        )}
      </div>

      {whatsapp && (
        <div className="px-4 pb-4">
          <a
            href={whatsapp}
            onClick={registrarCliqueWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            <MessageCircle size={18} />
            Consultar oferta
          </a>
        </div>
      )}
    </article>
  );
}

function PaginaPromocoesEmpresa() {
  const { slug } = Route.useParams();

  const {
    data: empresas = [],
    isLoading: carregandoEmpresas,
    isError: erroEmpresas,
  } = useQuery({
    queryKey: ["empresas-publicas"],
    queryFn: () => listEmpresasPublicas(),
  });

  const empresa = empresas.find((item) => item.slug === slug);

  const {
    data: promocoes = [],
    isLoading: carregandoPromocoes,
    isError: erroPromocoes,
  } = useQuery({
    queryKey: ["promocoes-empresa", empresa?.id],
    queryFn: () =>
      listarPromocoesPorEmpresa({
        data: { empresaId: empresa!.id },
      }),
    enabled: Boolean(empresa?.id),
    staleTime: 30_000,
  });

  if (carregandoEmpresas) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-gray-500">Carregando empresa...</p>
      </main>
    );
  }

  if (erroEmpresas) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-xl font-bold">
          Não foi possível carregar a empresa
        </h1>

        <p className="mt-2 text-gray-600">
          Tente novamente em alguns instantes.
        </p>

        <Link to="/" className="mt-4 inline-block underline">
          Voltar ao guia comercial
        </Link>
      </main>
    );
  }

  if (!empresa) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-xl font-bold">
          Empresa não encontrada
        </h1>

        <p className="mt-2 text-gray-600">
          Não encontramos uma empresa com esse endereço.
        </p>

        <Link to="/" className="mt-4 inline-block underline">
          Voltar ao guia comercial
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-900"
      >
        <ArrowLeft size={18} />
        Voltar ao guia comercial
      </Link>

      <header className="mb-8 overflow-hidden rounded-2xl border bg-white">
        {empresa.capa_url && (
          <div className="h-40 bg-gray-100 sm:h-56">
            <img
              src={empresa.capa_url}
              alt={`Capa de ${empresa.nome}`}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          {empresa.logo_url && (
            <img
              src={empresa.logo_url}
              alt={`Logo de ${empresa.nome}`}
              className="h-20 w-20 rounded-xl border bg-white object-contain p-1"
            />
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Promoções de {empresa.nome}
            </h1>

            {(empresa.cidade || empresa.bairro) && (
              <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                <MapPin size={16} />
                {[empresa.bairro, empresa.cidade]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}

            {empresa.descricao && (
              <p className="mt-3 text-gray-600">
                {empresa.descricao}
              </p>
            )}
          </div>
        </div>
      </header>

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">
            Ofertas disponíveis
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Confira as promoções publicadas por esta empresa.
          </p>
        </div>

        {carregandoPromocoes ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">Carregando ofertas...</p>
          </div>
        ) : erroPromocoes ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-700">
              Não foi possível carregar as promoções.
            </p>
            <p className="mt-1 text-sm text-red-600">
              Tente novamente em alguns instantes.
            </p>
          </div>
        ) : promocoes.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center">
            <Tag className="mx-auto mb-3 text-gray-400" size={32} />

            <h3 className="font-semibold text-gray-900">
              Nenhuma oferta disponível
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Esta empresa ainda não tem promoções ativas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {promocoes.map((promocao) => (
              <CardPromocao
                key={promocao.id}
                promocao={promocao}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}