import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchSection({
  busca,
  onBuscaChange,
}: {
  busca: string;
  onBuscaChange: (v: string) => void;
}) {
  return (
    <section id="explorar" className="mx-auto max-w-3xl px-6 py-12 text-center">
      <h2 className="font-display text-2xl font-bold md:text-3xl">
        O que você está procurando?
      </h2>
      <div className="relative mx-auto mt-6 max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          placeholder="Busque por empresa, produto ou categoria..."
          className="h-14 rounded-full pl-12 text-base shadow-sm"
        />
      </div>
    </section>
  );
}
