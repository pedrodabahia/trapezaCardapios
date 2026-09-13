import { Link } from "@tanstack/react-router";
import { Search, MapPin, ChevronDown, Menu, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import trapezaimg from "../../../public/logo.svg";
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
  totalLojas,
  onExplorar,
}: {
  cidades: string[];
  cidadeFiltro: string;
  onChangeCidade: (v: string) => void;
  busca: string;
  onBuscaChange: (v: string) => void;
  totalLojas: number;
  onExplorar: () => void;
}) {
  const cidadeAtual = cidadeFiltro !== TODAS_CIDADES ? cidadeFiltro : "Todas as cidades";

  return (
    <section className="trapeza-hero-gradient relative overflow-hidden text-white">
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
