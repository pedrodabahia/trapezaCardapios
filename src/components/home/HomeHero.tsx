import { Link } from "@tanstack/react-router";
import { Search, MapPin, ChevronDown, Menu, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import trapezaimg from "../../../public/logo.svg";
import { labelsCategoriasNegocio } from "@/lib/categorias-negocio";
import { brl } from "@/lib/format";
import type { EmpresaCard } from "./BusinessCard";
import type { ProdutoBuscaGlobal } from "@/lib/admin-server";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const TODAS_CIDADES = "__todas__";

// Bloco único: topo (logo + menu) + localização + busca + headline + CTA
// + estatísticas reais. Tudo dentro do gradiente marrom/laranja próprio
// da home da plataforma (ver .trapeza-home / trapeza-hero-gradient em
// styles.css) — não usa as cores customizáveis por empresa porque essa
// tela não pertence a nenhuma empresa.
//
// Não tem sino de notificação (não existe sistema de notificação) nem
// avaliação nas estatísticas (não existe sistema de avaliação/nota) —
// removidos de propósito em vez de inventar número. "Lojas" é a
// contagem real de empresas ativas carregadas.
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
  const cidadeAtual = cidadeFiltro !== TODAS_CIDADES ? cidadeFiltro : "Todas as cidades";

  return (
    <section className="trapeza-hero-gradient relative overflow-visible text-white">
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-8 pt-3">
        {/* topo: logo + menu */}
        <div className="flex items-center justify-between">
          <Link to="/" className="font-display flex items-center text-lg tracking-tight">
          <img className="w-10 mr-2" src={trapezaimg} />
            <div>
              <h1 className="font-bold -mb-[2px]">TRAPEZA</h1>
              <p className="text-[10px] ml-[2px] font-regular">Tudo perto de você</p>
            </div>
          </Link>
  
  {/*
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Menu"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"
              >
                <Menu className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/painel/login">Painel da minha empresa</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/plataforma/login">Área da plataforma</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
*/}

        </div>

        {/* localização */}
  
{/*
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="mt-3 flex items-center gap-1 text-xs font-semibold text-white/85">
              <MapPin className="h-3.5 w-3.5" />
              {cidadeAtual}
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onChangeCidade(TODAS_CIDADES)}>
              Todas as cidades
            </DropdownMenuItem>
            {cidades.map((c) => (
              <DropdownMenuItem key={c} onClick={() => onChangeCidade(c)}>
                {c}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
*/}


        {/* busca */}
        <div id="busca" className="relative mt-3">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            placeholder="O que você está procurando?"
            className="h-11 rounded-2xl border-0 bg-white pl-10 text-sm text-foreground shadow-md"
          />

          {/* Resultado da busca tipo Google: lista suspensa embaixo do
              campo, sem filtrar mais nada da página — só aparece
              enquanto tiver texto digitado. Duas seções: empresas (nome/
              categoria/tipo/cidade) e produtos ("digitei 'skol', onde
              vende?" — mostra o produto e em qual empresa ele está). */}
          {busca.trim() && (
            <div className="absolute inset-x-0 top-full z-30 mt-2 max-h-96 overflow-y-auto rounded-2xl bg-white text-left text-foreground shadow-xl">
              {resultadosBusca.length === 0 && resultadosProdutos.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">
                  Nenhum resultado pra "{busca}".
                </p>
              ) : (
                <>
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
                              <p className="truncate text-sm font-semibold">{e.nome}</p>
                              {linhaInfo && (
                                <p className="truncate text-xs text-muted-foreground">{linhaInfo}</p>
                              )}
                            </div>
                          </div>
                        );
                        return ehExterna ? (
                          <a key={e.id} href={e.url_externa ?? "#"} target="_blank" rel="noreferrer">
                            {conteudo}
                          </a>
                        ) : (
                          <Link key={e.id} to="/s/$slug" params={{ slug: e.slug }}>
                            {conteudo}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {resultadosProdutos.length > 0 && (
                    <div>
                      <p className="px-3 pt-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        Produtos
                      </p>
                      {resultadosProdutos.map((p) => (
                        <Link
                          key={p.produtoId}
                          to="/s/$slug/product/$id"
                          params={{ slug: p.empresaSlug, id: p.produtoId }}
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
                              <p className="truncate text-sm font-semibold">{p.nome}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                Vendido em {p.empresaNome}
                              </p>
                            </div>
                            <span className="shrink-0 text-xs font-bold" style={{ color: "var(--tp-orange)" }}>
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

        {/* headline + CTA + ilustração */}
        <div className="mt-6 flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
              Tudo que você precisa está{" "}
              <span style={{ color: "var(--tp-orange)" }}>aqui perto!</span>
            </h1>
            <p className="mt-2 text-sm text-white/80">
              Lojas, produtos e serviços da sua cidade — encontre e compre agora.
            </p>
          </div>

          {/* Ilustração simples (formas/emoji) no lugar do mascote do
              print — não reproduzo personagens ilustrados à mão. */}
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
