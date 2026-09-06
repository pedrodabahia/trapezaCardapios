import { Link } from "@tanstack/react-router";
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
}: {
  empresa: EmpresaCard;
  destaque?: boolean;
}) {
  const categoriaLabel = labelCategoriaNegocio(empresa.categoria);
  const ehExterna = empresa.tipo === "externa";

  const conteudo = (
    <Card
      className={
        "h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-lg " +
        (destaque ? "border-brand-red/30" : "")
      }
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {empresa.logo_url ? (
          <img
            src={empresa.logo_url}
            alt={empresa.nome}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-yellow/30 to-brand-red/20 text-5xl">
            ...
          </div>
        )}
      </div>
      <CardContent className="space-y-2 p-4">
        <h3 className="font-display text-lg font-semibold leading-tight">{empresa.nome}</h3>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {categoriaLabel && (
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
              {categoriaLabel}
            </span>
          )}
          {empresa.cidade && <span>{empresa.cidade}</span>}
        </div>
        {empresa.endereco && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{empresa.endereco}</p>
        )}
        <div className="pt-1">
          <span className="rounded-full bg-brand-red px-3 py-1 text-xs font-bold text-white">
            {ehExterna ? "Visitar site →" : "Ver loja →"}
          </span>
        </div>
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
