import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
  ChevronLeft,
  MapPin,
  Clock,
  MessageCircle,
  SquarePen,
  Globe,
} from "lucide-react";
import {
  listEmpresasPublicas,
  getConfigsEmpresas,
  listPlanos,
} from "@/lib/admin-server";
import { getHorarios, isStoreOpenNow } from "@/lib/admin-store";
import {
  labelsCategoriasNegocio,
  CATEGORIAS_NEGOCIO,
} from "@/lib/categorias-negocio";

// Página própria de cada empresa — destino dos cards do diretório.
export const Route = createFileRoute("/empresa/$slug")({
  component: PaginaEmpresa,
});

const fundosFallback = [
  "from-orange-500 to-amber-400",
  "from-emerald-600 to-teal-400",
  "from-blue-600 to-cyan-400",
  "from-violet-600 to-purple-400",
  "from-rose-500 to-pink-400",
  "from-indigo-600 to-blue-400",
];

function getFundoFallback(nome: string) {
  let hash = 0;

  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }

  return fundosFallback[Math.abs(hash) % fundosFallback.length];
}

function getIniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palavra) => palavra[0])
    .join("")
    .toUpperCase();
}

function EmpresaFallback({
  nome,
  tipo = "capa",
}: {
  nome: string;
  tipo?: "capa" | "logo";
}) {
  const fundo = getFundoFallback(nome);
  const iniciais = getIniciais(nome);

  if (tipo === "logo") {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${fundo} text-white`}
      >
        <span className="text-xl font-bold tracking-tight">
          {iniciais}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br ${fundo} text-white`}
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/10" />

      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
        <span className="text-2xl font-bold tracking-tight">
          {iniciais}
        </span>
      </div>

      <p className="relative mt-3 max-w-[80%] truncate px-2 text-center text-xs font-semibold">
        {nome}
      </p>
    </div>
  );
}

