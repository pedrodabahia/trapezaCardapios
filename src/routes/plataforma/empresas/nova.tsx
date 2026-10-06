
import {
  createFileRoute,
  redirect,
  useNavigate,
  Link,
} from "@tanstack/react-router";

import { useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  createEmpresa,
  listPlanos,
  updateEmpresaPlataforma,
} from "@/lib/admin-server";

import { useAuthSession } from "@/lib/auth-session";
import { useCategoriasNegocio } from "@/lib/categorias-negocio";

type CadastroPendente = {
  id?: string;
  nome?: string;
  responsavel?: string;
  whatsapp?: string;
  email?: string;

  cidade?: string;
  bairro?: string;
  endereco?: string;

  categorias?: string[];
  outraCategoria?: string;

  descricao?: string;
  palavrasChave?: string;
  urlExterna?: string;

  logoUrl?: string;
  capaUrl?: string;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const Route = createFileRoute("/plataforma/empresas/nova")({
  beforeLoad: () => {
    const session = useAuthSession.getState().session;

    if (!session || session.role !== "super_admin") {
      throw redirect({ to: "/plataforma/login" });
    }
  },

  component: NovaEmpresa,
});

function NovaEmpresa() {
  const navigate = useNavigate();

  const session = useAuthSession((s) => s.session);

  const { data: categorias = [] } = useCategoriasNegocio();

  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const [whatsapp, setWhatsapp] = useState("");
  const [planoId, setPlanoId] = useState("gratuito");
  const [adminEmail, setAdminEmail] = useState("");

  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [endereco, setEndereco] = useState("");

  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<
    string[]
  >([]);

  const [descricao, setDescricao] = useState("");
  const [palavrasChave, setPalavrasChave] = useState("");
  const [urlExterna, setUrlExterna] = useState("");

  const [logoUrl, setLogoUrl] = useState("");
  const [capaUrl, setCapaUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  /*
   * Carrega o pré-cadastro enviado pelo formulário público.
   */
  useEffect(() => {
    const bruto = window.localStorage.getItem(
      "trapeza:cadastro-pendente",
    );

    if (!bruto) return;

    try {
      const lead = JSON.parse(bruto) as CadastroPendente;

      setNome(lead.nome ?? "");
      setWhatsapp((lead.whatsapp ?? "").replace(/\D/g, ""));
      setAdminEmail(lead.email ?? "");

      setCidade(lead.cidade ?? "");
      setBairro(lead.bairro ?? "");
      setEndereco(lead.endereco ?? "");

      setCategoriasSelecionadas(lead.categorias ?? []);

      setDescricao(lead.descricao ?? "");
      setPalavrasChave(lead.palavrasChave ?? "");
      setUrlExterna(lead.urlExterna ?? "");

      setLogoUrl(lead.logoUrl ?? "");
      setCapaUrl(lead.capaUrl ?? "");
    } catch {
      // Cadastro antigo/inválido não deve impedir cadastro manual.
    }
  }, []);

  const { data: planos = [] } = useQuery({
    queryKey: ["planos"],
    queryFn: () =>
      listPlanos({
        data: {} as Record<string, never>,
      }),
  });

  /*
   * Categorias agrupadas por pai e ordenadas alfabeticamente.
   */
  const categoriasAgrupadas = useMemo(() => {
    const pais = categorias
      .filter((categoria) => categoria.categoria_pai_id === null)
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

    return pais
      .map((pai) => ({
        ...pai,

        filhos: categorias
          .filter(
            (categoria) =>
              categoria.categoria_pai_id === pai.id,
          )
          .sort((a, b) =>
            a.label.localeCompare(b.label, "pt-BR"),
          ),
      }))
      .filter((grupo) => grupo.filhos.length > 0);
  }, [categorias]);

  if (!session) return null;

  const finalSlug = slugTouched ? slug : slugify(nome);

  /*
   * Converte os IDs recebidos do formulário público para os
   * valores que o diretório da empresa já utiliza.
   */
  const categoriasParaEmpresa = categoriasSelecionadas
    .map((categoriaId) => {
      if (categoriaId === "outros") {
        return "outros";
      }

      const categoria = categorias.find(
        (item) => item.id === categoriaId,
      );

      return categoria?.valor ?? categoriaId;
    })
    .filter(Boolean);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!session) return;

    if (!nome.trim()) {
      toast.error("Informe o nome da empresa.");
      return;
    }

    if (!categoriasSelecionadas.length) {
      toast.error("Escolha ao menos uma categoria.");
      return;
    }

    setSubmitting(true);

    try {
      /*
       * 1. Cria a empresa usando o fluxo existente.
       */
      const res = await createEmpresa({
        data: {
          token: session.accessToken,
          slug: finalSlug,
          nome,
          whatsapp,
          plano_id: planoId,
          adminEmail,
        },
      });

      /*
       * 2. Completa o perfil da empresa com os dados
       * que vieram do pré-cadastro.
       */
      await updateEmpresaPlataforma({
        data: {
          token: session.accessToken,
          empresaId: res.empresaId,

          patch: {
            nome,
            whatsapp: whatsapp || null,

            cidade: cidade || null,
            bairro: bairro || null,
            endereco: endereco || null,

            categorias: categoriasParaEmpresa,

            descricao: descricao || null,
            palavras_chave: palavrasChave || null,

            logo_url: logoUrl || null,
            capa_url: capaUrl || null,

            url_externa: urlExterna || null,
          },
        },
      });

      setTempPassword(res.tempPassword);

      window.localStorage.removeItem(
        "trapeza:cadastro-pendente",
      );

      toast.success(
        `Empresa ${nome} criada e perfil preenchido.`,
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro ao criar empresa",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <h1 className="font-display text-xl font-bold">
            Nova empresa
          </h1>

          <Link to="/plataforma">
            <Button variant="outline" size="sm">
              ← Voltar
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {tempPassword ? (
          <Card className="border-brand-yellow bg-brand-cream">
            <CardHeader>
              <CardTitle className="font-display">
                Empresa criada!
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="text-sm">
                  Acesse{" "}
                  <code className="rounded bg-white px-2 py-0.5">
                    /s/{finalSlug}
                  </code>{" "}
                  para ver o cadastro público.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Credenciais iniciais do admin:
                </p>

                <p className="mt-1 text-sm">
                  Email:{" "}
                  <code className="rounded bg-white px-2 py-0.5">
                    {adminEmail}
                  </code>
                </p>

                <div className="mt-1 flex items-center gap-2 text-sm">
                  Senha temporária:

                  <Badge
                    variant="default"
                    className="font-mono"
                  >
                    {tempPassword}
                  </Badge>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Copie e envie para o dono da empresa.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    navigate({
                      to: "/plataforma",
                    })
                  }
                >
                  Voltar ao dashboard
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setTempPassword(null);

                    setNome("");
                    setSlug("");
                    setSlugTouched(false);

                    setWhatsapp("");
                    setAdminEmail("");

                    setCidade("");
                    setBairro("");
                    setEndereco("");

                    setCategoriasSelecionadas([]);

                    setDescricao("");
                    setPalavrasChave("");
                    setUrlExterna("");

                    setLogoUrl("");
                    setCapaUrl("");
                  }}
                >
                  Cadastrar outra
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                Cadastrar empresa
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={onSubmit}
                className="space-y-6"
              >
                {/* DADOS PRINCIPAIS */}
                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    Dados da empresa
                  </h2>

                  <div>
                    <Label htmlFor="nome">
                      Nome da empresa
                    </Label>

                    <Input
                      id="nome"
                      required
                      placeholder="Hotdog do Simão"
                      value={nome}
                      onChange={(e) =>
                        setNome(e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">
                      Slug (URL pública)
                    </Label>

                    <Input
                      id="slug"
                      required
                      placeholder="hotdog-do-simao"
                      value={finalSlug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setSlugTouched(true);
                      }}
                    />

                    <p className="mt-1 text-xs text-muted-foreground">
                      Será acessível em{" "}
                      <code>
                        /s/{finalSlug || "slug"}
                      </code>
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="whatsapp">
                      WhatsApp
                    </Label>

                    <Input
                      id="whatsapp"
                      required
                      placeholder="557399831608"
                      value={whatsapp}
                      onChange={(e) =>
                        setWhatsapp(
                          e.target.value.replace(/\D/g, ""),
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="adminEmail">
                      Email do admin inicial
                    </Label>

                    <Input
                      id="adminEmail"
                      type="email"
                      required
                      placeholder="dono@empresa.com"
                      value={adminEmail}
                      onChange={(e) =>
                        setAdminEmail(e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* LOCALIZAÇÃO */}
                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    Localização
                  </h2>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="cidade">
                        Cidade
                      </Label>

                      <Input
                        id="cidade"
                        value={cidade}
                        onChange={(e) =>
                          setCidade(e.target.value)
                        }
                        placeholder="Posto da Mata"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bairro">
                        Bairro
                      </Label>

                      <Input
                        id="bairro"
                        value={bairro}
                        onChange={(e) =>
                          setBairro(e.target.value)
                        }
                        placeholder="Centro"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="endereco">
                      Endereço
                    </Label>

                    <Input
                      id="endereco"
                      value={endereco}
                      onChange={(e) =>
                        setEndereco(e.target.value)
                      }
                      placeholder="Rua, número..."
                    />
                  </div>
                </div>

                {/* CATEGORIAS */}
                <div className="space-y-3">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    Categorias
                  </h2>

                  <p className="text-xs text-muted-foreground">
                    As categorias escolhidas no cadastro público
                    já aparecem selecionadas.
                  </p>

                  <div className="space-y-4 rounded-md border p-4">
                    {categoriasAgrupadas.map((grupo) => (
                      <div key={grupo.id}>
                        <p className="mb-2 text-sm font-bold">
                          {grupo.label}
                        </p>

                        <div className="grid gap-2 sm:grid-cols-2">
                          {grupo.filhos.map((categoria) => {
                            const selecionada =
                              categoriasSelecionadas.includes(
                                categoria.id,
                              );

                            return (
                              <label
                                key={categoria.id}
                                className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                                  selecionada
                                    ? "border-red-800 bg-red-50 text-red-900"
                                    : "border-input hover:bg-muted"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selecionada}
                                  onChange={() => {
                                    setCategoriasSelecionadas(
                                      (atual) =>
                                        atual.includes(
                                          categoria.id,
                                        )
                                          ? atual.filter(
                                              (id) =>
                                                id !==
                                                categoria.id,
                                            )
                                          : [
                                              ...atual,
                                              categoria.id,
                                            ],
                                    );
                                  }}
                                />

                                {categoria.label}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {categoriasSelecionadas.includes(
                      "outros",
                    ) && (
                      <div className="border-t pt-3">
                        <p className="text-sm font-semibold">
                          Outra atividade informada
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          A atividade informada no cadastro público
                          será analisada antes de criar uma nova
                          categoria.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* DESCRIÇÃO */}
                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    Informações do perfil
                  </h2>

                  <div>
                    <Label htmlFor="descricao">
                      Descrição
                    </Label>

                    <textarea
                      id="descricao"
                      value={descricao}
                      onChange={(e) =>
                        setDescricao(e.target.value)
                      }
                      placeholder="Sobre a empresa..."
                      className="mt-1 flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <Label htmlFor="palavrasChave">
                      Palavras-chave
                    </Label>

                    <Input
                      id="palavrasChave"
                      value={palavrasChave}
                      onChange={(e) =>
                        setPalavrasChave(e.target.value)
                      }
                      placeholder="pizza, delivery, lanches"
                    />
                  </div>

                  <div>
                    <Label htmlFor="urlExterna">
                      Site ou Instagram
                    </Label>

                    <Input
                      id="urlExterna"
                      value={urlExterna}
                      onChange={(e) =>
                        setUrlExterna(e.target.value)
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* PLANO */}
                <div>
                  <Label htmlFor="plano">
                    Plano
                  </Label>

                  <Select
                    value={planoId}
                    onValueChange={setPlanoId}
                  >
                    <SelectTrigger id="plano">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {planos.map((p) => (
                        <SelectItem
                          key={p.id}
                          value={p.id}
                        >
                          {p.nome} — R${" "}
                          {Number(p.preco_mensal).toFixed(2)}
                          /mês
                          {p.limite_produtos
                            ? ` · até ${p.limite_produtos} produtos`
                            : " · produtos ilimitados"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting
                    ? "Criando..."
                    : "Criar empresa e admin"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
