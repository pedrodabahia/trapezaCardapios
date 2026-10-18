import { Link } from "@tanstack/react-router";
import { Tag } from "lucide-react";
import { trackPromotionCardClick } from "@/lib/analytics";
import {
  calcularDesconto,
  formatarPreco,
  getUrgencia,
  registrarEvento,
  tituloCurto,
} from "@/modules/promocoes/utils/promocao-utils";

// Tipo mínimo: aceita PromocaoPublica e o retorno de listarPromocoes.
export interface PromoCardData {
  id: string;
  slug: string;
  titulo: string;
  imagem_url?: string | null;
  empresa_id?: string;
  empresa_nome?: string | null;
  preco_promocional?: number | null;
  preco_anterior?: number | null;
  fim_em?: string | null;
}

interface Props {
  promocao: PromoCardData;
  modo?: "grade" | "carrossel";
  /** Onde o card está: "home", "lista", "produto_loja", "produto_outras"... */
  origem: string;
}

export function PromoCard({ promocao, modo = "grade", origem }: Props) {
  const desconto = calcularDesconto(
    promocao.preco_promocional,
    promocao.preco_anterior,
  );
  const urgencia = getUrgencia(promocao.fim_em);
  const precoAtual = formatarPreco(promocao.preco_promocional);
  const precoAnterior = formatarPreco(promocao.preco_anterior);

  const largura =
    modo === "carrossel"
      ? "w-[170px] sm:w-[210px] md:w-[230px] snap-start"
      : "w-full min-w-0";

  return (
    <Link
      to="/promocoes/$slug"
      params={{ slug: promocao.slug }}
      onClick={() => {
        void trackPromotionCardClick(promocao.id, promocao.empresa_id);
        registrarEvento("promo_card_click", {
          promo_id: promocao.id,
          empresa_id: promocao.empresa_id,
          origem,
        });
      }}
      className={`group flex ${largura} shrink-0 flex-col overflow-hidden rounded-xl border bg-card transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {promocao.imagem_url ? (
          <img
            src={promocao.imagem_url}
            alt={promocao.titulo}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Tag size={34} className="text-muted-foreground" />
          </div>
        )}

        {desconto && (
          <span className="absolute left-2 top-2 rounded-lg bg-red-600 px-2 py-1 text-sm font-extrabold text-white shadow">
            -{desconto.percentual}%
          </span>
        )}

        {urgencia && (
          <span className="absolute bottom-2 left-2 rounded-md bg-amber-300 px-2 py-0.5 text-[11px] font-bold text-black">
            {urgencia}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5">
          {tituloCurto(promocao.titulo)}
        </h3>

        {promocao.empresa_nome && (
          <p className="truncate text-xs text-muted-foreground">
            {promocao.empresa_nome}
          </p>
        )}

        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          {precoAtual && (
            <span className="text-xl font-extrabold text-orange-700 dark:text-orange-400">
              {precoAtual}
            </span>
          )}
          {precoAnterior && desconto && (
            <span className="text-xs text-muted-foreground line-through">
              {precoAnterior}
            </span>
          )}
        </div>

        {desconto && (
          <p className="text-xs font-bold text-green-700 dark:text-green-400">
            Você economiza {formatarPreco(desconto.economia)}
          </p>
        )}

        {/* Parece botão, mas é span porque o card inteiro já é um link. */}
        <span className="mt-auto block rounded-lg bg-orange-500 py-2.5 text-center text-sm font-bold text-white transition group-hover:bg-orange-600">
          Quero essa
        </span>
      </div>
    </Link>
  );
}