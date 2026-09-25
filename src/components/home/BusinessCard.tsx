import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { labelsCategoriasNegocio } from "@/lib/categorias-negocio";
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
  | "categorias"
  | "cidade"
  | "tipo"
  | "url_externa"
  | "destaque"
>;

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

  const indice = Math.abs(hash) % fundosFallback.length;

  return fundosFallback[indice];
}

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
  // Card compacto: mostra no máximo 2 categorias (área pequena demais
  // pra listar todas se a empresa marcou várias).
  const categoriaLabel = labelsCategoriasNegocio(empresa.categorias).slice(0, 2).join(" / ");
  const ehExterna = empresa.tipo === "externa";

  const imagem = empresa.logo_url ? (
    <img
      src={empresa.logo_url}
      alt={empresa.nome}
      className="h-full w-full object-cover transition group-hover:scale-105"
    />
  ) : (
<div
  className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${getFundoFallback(empresa.nome)} text-3xl text-white`}
>

  {/* iniciais */}
  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
    <span className="text-2xl font-bold tracking-tight">
      {empresa.nome
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((palavra) => palavra[0])
        .join("")
        .toUpperCase()}
    </span>
  </div>

  {/* nome */}
  <p className="relative mt-3 max-w-[85%] truncate text-center text-xs font-semibold">
    {empresa.nome}
  </p>
</div>
  );

  const conteudo =
    variant === "row" ? (
      <Card className={cardClass(destaque, className)}>
        <CardContent className="flex items-center gap-3 p-2.5">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-muted">{imagem}</div>
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
            className="inline-block rounded px-2.5 py-1 text-[11px] font-bold text-white"
            style={{ backgroundColor: "var(--tp-orange, #c65d3a)" }}
          >
            Ver empresa →
          </span>
        </CardContent>
      </Card>
    );

  // Todo card agora abre a página de perfil da empresa dentro do Trapeza
  // primeiro (/empresa/$slug) — de lá o cliente segue pro WhatsApp, ou
  // pro cardápio completo quando a empresa tiver (ver página de perfil).
  // Antes, empresa externa ia direto pro link/WhatsApp dela e empresa
  // Trapeza ia direto pro cardápio — isso mudou de propósito.
  return (
    <Link to="/empresa/$slug" params={{ slug: empresa.slug }} className="group block h-full">
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
