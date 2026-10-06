
import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "../../../public/logo.svg";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { criarCadastroInteresse } from "@/lib/admin-server";
import { useCategoriasNegocio } from "@/lib/categorias-negocio";

type Formulario = {
  nomeEmpresa: string;
  nomeResponsavel: string;
  whatsapp: string;
  email: string;
  cidade: string;
  bairro: string;
  endereco: string;
  categorias: string[];
  outraCategoria: string;
  descricao: string;
  palavrasChave: string;
  urlExterna: string;
};

const vazio: Formulario = {
  nomeEmpresa: "",
  nomeResponsavel: "",
  whatsapp: "",
  email: "",
  cidade: "",
  bairro: "",
  endereco: "",
  categorias: [],
  outraCategoria: "",
  descricao: "",
  palavrasChave: "",
  urlExterna: "",
};

export function BusinessSignupCTA() {
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState<Formulario>(vazio);

  const { data: categorias = [] } = useCategoriasNegocio();

  /**
   * Organiza as categorias assim:
   *
   * Alimentação
   *   Hamburgueria
   *   Padaria
   *   Pizzaria
   *
   * Beleza
   *   Barbearia
   *   Cabeleireiro
   *
   * Serviços
   *   ...
   *
   * Os pais são apenas títulos.
   * Somente as categorias filhas podem ser escolhidas.
   */
  const categoriasAgrupadas = useMemo(() => {
    const pais = categorias
      .filter((categoria) => categoria.categoria_pai_id === null)
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

    return pais
      .map((pai) => ({
        ...pai,
        filhos: categorias
          .filter((categoria) => categoria.categoria_pai_id === pai.id)
          .sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
      }))
      .filter((grupo) => grupo.filhos.length > 0);
  }, [categorias]);

  const selecionouOutros = form.categorias.includes("outros");

  function atualizarCampo<K extends keyof Formulario>(
    campo: K,
    valor: Formulario[K],
  ) {
    setForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function selecionarCategoria(id: string) {
    setForm((atual) => {
      const selecionadas = atual.categorias.includes(id)
        ? atual.categorias.filter((categoriaId) => categoriaId !== id)
        : [...atual.categorias, id];

      return {
        ...atual,
        categorias: selecionadas,
      };
    });
  }

  function selecionarOutros() {
    setForm((atual) => {
      const jaSelecionou = atual.categorias.includes("outros");

      return {
        ...atual,
        categorias: jaSelecionou
          ? atual.categorias.filter((categoria) => categoria !== "outros")
          : [...atual.categorias, "outros"],
        outraCategoria: jaSelecionou ? "" : atual.outraCategoria,
      };
    });
  }

  function fechar() {
    setAberto(false);
    setEnviado(false);
    setForm(vazio);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();

    if (form.categorias.length === 0) {
      toast.error("Escolha ao menos uma categoria.");
      return;
    }

    if (selecionouOutros && !form.outraCategoria.trim()) {
      toast.error("Informe qual é a atividade do seu negócio.");
      return;
    }

    setEnviando(true);

    try {
      await criarCadastroInteresse({
        data: {
          nomeEmpresa: form.nomeEmpresa,
          nomeResponsavel: form.nomeResponsavel,
          whatsapp: form.whatsapp,
          email: form.email || undefined,
          cidade: form.cidade,
          bairro: form.bairro || undefined,
          endereco: form.endereco || undefined,
          categorias: form.categorias,
          outraCategoria: form.outraCategoria || undefined,
          descricao: form.descricao || undefined,
          palavrasChave: form.palavrasChave || undefined,
          urlExterna: form.urlExterna || undefined,
        },
      });

      setEnviado(true);
    } catch (erro) {
      toast.error(
        erro instanceof Error
          ? erro.message
          : "Não foi possível enviar seu cadastro.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
        <div className="group relative overflow-hidden rounded-md border border-brand-brown/10 bg-gradient-to-r from-red-900 via-red-800 to-red-800 px-5 py-5 shadow-sm transition sm:px-7 sm:py-6">
          <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-brand-red/10 blur-2xl transition group-hover:scale-125" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-yellow shadow-sm">
                <img src={logo} className="h-5 w-5" alt="Trapeza" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-yellow-500">
                  Para quem é empreendedor
                </p>

                <h2 className="font-display text-lg font-extrabold text-white sm:text-xl">
                  Sua empresa já apareceu no Trapeza?
                </h2>

                <p className="mt-0.5 text-sm text-white">
                  Cadastre-se grátis em menos de 2 minutos!
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setAberto(true)}
              className="w-full rounded-full border-brand-brown/30 bg-white font-bold text-red-900 hover:border-brand-brown hover:bg-brand-brown hover:text-white sm:w-auto"
            >
              CADASTRAR AGORA
            </Button>
          </div>
        </div>
      </section>

      <Dialog
        open={aberto}
        onOpenChange={(open) => (open ? setAberto(true) : fechar())}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          {enviado ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />

              <DialogTitle className="mt-4 text-2xl">
                Cadastro recebido!
              </DialogTitle>

              <DialogDescription className="mx-auto mt-3 max-w-sm leading-relaxed">
                Valeu pelo interesse! Vamos analisar os dados da sua empresa e
                entrar em contato pelo WhatsApp informado.
              </DialogDescription>

              <Button
                className="mt-6 rounded-full"
                onClick={fechar}
              >
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  Leve sua empresa para o Trapeza
                </DialogTitle>

                <DialogDescription>
                  Preencha os dados da sua empresa. Depois vamos revisar e
                  publicar seu cadastro no Trapeza.
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-4" onSubmit={enviar}>
                {/* EMPRESA */}
                <div>
                  <Label htmlFor="lead-empresa">
                    Nome da empresa
                  </Label>

                  <Input
                    id="lead-empresa"
                    required
                    value={form.nomeEmpresa}
                    onChange={(e) =>
                      atualizarCampo("nomeEmpresa", e.target.value)
                    }
                    placeholder="Ex.: Pizzaria do João"
                  />
                </div>

                {/* RESPONSÁVEL */}
                <div>
                  <Label htmlFor="lead-responsavel">
                    Seu nome
                  </Label>

                  <Input
                    id="lead-responsavel"
                    required
                    value={form.nomeResponsavel}
                    onChange={(e) =>
                      atualizarCampo("nomeResponsavel", e.target.value)
                    }
                    placeholder="Quem cuida do negócio?"
                  />
                </div>

                {/* WHATSAPP + EMAIL */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="lead-whatsapp">
                      WhatsApp com DDD
                    </Label>

                    <Input
                      id="lead-whatsapp"
                      required
                      inputMode="tel"
                      value={form.whatsapp}
                      onChange={(e) =>
                        atualizarCampo("whatsapp", e.target.value)
                      }
                      placeholder="(73) 99999-9999"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lead-email">
                      E-mail
                    </Label>

                    <Input
                      id="lead-email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        atualizarCampo("email", e.target.value)
                      }
                      placeholder="voce@empresa.com"
                    />
                  </div>
                </div>

                {/* CIDADE + BAIRRO */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="lead-cidade">
                      Cidade
                    </Label>

                    <Input
                      id="lead-cidade"
                      required
                      value={form.cidade}
                      onChange={(e) =>
                        atualizarCampo("cidade", e.target.value)
                      }
                      placeholder="Sua cidade"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lead-bairro">
                      Bairro
                    </Label>

                    <Input
                      id="lead-bairro"
                      value={form.bairro}
                      onChange={(e) =>
                        atualizarCampo("bairro", e.target.value)
                      }
                      placeholder="Ex.: Centro"
                    />
                  </div>
                </div>

                {/* ENDEREÇO */}
                <div>
                  <Label htmlFor="lead-endereco">
                    Endereço
                  </Label>

                  <Input
                    id="lead-endereco"
                    value={form.endereco}
                    onChange={(e) =>
                      atualizarCampo("endereco", e.target.value)
                    }
                    placeholder="Rua, número..."
                  />
                </div>

                {/* CATEGORIAS */}
                <div>
                  <Label>
                    Qual é a atividade da empresa?
                  </Label>

                  <p className="mb-3 mt-1 text-xs text-muted-foreground">
                    Você pode escolher mais de uma atividade.
                  </p>

                  <div className="space-y-4 rounded-md border p-3">
                    {categoriasAgrupadas.map((grupo) => (
                      <div key={grupo.id}>
                        <p className="mb-2 text-sm font-bold text-foreground">
                          {grupo.label}
                        </p>

                        <div className="grid gap-2 sm:grid-cols-2">
                          {grupo.filhos.map((categoria) => {
                            const selecionada =
                              form.categorias.includes(categoria.id);

                            return (
                              <label
                                key={categoria.id}
                                className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                                  selecionada
                                    ? "border-red-800 bg-red-50 text-red-900"
                                    : "border-input hover:bg-muted"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selecionada}
                                  onChange={() =>
                                    selecionarCategoria(categoria.id)
                                  }
                                  className="h-4 w-4"
                                />

                                <span>{categoria.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* OUTROS */}
                    <div className="border-t pt-4">
                      <label
                        className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                          selecionouOutros
                            ? "border-red-800 bg-red-50 text-red-900"
                            : "border-input hover:bg-muted"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selecionouOutros}
                          onChange={selecionarOutros}
                          className="h-4 w-4"
                        />

                        <span>Outros</span>
                      </label>

                      {selecionouOutros && (
                        <div className="mt-3">
                          <Label htmlFor="lead-outra-categoria">
                            Qual é a atividade?
                          </Label>

                          <Input
                            id="lead-outra-categoria"
                            value={form.outraCategoria}
                            onChange={(e) =>
                              atualizarCampo(
                                "outraCategoria",
                                e.target.value,
                              )
                            }
                            placeholder="Ex.: Impressão 3D"
                            required
                          />

                          <p className="mt-1 text-xs text-muted-foreground">
                            Essa informação será enviada para nossa equipe.
                            Não criaremos uma categoria automaticamente.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {categoriasAgrupadas.length === 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      As atividades específicas ainda estão sendo configuradas.
                    </p>
                  )}
                </div>

                {/* DESCRIÇÃO */}
                <div>
                  <Label htmlFor="lead-descricao">
                    Sobre sua empresa
                  </Label>

                  <textarea
                    id="lead-descricao"
                    value={form.descricao}
                    onChange={(e) =>
                      atualizarCampo("descricao", e.target.value)
                    }
                    placeholder="Conte brevemente o que sua empresa oferece."
                    className="mt-1 flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* PALAVRAS-CHAVE */}
                <div>
                  <Label htmlFor="lead-palavras-chave">
                    Palavras-chave
                    <span className="ml-1 text-muted-foreground">
                      (opcional)
                    </span>
                  </Label>

                  <Input
                    id="lead-palavras-chave"
                    value={form.palavrasChave}
                    onChange={(e) =>
                      atualizarCampo("palavrasChave", e.target.value)
                    }
                    placeholder="Ex.: pizza, delivery, lanches"
                  />
                </div>

                {/* SITE */}
                <div>
                  <Label htmlFor="lead-url">
                    Site ou Instagram
                    <span className="ml-1 text-muted-foreground">
                      (opcional)
                    </span>
                  </Label>

                  <Input
                    id="lead-url"
                    type="url"
                    value={form.urlExterna}
                    onChange={(e) =>
                      atualizarCampo("urlExterna", e.target.value)
                    }
                    placeholder="https://..."
                  />
                </div>

                <Button
                  className="w-full rounded-full"
                  type="submit"
                  disabled={enviando}
                >
                  {enviando
                    ? "Enviando..."
                    : "Enviar meu cadastro gratuito"}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
