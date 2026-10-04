
import { Link , useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import trapezaimg from "../../../public/icons/logo.svg";
import { labelsCategoriasNegocio } from "@/lib/categorias-negocio";
import { brl } from "@/lib/format";
import type { EmpresaCard } from "./BusinessCard";
import type { ProdutoBuscaGlobal } from "@/lib/admin-server";

export const TODAS_CIDADES = "__todas__";

// Bloco único: topo + busca + headline + CTA.
// Utiliza o gradiente próprio da home da plataforma.
export function HomeHero({
  cidades,
  cidadeFiltro,
  onChangeCidade,
  busca,
  onBuscaChange,
  resultadosBusca,
  resultadosProdutos,
  totalLojas,
  onExplorar,
}: {
  cidades: string[];
  cidadeFiltro: string;
  onChangeCidade: (v: string) => void;
  busca: string;
  onBuscaChange: (v: string) => void;
  resultadosBusca: EmpresaCard[];
  resultadosProdutos: ProdutoBuscaGlobal[];
  totalLojas: number;
  onExplorar: () => void;
}) {
  const cidadeAtual =
    cidadeFiltro !== TODAS_CIDADES
      ? cidadeFiltro
      : "Todas as cidades";

      const navigate = useNavigate();

      const realizarBusca = () => {
  const termo = busca.trim();

  if (!termo) return;

  navigate({
    to: "/b/buscar",
    search: { q: termo },
  });
};

  return (
    <section className="trapeza-hero-gradient relative overflow-visible text-white">
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-8 pt-3">

        {/* topo: logo */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="font-display flex items-center text-lg tracking-tight"
          >
            <img
              className="mr-2 w-10"
              src={trapezaimg}
              alt="Trapeza"
            />

            <div>
              <h1 className="font-bold -mb-[2px]">TRAPEZA</h1>
              <p className="ml-[2px] text-[10px] font-regular">
                Tudo perto de você
              </p>
            </div>
          </Link>
        </div>

        {/* busca */}
        <div id="busca" className="relative mt-3">
<form
  onSubmit={(e) => {
    e.preventDefault();
    realizarBusca();
  }}
  className="flex gap-2"
>
  <Input
    value={busca}
    onChange={(e) => onBuscaChange(e.target.value)}
    placeholder="Buscar empresas ou produtos..."
    className="flex-1"
  />

  <button
    type="submit"
    aria-label="Pesquisar"
    className="rounded-lg bg-primary px-4 text-primary-foreground"
  >
    <Search size={20} />
  </button>
</form>

          {/* Resultados da busca */}
          {busca.trim() && (
            <div className="absolute inset-x-0 top-full z-30 mt-2 max-h-96 overflow-y-auto rounded-2xl bg-white text-left text-foreground shadow-xl">

              {resultadosBusca.length === 0 &&
              resultadosProdutos.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">
                  Nenhum resultado pra "{busca}".
                </p>
              ) : (
                <>
                  {/* Empresas */}
                  {resultadosBusca.length > 0 && (
                    <div>
                      <p className="px-3 pt-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        Empresas
                      </p>

                      {resultadosBusca.map((e) => {
                        const ehExterna = e.tipo === "externa";

                        const linhaInfo = [
                          labelsCategoriasNegocio(e.categorias).join(" / "),
                          e.cidade,
                        ]
                          .filter(Boolean)
                          .join(" • ");

                        const conteudo = (
                          <div className="flex items-center gap-3 border-b border-border/50 p-3 last:border-0 hover:bg-muted">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                              {e.logo_url && (
                                <img
                                  src={e.logo_url}
                                  alt={e.nome}
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {e.nome}
                              </p>

                              {linhaInfo && (
                                <p className="truncate text-xs text-muted-foreground">
                                  {linhaInfo}
                                </p>
                              )}
                            </div>
                          </div>
                        );

                        // Empresas externas continuam abrindo o site externo.
                        if (ehExterna) {
                          return (
                            <a
                              key={e.id}
                              href={e.url_externa ?? "#"}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {conteudo}
                            </a>
                          );
                        }

                        // Empresas internas abrem primeiro o perfil.
                        // O perfil decide se exibe o botão de cardápio.
                        return (
                          <Link
                            key={e.id}
                            to="/empresa/$slug"
                            params={{ slug: e.slug }}
                          >
                            {conteudo}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Produtos */}
                  {resultadosProdutos.length > 0 && (
                    <div>
                      <p className="px-3 pt-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        Produtos
                      </p>

                      {resultadosProdutos.map((p) => (
                        <Link
                          key={p.produtoId}
                          to="/s/$slug/product/$id"
                          params={{
                            slug: p.empresaSlug,
                            id: p.produtoId,
                          }}
                        >
                          <div className="flex items-center gap-3 border-b border-border/50 p-3 last:border-0 hover:bg-muted">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                              {p.imagemUrl && (
                                <img
                                  src={p.imagemUrl}
                                  alt={p.nome}
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">
                                {p.nome}
                              </p>

                              <p className="truncate text-xs text-muted-foreground">
                                Vendido em {p.empresaNome}
                              </p>
                            </div>

                            <span
                              className="shrink-0 text-xs font-bold"
                              style={{ color: "var(--tp-orange)" }}
                            >
                              {brl(p.precoAtual)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* headline + ilustração */}
        <div className="mt-6 flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
              Tudo que você precisa está{" "}
              <span style={{ color: "var(--tp-orange)" }}>
                aqui perto!
              </span>
            </h1>

            <p className="mt-2 text-sm text-white/80">
              Lojas, produtos e serviços da sua cidade — encontre e compre agora.
            </p>
          </div>

          <div className="hidden shrink-0 sm:block">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 text-5xl backdrop-blur">
              🛍️
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
