
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";

export function SearchBar({
  busca,
  onBuscaChange,
}: {
  busca: string;
  onBuscaChange: (v: string) => void;
}) {
  const navigate = useNavigate();

  function handleSearch() {
    const termo = busca.trim();

    if (!termo) return;

    navigate({
      to: "/b/buscar",
      search: { q: termo },
    });
  }

  return (
    <div id="busca" className="mx-auto max-w-6xl px-4 pt-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          placeholder="O que você está procurando?"
          className="h-11 rounded-2xl border-border/60 bg-card pl-10 text-sm shadow-sm"
        />
      </form>
    </div>
  );
}

