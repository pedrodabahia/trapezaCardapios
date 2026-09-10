import { Link } from "@tanstack/react-router";
import { Menu, MapPin, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const TODAS_CIDADES = "__todas__";

// Header compacto de app: logo + localização atual (clicável, troca a
// cidade) + menu. Nada de hero gigante aqui — só o essencial pra orientar
// o usuário rápido.
export function HomeHeader({
  cidades,
  cidadeFiltro,
  onChangeCidade,
}: {
  cidades: string[];
  cidadeFiltro: string;
  onChangeCidade: (v: string) => void;
}) {
  const cidadeAtual = cidadeFiltro !== TODAS_CIDADES ? cidadeFiltro : "Todas as cidades";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
        <Link to="/" className="font-display text-lg font-bold tracking-tight text-brand-brown">
          TRAPEZA
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex min-w-0 items-center gap-1 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-red" />
              <span className="truncate">{cidadeAtual}</span>
              <ChevronDown className="h-3 w-3 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60"
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
      </div>
    </header>
  );
}
