import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

export const TODAS_CIDADES = "__todas__";

export function LocationSection({
  cidades,
  cidadeAtual,
  cidadeFiltro,
  onChange,
  totalEncontradas,
}: {
  cidades: string[];
  cidadeAtual: string | null;
  cidadeFiltro: string;
  onChange: (v: string) => void;
  totalEncontradas: number;
}) {
  return (
    <section className="mx-auto max-w-3xl mt-12 px-6 pb-4 text-center">
      <h2 className="font-display text-xl font-bold md:text-2xl">
        Encontre empresas perto de você
      </h2>
      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-red">
          <MapPin className="h-4 w-4" />
          {cidadeAtual ?? "Sua região"}
        </div>
        <Select value={cidadeFiltro} onValueChange={onChange}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Todas as cidades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS_CIDADES}>Todas as cidades</SelectItem>
            {cidades.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {totalEncontradas === 0
          ? "Nenhuma empresa encontrada com esse filtro"
          : `${totalEncontradas} ${totalEncontradas === 1 ? "empresa encontrada" : "empresas encontradas"}`}
      </p>
    </section>
  );
}
