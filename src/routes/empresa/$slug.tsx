import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { ChevronLeft, MapPin, Clock, MessageCircle, SquarePen } from "lucide-react";
import { listEmpresasPublicas, getConfigsEmpresas } from "@/lib/admin-server";
import { getHorarios, isStoreOpenNow } from "@/lib/admin-store";
import { labelsCategoriasNegocio, CATEGORIAS_NEGOCIO } from "@/lib/categorias-negocio";

// Página própria de cada empresa — o novo destino de todo card do
// diretório da home (antes ia direto pro WhatsApp/site externo, ou direto
// pro cardápio completo). Fluxo novo: diretório → esta página → WhatsApp
// (sempre) e, quando a empresa tiver catálogo Trapeza de verdade, também
// um CTA "Ver cardápio" pra continuar até /s/$slug.
//
// Não criamos endpoint novo pra isso: reaproveita listEmpresasPublicas
// (a mesma lista que a home já carrega) filtrando pelo slug, e
// getConfigsEmpresas (já usado pro selo Aberto/Fechado) pro horário.
export const Route = createFileRoute("/empresa/$slug")({
  component: PaginaEmpresa,
});

function PaginaEmpresa() {
  const { slug } = Route.useParams();

  const { data: empresas = [], isLoading } = useQuery({
    queryKey: ["empresas-publicas"],
    queryFn: () => listEmpresasPublicas({ data: {} as Record<string, never> }),
    staleTime: 30_000,
  });

  const empresa = useMemo(() => empresas.find((e) => e.slug === slug), [empresas, slug]);

  const { data: configs } = useQuery({
    queryKey: ["config-empresa-perfil", empresa?.id],
    queryFn: () => getConfigsEmpresas({ data: { empresaIds: [empresa!.id] } }),
    enabled: !!empresa,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (empresa) document.title = `${empresa.nome} · Trapeza`;
  }, [empresa]);

  if (isLoading) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Carregando...</p>;
  }

  if (!empresa) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">Empresa não encontrada.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold underline">
          Voltar pra home
        </Link>
      </div>
    );
  }

  const cfg = configs?.[empresa.id];
  const horarios = cfg ? getHorarios(cfg) : null;
  const aberto = horarios ? isStoreOpenNow(horarios) : undefined;

  const temCatalogo = empresa.tipo === "trapeza";
  const categoriasLabel = labelsCategoriasNegocio(empresa.categorias).join(" / ");
  const imagemCategoria = CATEGORIAS_NEGOCIO.find((c) => c.valor === empresa.categorias?.[0])
    ?.imagem_url;
  const numeroWhats = (empresa.whatsapp ?? "").replace(/\D/g, "");
  const linkWhats = numeroWhats
    ? `https://wa.me/${numeroWhats}?text=${encodeURIComponent(
        `Olá! Vi a ${empresa.nome} no Trapeza e queria falar com vocês.`,
      )}`
    : null;

     const linkWhatsTrapeza = numeroWhats
    ? `https://wa.me/5573999916255?text=${encodeURIComponent(
        `Olá! Sou a ${empresa.nome} e gostaria de Reinvidicar a minha empresa.`,
      )}`
    : null;

  const enderecoCompleto = [empresa.endereco, empresa.bairro, empresa.cidade]
    .filter(Boolean)
    .join(", ");
  const mapaSrc = enderecoCompleto
    ? `https://www.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}&output=embed`
    : null;
  const mapaLink = enderecoCompleto
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`
    : null;

  return (
    <div className="trapeza-home min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link
            to="/"
            aria-label="Voltar"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <h1 className="truncate font-display text-base font-bold">{empresa.nome}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-4">
        {/* capa + logo */}
        <div className="overflow-hidden rounded-3xl bg-muted">
          <div className="aspect-[16/7] w-full overflow-hidden bg-muted">
            {empresa.capa_url ? (
              <img src={empresa.capa_url} alt="" className="h-full w-full object-cover" />
            ) : (
              
                  <div className="flex flex-col h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 text-3xl">
       <h1>{empresa.nome.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(palavra => palavra[0])
    .join("")
    .toUpperCase()}</h1>
    <p className="text-[8px]">{empresa.nome}</p>
    </div>

            )}
          </div>
        </div>

        <div className="-mt-8 flex items-end gap-3 px-2">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-background bg-white shadow-md">
            {empresa.logo_url ? (
              <img src={empresa.logo_url} alt={empresa.nome} className="h-full w-full object-cover" />
            ) : (
                  <div className="flex flex-col h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 text-3xl">
       <h1>{empresa.nome.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(palavra => palavra[0])
    .join("")
    .toUpperCase()}</h1>
    </div>
             )}
          </div>
          {aberto !== undefined && (
            <span
              className={
                "mb-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white " +
                (aberto ? "bg-emerald-500" : "bg-neutral-700")
              }
            >
              {aberto ? "Aberto agora" : "Fechado"}
            </span>
          )}
        </div>

        <div className="mt-3 px-2">
          <h2 className="font-display text-xl font-bold">{empresa.nome}</h2>
          {categoriasLabel && (
            <p className="text-sm text-muted-foreground">{categoriasLabel}</p>
          )}
          {empresa.descricao && (
            <p className="mt-2 text-sm text-muted-foreground">{empresa.descricao}</p>
          )}
        </div>

        {/* CTAs principais */}
        <div className="mt-4 flex flex-col gap-2 px-2 sm:flex-row">
          {linkWhats && (
            <a
              href={linkWhats}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-bold text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Chamar no WhatsApp
            </a>
          )}
          {temCatalogo == true ? (
            <Link
              to="/s/$slug"
              params={{ slug: empresa.slug }}
              className="flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-white"
              style={{ backgroundColor: "var(--tp-orange, #c65d3a)" }}
            >
              Ver cardápio
            </Link>
          ) : (
            <a
              href={linkWhatsTrapeza ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--tp-orange)] px-4 py-3 text-sm font-bold text-white"
            > <SquarePen />
              É o dono? Reivindique este perfil
            </a>
            )}
          {!linkWhats && !temCatalogo && empresa.url_externa && (
            <a
              href={empresa.url_externa}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-bold text-background"
            >
              Visitar site
            </a>
          )}
          
        </div>

        {/* horário */}
        {horarios && (
          <div className="mt-6 rounded-2xl border border-border/60 p-4">
            <div className="mb-2 flex items-center gap-2 font-display text-sm font-bold">
              <Clock className="h-4 w-4" />
              Horário de funcionamento
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              {horarios.map((h) => (
                <div key={h.day} className="flex justify-between">
                  <span>{h.label}</span>
                  <span>{h.closed ? "Fechado" : `${h.open} às ${h.close}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* endereço + mapa */}
        {enderecoCompleto.length > 20 ? (
          <div className="mt-4 rounded-2xl border border-border/60 p-4">
            <div className="mb-2 flex items-center gap-2 font-display text-sm font-bold">
              <MapPin className="h-4 w-4" />
              Endereço
            </div>
            <p className="text-sm text-muted-foreground">{enderecoCompleto}</p>
            {mapaSrc && (
              <div className="mt-3 overflow-hidden rounded-xl">
                <iframe
                  src={mapaSrc}
                  className="h-48 w-full border-0"
                  loading="lazy"
                  title={`Mapa - ${empresa.nome}`}
                />
              </div>
            )}
            {mapaLink && (
              <a
                href={mapaLink}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs font-semibold underline"
              >
                Abrir no Google Maps
              </a>
            )}
          </div>
        ): (
          <div>
             
          </div>
        )}
      </main>
    </div>
  );
}
