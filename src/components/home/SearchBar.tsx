import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Busca compacta de app (sem título gigante em cima) — reaproveita a
// mesma lógica de filtro que já existia (busca por nome/cidade/endereço),
// só muda a apresentação visual.
export function SearchBar({
  busca,
  onBuscaChange,
}: {
  busca: string;
  onBuscaChange: (v: string) => void;
}) {
  return (
    <div id="busca" className="mx-auto max-w-6xl px-4 pt-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          placeholder="O que você está procurando?"
          className="h-11 rounded-2xl border-border/60 bg-card pl-10 text-sm shadow-sm"
        />
      </div>
    </div>
  );
}
