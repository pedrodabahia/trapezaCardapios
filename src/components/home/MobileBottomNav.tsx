import { Home, Search, Grid3x3, Heart, User } from "lucide-react";
import { toast } from "sonner";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Barra fixa inferior, só no mobile. "Início", "Buscar" e "Categorias"
// rolam pra seção correspondente NESSA MESMA página (não existe uma
// página de busca/categorias separada em nível de plataforma — só dentro
// do cardápio de cada empresa). "Favoritos" e "Perfil" não têm uma tela
// própria em nível de plataforma ainda, então só avisam "em breve" em vez
// de fingir que tem uma funcionalidade que não existe.
export function MobileBottomNav() {
  const itens = [
    { icon: Home, label: "Início", onClick: () => scrollToId("topo") },
    { icon: Search, label: "Buscar", onClick: () => scrollToId("busca") },
    { icon: Grid3x3, label: "Categorias", onClick: () => scrollToId("categorias") },
    { icon: Heart, label: "Favoritos", onClick: () => toast("Favoritos por aqui em breve") },
    { icon: User, label: "Perfil", onClick: () => toast("Perfil por aqui em breve") },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
      {itens.map((it) => (
        <button
          key={it.label}
          onClick={it.onClick}
          className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-muted-foreground"
        >
          <it.icon className="h-5 w-5" />
          {it.label}
        </button>
      ))}
    </nav>
  );
}
