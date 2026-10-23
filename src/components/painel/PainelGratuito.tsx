
import { useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  Clock,
  Package,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ImageUploadField } from "@/components/ImageUploadField";

import {
  updateEmpresa,
  saveEmpresaConfig,
  type EmpresaCompleta,
} from "@/lib/admin-server";
import { getHorarios, type DayHours } from "@/lib/admin-store";

import { ProdutosTab } from "./ProdutosTab";

type SecaoGratuita = "empresa" | "produtos";

interface PainelGratuitoProps {
  completa: EmpresaCompleta;
  token: string;
  onSaved: () => void;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  navOpen: boolean;
  setNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
  ehGratuito: boolean;
}

const SECOES: {
  value: SecaoGratuita;
  label: string;
  descricao: string;
  Icon: typeof Building2;
}[] = [
  {
    value: "empresa",
    label: "Dados da empresa",
    descricao: "Nome, endereço, logo e funcionamento",
    Icon: Building2,
  },
  {
    value: "produtos",
    label: "Produtos e serviços",
    descricao: "Cadastre e gerencie o que sua empresa oferece",
    Icon: Package,
  },
];

const DIAS_SEMANA = [
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
] as const;

export function PainelGratuito({
  completa,
  token,
  onSaved,
}: PainelGratuitoProps) {
  const empresa = completa.empresa;

  const [secao, setSecao] = useState<SecaoGratuita>("empresa");

  const [nome, setNome] = useState(empresa.nome);
  const [endereco, setEndereco] = useState(empresa.endereco ?? "");
  const [logoUrl, setLogoUrl] = useState(empresa.logo_url ?? "");
  const [capaUrl, setCapaUrl] = useState(empresa.capa_url ?? "");

  const [busyPerfil, setBusyPerfil] = useState(false);
  const [busyHorario, setBusyHorario] = useState(false);

  const [horarios, setHorarios] = useState<DayHours[]>(() =>
    getHorarios(completa.config),
  );

  async function onSalvarPerfil() {
    if (!nome.trim()) {
      toast.error("Informe o nome da empresa.");
      return;
    }

    setBusyPerfil(true);

    try {
      await updateEmpresa({
        data: {
          token,
          empresaId: empresa.id,
          patch: {
            nome: nome.trim(),
            endereco: endereco.trim(),
            logo_url: logoUrl,
            capa_url: capaUrl,
          },
        },
      });

      toast.success("Dados da empresa salvos!");
      onSaved();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro ao salvar os dados da empresa.",
      );
    } finally {
      setBusyPerfil(false);
    }
  }

  async function onSalvarHorario() {
    setBusyHorario(true);

    try {
      const horariosConfigurados = Object.fromEntries(
        horarios.map((horario) => [
          DIAS_SEMANA[horario.day],
          {
            abre: horario.open,
            fecha: horario.close,
            fechado: horario.closed,
          },
        ]),
      );

      await saveEmpresaConfig({
        data: {
          token,
          empresaId: empresa.id,
          data: {
            ...completa.config,
            horarios: horariosConfigurados,
          },
        },
      });

      toast.success("Horários de funcionamento salvos!");
      onSaved();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro ao salvar os horários.",
      );
    } finally {
      setBusyHorario(false);
    }
  }

  function atualizarHorario(
    index: number,
    alteracoes: Partial<DayHours>,
  ) {
    setHorarios((atuais) =>
      atuais.map((horario, i) =>
        i === index
          ? { ...horario, ...alteracoes }
          : horario,
      ),
    );
  }

  return (
    <div className="space-y-6">
      {/* Informativo do plano */}
      <div className="rounded-2xl border border-dashed border-border bg-card p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Badge variant="secondary" className="w-fit">
            Plano gratuito
          </Badge>

          <p className="text-sm text-muted-foreground">
            Gerencie sua empresa e cadastre produtos e serviços
            em um único lugar.
          </p>
        </div>
      </div>

      {/* Navegação das seções disponíveis no plano gratuito */}
      <nav
        aria-label="Seções do painel gratuito"
        className="grid gap-3 sm:grid-cols-2"
      >
        {SECOES.map(({ value, label, descricao, Icon }) => {
          const selecionada = secao === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => setSecao(value)}
              aria-pressed={selecionada}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                selecionada
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-muted/50"
              }`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />

              <span className="min-w-0">
                <span className="block font-semibold">
                  {label}
                </span>

                <span className="mt-1 block text-xs text-muted-foreground">
                  {descricao}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* Seção: dados da empresa e horário */}
      {secao === "empresa" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados da empresa</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="empresa-nome">
                  Nome da empresa
                </Label>

                <Input
                  id="empresa-nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome da empresa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="empresa-endereco">
                  Endereço
                </Label>

                <Input
                  id="empresa-endereco"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ImageUploadField
                  label="Logo"
                  value={logoUrl}
                  onChange={setLogoUrl}
                  token={token}
                  empresaId={empresa.id}
                  pasta="logo"
                />

                <ImageUploadField
                  label="Capa / imagem"
                  value={capaUrl}
                  onChange={setCapaUrl}
                  token={token}
                  empresaId={empresa.id}
                  pasta="capa"
                />
              </div>

              <Button
                onClick={onSalvarPerfil}
                disabled={busyPerfil || !nome.trim()}
              >
                {busyPerfil ? "Salvando..." : "Salvar dados"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horário de funcionamento
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {horarios.map((horario, index) => (
                <div
                  key={horario.day}
                  className="flex flex-wrap items-center gap-3 border-b pb-3 last:border-0"
                >
                  <span className="w-24 text-sm font-semibold">
                    {horario.label}
                  </span>

                  <Switch
                    checked={!horario.closed}
                    onCheckedChange={(aberto) =>
                      atualizarHorario(index, {
                        closed: !aberto,
                      })
                    }
                    aria-label={`Empresa aberta ${horario.label}`}
                  />

                  <Input
                    type="time"
                    value={horario.open}
                    onChange={(e) =>
                      atualizarHorario(index, {
                        open: e.target.value,
                      })
                    }
                    disabled={horario.closed}
                    className="w-28"
                    aria-label={`Horário de abertura ${horario.label}`}
                  />

                  <span className="text-sm text-muted-foreground">
                    até
                  </span>

                  <Input
                    type="time"
                    value={horario.close}
                    onChange={(e) =>
                      atualizarHorario(index, {
                        close: e.target.value,
                      })
                    }
                    disabled={horario.closed}
                    className="w-28"
                    aria-label={`Horário de fechamento ${horario.label}`}
                  />

                  {horario.closed && (
                    <Badge variant="secondary">
                      Fechado
                    </Badge>
                  )}
                </div>
              ))}

              <Button
                onClick={onSalvarHorario}
                disabled={busyHorario}
              >
                {busyHorario
                  ? "Salvando..."
                  : "Salvar horários"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Seção: produtos e serviços */}
      {secao === "produtos" && (
        <ProdutosTab
          completa={completa}
          token={token}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