function PaginaEmpresa() {
  const { data: planos = [] } = useQuery({
    queryKey: ["planos"],
    queryFn: () => listPlanos({ data: undefined }),
    staleTime: 5 * 60_000,
  });

  const { slug } = Route.useParams();

  const { data: empresas = [], isLoading } = useQuery({
    queryKey: ["empresas-publicas"],
    queryFn: () =>
      listEmpresasPublicas({
        data: {} as Record<string, never>,
      }),
    staleTime: 30_000,
  });

  const empresa = useMemo(
    () => empresas.find((e) => e.slug === slug),
    [empresas, slug],
  );

  const { data: configs } = useQuery({
    queryKey: ["config-empresa-perfil", empresa?.id],
    queryFn: () =>
      getConfigsEmpresas({
        data: { empresaIds: [empresa!.id] },
      }),
    enabled: !!empresa,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (empresa) {
      document.title = `${empresa.nome} · Trapeza`;
    }
  }, [empresa]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Carregando...
        </p>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Empresa não encontrada.
        </p>

        <Link
          to="/"
          className="mt-4 inline-block text-sm font-semibold underline"
        >
          Voltar pra home
        </Link>
      </div>
    );
  }

  const cfg = configs?.[empresa.id];

  const horarios = cfg
    ? getHorarios(cfg)
    : null;

  const aberto =
    horarios
      ? isStoreOpenNow(horarios)
      : undefined;

  const temCatalogo = empresa.tipo === "trapeza";

  const categoriasLabel =
    labelsCategoriasNegocio(empresa.categorias).join(" / ");

  const numeroWhats =
    (empresa.whatsapp ?? "").replace(/\D/g, "");

  const linkWhats = numeroWhats
    ? `https://wa.me/${numeroWhats}?text=${encodeURIComponent(
        `Olá! Vi a ${empresa.nome} no Trapeza e queria falar com vocês.`,
      )}`
    : null;

  const linkWhatsTrapeza =
    `https://wa.me/5573999916255?text=${encodeURIComponent(
      `Olá! Sou da ${empresa.nome} e gostaria de reivindicar minha empresa no Trapeza.`,
    )}`;

  const enderecoCompleto = [
    empresa.endereco,
    empresa.bairro,
    empresa.cidade,
  ]
    .filter(Boolean)
    .join(", ");

  const temEndereco =
    enderecoCompleto.length > 0;

  const mapaSrc = temEndereco
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        enderecoCompleto,
      )}&output=embed`
    : null;

  const mapaLink = temEndereco
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        enderecoCompleto,
      )}`
    : null;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link
            to="/"
            aria-label="Voltar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background transition hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>

          <h1 className="truncate font-display text-base font-bold">
            {empresa.nome}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4">
        {/* HERO */}
        <section className="pt-4">
          <div className="overflow-hidden rounded-[28px] bg-muted shadow-sm">
            <div className="aspect-[16/7] w-full overflow-hidden">
              {empresa.capa_url ? (
                <img
                  src={empresa.capa_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <EmpresaFallback
                  nome={empresa.nome}
                  tipo="capa"
                />
              )}
            </div>
          </div>

          {/* LOGO */}
          <div className="-mt-9 px-3">
            <div className="flex relative items-end gap-3">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-background bg-background shadow-lg">
                {empresa.logo_url ? (
                  <img
                    src={empresa.logo_url}
                    alt={empresa.nome}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <EmpresaFallback
                    nome={empresa.nome}
                    tipo="logo"
                  />
                )}
              </div>

              {aberto !== undefined && (
                <span
                  className={
                    `mb-1 rounded-full px-3 py-1.5 text-[11px] font-bold text-white shadow-sm ` +
                    (aberto
                      ? "bg-emerald-500"
                      : "bg-neutral-700")
                  }
                >
                  {aberto
                    ? "Aberto agora"
                    : "Fechado"}
                </span>
              )}
            </div>
          </div>

          {/* IDENTIDADE */}
          <div className="mt-4 px-2">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {empresa.nome}
            </h2>

            {categoriasLabel && (
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {categoriasLabel}
              </p>
            )}

            {empresa.descricao && (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {empresa.descricao}
              </p>
            )}
          </div>
        </section>

        {/* AÇÕES */}
        <section className="mt-6 space-y-2 px-2">
          {temCatalogo && (
            <Link
              to="/s/$slug"
              params={{ slug: empresa.slug }}
              className="flex w-full items-center justify-center rounded-2xl px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
              style={{
                backgroundColor:
                  "var(--tp-orange, #c65d3a)",
              }}
            >
              Ver cardápio
            </Link>
          )}

          {linkWhats && (
            <a
              href={linkWhats}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" />
              Chamar no WhatsApp
            </a>
          )}

          {!temCatalogo && !linkWhats && (
            <a
              href={linkWhatsTrapeza}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--tp-orange)] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
            >
              <SquarePen className="h-4 w-4" />
              É o dono? Reivindique este perfil
            </a>
          )}

          {!linkWhats &&
            !temCatalogo &&
            empresa.url_externa && (
              <a
                href={empresa.url_externa}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3.5 text-sm font-bold text-background transition hover:opacity-90"
              >
                <Globe className="h-4 w-4" />
                Visitar site
              </a>
            )}

          {temCatalogo && (
            <div className="pt-1 text-center">
              <a
                href={linkWhats ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-muted-foreground underline underline-offset-4"
              >
                Falar diretamente pelo WhatsApp
              </a>
            </div>
          )}
        </section>

        {/* HORÁRIO */}
        {horarios && horarios.length > 0 && (
          <section className="mt-8 border-t border-border/60 px-2 pt-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                <Clock className="h-4 w-4" />
              </div>

              <div>
                <h3 className="font-display text-sm font-bold">
                  Horário de funcionamento
                </h3>

                {aberto !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    {aberto
                      ? "Aberto agora"
                      : "Fechado no momento"}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 rounded-2xl bg-muted/50 p-4">
              {horarios.map((h) => (
                <div
                  key={h.day}
                  className="flex justify-between gap-4 text-sm"
                >
                  <span className="text-muted-foreground">
                    {h.label}
                  </span>

                  <span className="font-medium">
                    {h.closed
                      ? "Fechado"
                      : `${h.open} às ${h.close}`}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LOCALIZAÇÃO */}
        {temEndereco && (
          <section className="mt-8 border-t border-border/60 px-2 pt-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                <MapPin className="h-4 w-4" />
              </div>

              <div>
                <h3 className="font-display text-sm font-bold">
                  Onde encontrar
                </h3>

                <p className="text-xs text-muted-foreground">
                  Localização da empresa
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-muted">
              {mapaSrc && (
                <iframe
                  src={mapaSrc}
                  className="h-52 w-full border-0"
                  loading="lazy"
                  title={`Mapa - ${empresa.nome}`}
                />
              )}
            </div>

            <p className="mt-3 text-sm leading-5 text-muted-foreground">
              {enderecoCompleto}
            </p>

            {mapaLink && (
              <a
                href={mapaLink}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-xs font-bold underline underline-offset-4"
              >
                Abrir no Google Maps
              </a>
            )}
          </section>
        )}

        {/* SITE */}
        {empresa.url_externa && (
          <section className="mt-8 border-t border-border/60 px-2 pt-6">
            <a
              href={empresa.url_externa}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-border/60 p-4 transition hover:bg-muted"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <Globe className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold">
                  Site da empresa
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  Visitar site externo
                </p>
              </div>
            </a>
          </section>
        )}

        {/* REIVINDICAÇÃO */}
        {!temCatalogo && (
          <section className="mt-8 px-2">
            <div className="rounded-2xl bg-muted/60 p-5 text-center">
              <p className="text-sm font-bold">
                Essa empresa é sua?
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Reivindique este perfil para atualizar
                as informações da sua empresa no Trapeza.
              </p>

              <a
                href={linkWhatsTrapeza}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-700 px-5 py-2.5 text-xs font-bold text-white"
              >
                <SquarePen className="h-3.5 w-3.5" />
                Reivindicar perfil
              </a>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}