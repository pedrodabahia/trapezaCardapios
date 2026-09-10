import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { labelCategoriaNegocio } from "@/lib/categorias-negocio";
import type { Empresa } from "@/lib/admin-server";

// listEmpresasPublicas devolve só um subconjunto de campos da empresa (não
// tem pix_chave, plano_id etc) — tipamos pelo que o card realmente usa.
export type EmpresaCard = Pick<
  Empresa,
  | "id"
  | "slug"
  | "nome"
  | "logo_url"
  | "endereco"
  | "categoria"
  | "cidade"
  | "tipo"
  | "url_externa"
  | "destaque"
>;

export function BusinessCard({
  empresa,
  destaque = false,
  variant = "grid",
  className,
}: {
  empresa: EmpresaCard;
  destaque?: boolean;
  // "grid": card vertical (imagem em cima, texto embaixo) — usado nas
  // seções em grade. "row": card compacto horizontal (imagem pequena à
  // esquerda, texto à direita) — usado em "Perto de você" e "Explore
  // lojas".
  variant?: "grid" | "row";
  className?: string;
}) {
  const categoriaLabel = labelCategoriaNegocio(empresa.categoria);
  const ehExterna = empresa.tipo === "externa";

  const imagem = empresa.logo_url ? (
    <img
      src={empresa.logo_url}
      alt={empresa.nome}
      className="h-full w-full object-cover transition group-hover:scale-105"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 text-3xl">
      
    </div>
  );

  const conteudo =
    variant === "row" ? (
      <Card className={cardClass(destaque, className)}>
        <CardContent className="flex items-center gap-3 p-2.5">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">{imagem}</div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-sm font-semibold leading-tight">
              {empresa.nome}
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              {[categoriaLabel, empresa.cidade].filter(Boolean).join(" • ")}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    ) : (
      <Card className={cardClass(destaque, className)}>
        <div className="aspect-[4/3] overflow-hidden bg-muted">{imagem}</div>
        <CardContent className="space-y-1.5 p-3">
          <h3 className="truncate font-display text-sm font-semibold leading-tight">
            {empresa.nome}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {[categoriaLabel, empresa.cidade].filter(Boolean).join(" • ")}
          </p>
          <span
            className="inline-block rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
            style={{ backgroundColor: "var(--tp-orange, #c65d3a)" }}
          >
            {ehExterna ? "Visitar site →" : "Ver loja →"}
          </span>
        </CardContent>
      </Card>
    );

  // Empresa externa aponta pra fora do Trapeza; empresa Trapeza abre a
  // página interna /s/slug.
  if (ehExterna) {
    return (
      <a
        href={empresa.url_externa ?? "#"}
        target="_blank"
        rel="noreferrer"
        className="group block h-full"
      >
        {conteudo}
      </a>
    );
  }

  return (
    <Link to="/s/$slug" params={{ slug: empresa.slug }} className="group block h-full">
      {conteudo}
    </Link>
  );
}

function cardClass(destaque: boolean, className?: string) {
  return (
    "h-full overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md " +
    (destaque ? "ring-1 ring-orange-300 " : "") +
    (className ?? "")
  );
}
