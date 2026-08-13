import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Clock } from "lucide-react";
import { useEmpresaPublica } from "@/lib/admin-store";
import { getHorarios } from "@/lib/admin-store";

export const Route = createFileRoute("/s/$slug/location")({
  component: LocalizacaoPagina,
});

function LocalizacaoPagina() {
  const { slug } = Route.useParams();
  const { data: empresaCompleta } = useEmpresaPublica(slug);
  if (!empresaCompleta) return null;
  const { empresa, config } = empresaCompleta;
  const horarios = getHorarios(config);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="font-display text-2xl font-bold">Localização e horários</h1>

      {empresa.endereco && (
        <div className="mt-6 overflow-hidden rounded-3xl">
          <iframe
            title="Mapa"
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              empresa.endereco,
            )}&output=embed`}
            className="h-64 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-card p-4 card-shadow">
        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
        <div>
          <p className="font-semibold">Endereço</p>
          <p className="text-sm text-muted-foreground">
            {empresa.endereco || "Endereço não informado"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-card p-4 card-shadow">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
        <div className="w-full">
          <p className="font-semibold">Horário de funcionamento</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {horarios.map((h) => (
              <li key={h.day} className="flex justify-between">
                <span>{h.label}</span>
                <span>{h.closed ? "Fechado" : `${h.open} – ${h.close}`}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
