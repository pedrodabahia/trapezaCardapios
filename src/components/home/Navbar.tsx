import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "#explorar", label: "Explorar" },
  { href: "#categorias", label: "Categorias" },
  { href: "#empresas", label: "Empresas" },
  { href: "#sobre", label: "Sobre" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#topo" className="font-display text-xl font-bold tracking-tight">
          TRAPEZA
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link to="/painel/login">
            <Button className="rounded-full bg-brand-red text-white hover:bg-brand-red/90">
              Cadastre sua empresa
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden"
          aria-label="Abrir menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border/60 bg-background px-6 py-3 md:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              {l.label}
            </a>
          ))}
          <Link to="/painel/login" onClick={() => setOpen(false)}>
            <Button className="mt-2 w-full rounded-full bg-brand-red text-white hover:bg-brand-red/90">
              Cadastre sua empresa
            </Button>
          </Link>
        </nav>
      )}
    </header>
  );
}
