import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ShoppingBag, Search, MapPin, Heart } from "lucide-react";
import { cartCount, getCartStore } from "@/lib/store";
import { getCores, getHorarios, getCidadeEntrega, isStoreOpenNow, useStoreOpenStatus } from "@/lib/admin-store";
import { CartDrawer } from "./CartDrawer";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { EmpresaCompleta } from "@/lib/admin-server";

type Props = {
  children: ReactNode;
  empresaCompleta: EmpresaCompleta;
  slug: string;
};

export function AppShell({ children, empresaCompleta, slug }: Props) {
  const { empresa, config } = empresaCompleta;
  const cores = getCores(config);
  const horarios = getHorarios(config);
  const cidade = getCidadeEntrega(config);

  // Injeta CSS vars da marca no escopo do app. O styles.css define
  // --primary, --background, --accent, --foreground etc. como var(--brand-*),
  // e o bloco @theme inline mapeia --color-brand-* = var(--brand-*) pro
  // Tailwind. Ou seja, sobrescrever --brand-red/--brand-yellow/--brand-cream/
  // --brand-brown aqui (SEM o prefixo --color-) repinta tanto as classes
  // bg-brand-*/text-brand-* quanto os tokens genéricos (bg-primary, bg-card,
  // bg-accent...) usados no resto do app e no painel admin — um único
  // sistema de cor, não dois.
  const cssVars = `:root{${[
    `--brand-red:${cores.primary};`,
    `--brand-yellow:${cores.accent};`,
    `--brand-cream:${cores.bg};`,
    `--brand-brown:${cores.fg};`,
  ].join("")}}`;

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />

      <CartDrawer slug={slug} config={config} />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-brand-yellow/30 bg-brand-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-8">
          <Link to="/s/$slug" params={{ slug }} className="flex min-w-0 items-center gap-2">
            {empresa.logo_url ? (
              <img
                src={empresa.logo_url}
                alt={empresa.nome}
                className="h-10 w-10 shrink-0 rounded-2xl object-cover shadow-md"
              />
            ) : (
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-red font-display text-lg font-bold text-white shadow-md">
                {empresa.nome[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate font-display text-2xl font-bold leading-none text-brand-brown sm:text-lg">
                {empresa.nome}
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-muted-foreground sm:text-[11px]">
                <span className="flex min-w-0 items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{cidade || "—"}</span>
                </span>
                <OpenBadge cfg={config} />
              </div>
            </div>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {[
              { to: "/s/$slug", label: "Cardápio", params: { slug } },
              { to: "/s/$slug/promotions", label: "Promoções", params: { slug } },
              { to: "/s/$slug/location", label: "Localização", params: { slug } },
              { to: "/s/$slug/favorites", label: "Favoritos", params: { slug } },
            ].map((l) => {
              const path = l.to.replace("$slug", slug).replace(/\/\$slug\/promotions$/, "/s/" + slug + "/promotions");
              return (
                <Link
                  key={l.label}
                  to={l.to}
                  params={l.params as any}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition",
                    pathname === path
                      ? "bg-brand-red text-white"
                      : "text-brand-brown hover:bg-brand-yellow/30"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Link
              to="/s/$slug/favorites"
              params={{ slug }}
              className="hidden h-11 w-11 place-items-center rounded-full border border-brand-yellow/40 bg-white text-brand-brown transition hover:bg-brand-yellow/20 md:grid"
            >
              <Heart className="h-5 w-5" />
            </Link>

            <CartButton slug={slug} />
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* Bottom Nav Mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-yellow/40 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          {[
            { to: "/s/$slug", label: "Início", icon: Home, params: { slug } },
            { to: "/s/$slug/search", label: "Buscar", icon: Search, params: { slug } },
            { to: "/s/$slug/orders", label: "Pedidos", icon: ShoppingBag, params: { slug } },
            { to: "/s/$slug/favorites", label: "Favoritos", icon: Heart, params: { slug } },
          ].map((n) => {
            const path = n.to.replace("$slug", slug);
            const active = pathname === path;
            const Icon = n.icon;
            return (
              <Link
                key={n.label}
                to={n.to}
                params={n.params as any}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-[11px] font-semibold transition",
                  active ? "text-brand-red" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "scale-110")} />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function OpenBadge({ cfg }: { cfg: EmpresaCompleta["config"] }) {
  const open = useStoreOpenStatus(cfg);
  return (
    <span className="flex shrink-0 items-center gap-1 font-semibold">
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          open ? "bg-green-500" : "bg-red-500",
        )}
      />
      <span className={open ? "text-green-700" : "text-red-700"}>
        {open ? "Aberto agora" : "Fechado"}
      </span>
    </span>
  );
}

function CartButton({ slug }: { slug: string }) {
  const { items, openDrawer } = useCart(slug);
  const count = cartCount(items);
  return (
    <button
      onClick={openDrawer}
      className="relative flex h-11 items-center gap-2 rounded-full bg-brand-red px-4 text-sm font-bold text-white shadow-lg transition hover:scale-105"
    >
      <ShoppingBag className="h-5 w-5" />
      <span className="hidden sm:inline">Carrinho</span>
      {count > 0 && (
        <span className="grid h-6 min-w-6 place-items-center rounded-full bg-brand-yellow px-1.5 text-xs font-bold text-brand-brown">
          {count}
        </span>
      )}
    </button>
  );
}

// Resolve a store do carrinho específica da empresa (por slug).
function useCart(slug: string) {
  return getCartStore(slug)();
}
