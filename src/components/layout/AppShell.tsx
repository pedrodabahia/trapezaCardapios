
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ShoppingBag, Search, MapPin, Heart, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { AnalyticsTracker } from
  "@/components/analytics/AnalyticsTracker";

import { cartCount, getCartStore } from "@/lib/store";
import {
  getCores,
  getCidadeEntrega,
  useStoreOpenStatus,
} from "@/lib/admin-store";

import { CartDrawer } from "./CartDrawer";
import { cn } from "@/lib/utils";
import type { EmpresaCompleta } from "@/lib/admin-server";

type Props = {
  children: ReactNode;
  empresaCompleta: EmpresaCompleta;
  slug: string;
};

export function AppShell({ children, empresaCompleta, slug }: Props) {
  const { empresa, config } = empresaCompleta;

  const cores = getCores(config);
  const cidade = getCidadeEntrega(config);

  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const isNavigating = useRouterState({
    select: (s) => s.status === "pending",
  });

  const cssVars = `:root{${[
    `--brand-red:${cores.primary};`,
    `--brand-yellow:${cores.accent};`,
    `--brand-cream:${cores.bg};`,
    `--brand-brown:${cores.fg};`,
  ].join("")}}`;

  const navItems = [
    { to: "/s/$slug", label: "Cardápio", params: { slug } },
    { to: "/s/$slug/promotions", label: "Promoções", params: { slug } },
    { to: "/s/$slug/location", label: "Localização", params: { slug } },
    { to: "/s/$slug/favorites", label: "Favoritos", params: { slug } },
  ];

  const mobileItems = [
    { to: "/s/$slug", label: "Início", icon: Home, params: { slug } },
    { to: "/s/$slug/search", label: "Buscar", icon: Search, params: { slug } },
    { to: "/s/$slug/orders", label: "Pedidos", icon: ShoppingBag, params: { slug } },
    { to: "/s/$slug/favorites", label: "Favoritos", icon: Heart, params: { slug } },
  ];

  

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />

      <AnalyticsTracker />

      {/* Loader de navegação */}
      {isNavigating && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-cream/75 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-xl">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-yellow border-t-brand-red" />
            <span className="text-sm font-semibold text-brand-brown">
              Carregando...
            </span>
          </div>
        </div>
      )}

      <PoupopOpen cfg={config} slug={slug} />

      <CartDrawer slug={slug} config={config} />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-brand-yellow/30 bg-brand-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-8">
          <Link
            to="/s/$slug"
            params={{ slug }}
            className="flex min-w-0 items-center gap-2"
          >
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

          {/* Navegação desktop */}
          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const path = item.to.replace("$slug", slug);
              const active = pathname === path;

              return (
                <Link
                  key={item.label}
                  to={item.to as any}
                  params={item.params as any}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-brand-red text-white"
                      : "text-brand-brown hover:bg-brand-yellow/30"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Link
              to="/s/$slug/favorites"
              params={{ slug }}
              aria-label="Favoritos"
              className="hidden h-11 w-11 place-items-center rounded-full border border-brand-yellow/40 bg-white text-brand-brown transition hover:bg-brand-yellow/20 md:grid"
            >
              <Heart className="h-5 w-5" />
            </Link>

            <CartButton slug={slug} />
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* Navegação mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-yellow/40 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          {mobileItems.map((item) => {
            const path = item.to.replace("$slug", slug);
            const active = pathname === path;
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                to={item.to as any}
                params={item.params as any}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-[11px] font-semibold transition",
                  active ? "text-brand-red" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "scale-110")} />
                {item.label}
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
          open ? "bg-green-500" : "bg-red-500"
        )}
      />
      <span className={open ? "text-green-700" : "text-red-700"}>
        {open ? "Aberto agora" : "Fechado"}
      </span>
    </span>
  );
}

function PoupopOpen({
  cfg,
  slug,
}: {
  cfg: EmpresaCompleta["config"];
  slug: string;
}) {
  const open = useStoreOpenStatus(cfg);
  const [showPopup, setShowPopup] = useState(true);

  if (open || !showPopup) return null;

  return (
    <>
      {/* Fundo */}
      <div
        onClick={() => setShowPopup(false)}
        className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-[2px]"
      />

      {/* Popup */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-closed-title"
        className="fixed left-1/2 top-1/2 z-[100] flex min-h-[360px] w-[88vw] max-w-[380px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-3xl bg-white px-6 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
      >
        <button
          type="button"
          onClick={() => setShowPopup(false)}
          aria-label="Fechar aviso"
          className="absolute -right-3 -top-3 flex h-11 w-11 items-center justify-center rounded-full bg-[rgb(63,39,36)] text-white shadow-lg transition hover:scale-105 active:scale-95"
        >
          <X className="h-6 w-6" />
        </button>

        <img
          src="/icons/sr.trapezaSleep.svg"
          alt="Loja fechada"
          className="mb-4 w-[55%] max-w-[190px]"
        />

        <h2
          id="store-closed-title"
          className="mb-2 text-lg font-bold text-[rgb(63,39,36)]"
        >
          Estamos fechados
        </h2>

        <p className="mb-6 w-[90%] text-sm leading-relaxed text-gray-500">
          Estamos fechados no momento, mas fique à vontade para conferir nossas
          ofertas!
        </p>

        <Link
          to="/s/$slug/promotions"
          params={{ slug }}
          onClick={() => setShowPopup(false)}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-[rgb(63,39,36)] text-sm font-semibold text-white shadow-md transition hover:brightness-110 active:scale-[0.98]"
        >
          CONFERIR OFERTAS
        </Link>
      </div>
    </>
  );
}

function CartButton({ slug }: { slug: string }) {
  const { items, openDrawer } = useCart(slug);
  const count = cartCount(items);

  return (
    <button
      type="button"
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

function useCart(slug: string) {
  return getCartStore(slug)();
}