import { uploadImagemPromocao } from "@/modules/promocoes/controllers/upload-promocao.controller";
import {
  createFileRoute,
  redirect,
  Link,
} from "@tanstack/react-router";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import {
  Pencil,
  Plus,
  RefreshCw,
  Tag,
  Trash2,
  X,
  Search,
  ImagePlus,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { useAuthSession } from "@/lib/auth-session";
import { listEmpresasAdmin } from "@/lib/admin-server";
import { supabase } from "@/lib/supabase-client";

import {
  listarPromocoesAdmin,
  listarCategoriasPromocao,
  savePromocao,
  deletePromocao,
} from "@/modules/promocoes/controllers/promocao.controller";

import type {
  NovaPromocaoInput,
  Promocao,
  PromocaoCategoria,
} from "@/modules/promocoes/types/promocao.types";

export const Route = createFileRoute("/plataforma/promocoes")({
  beforeLoad: () => {
    const session = useAuthSession.getState().session;

    if (!session || session.role !== "super_admin") {
      throw redirect({ to: "/plataforma/login" });
    }
  },
  component: PromocoesAdmin,
});

type StatusPromocao =
  | "rascunho"
  | "ativa"
  | "pausada"
  | "expirada";

type EmpresaOpcao = {
  id: string;
  nome: string;
};

type PromocaoAdmin = Promocao & {
  empresa_nome?: string;
};

const STATUS: {
  value: StatusPromocao;
  label: string;
}[] = [
  { value: "rascunho", label: "Rascunho" },
  { value: "ativa", label: "Ativa" },
  { value: "pausada", label: "Pausada" },
  { value: "expirada", label: "Expirada" },
];

const VAZIO = {
  empresa_id: "",
  titulo: "",
  slug: "",
  categoria_id: "",
  descricao: "",
  imagem_url: "",
  preco_anterior: "",
  preco_promocional: "",
  inicio_em: "",
  fim_em: "",
  status: "rascunho" as StatusPromocao,
  destaque: false,
  ordem_destaque: "0",
};

const TIPOS_IMAGEM = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function paraDataLocal(valor?: string | null) {
  if (!valor) return "";

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "";

  const deslocamento = data.getTimezoneOffset() * 60_000;

  return new Date(data.getTime() - deslocamento)
    .toISOString()
    .slice(0, 16);
}

function paraIso(valor: string) {
  if (!valor) return null;

  const data = new Date(valor);

  return Number.isNaN(data.getTime())
    ? null
    : data.toISOString();
}

function dinheiro(valor?: number | null) {
  if (valor == null) return "—";

  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dataFormatada(valor?: string | null) {
  if (!valor) return "Sem data";

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "Data inválida";

  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function PromocoesAdmin() {
  const session = useAuthSession((s) => s.session);
  const queryClient = useQueryClient();
  const token = session?.accessToken;

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [buscaEmpresa, setBuscaEmpresa] = useState("");
  const [form, setForm] = useState({ ...VAZIO });

  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState("");
  const [removerImagem, setRemoverImagem] = useState(false);
  const [enviandoImagem, setEnviandoImagem] = useState(false);

  const {
    data: promocoes = [],
    isLoading,
    isFetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ["plataforma-promocoes"],
    queryFn: () =>
      listarPromocoesAdmin({ data: { token: token! } }),
    enabled: !!token,
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ["plataforma-empresas"],
    queryFn: () =>
      listEmpresasAdmin({ data: { token: token! } }),
    enabled: !!token,
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias-promocoes"],
    queryFn: () => listarCategoriasPromocao({ data: {} }),
  });

  const empresasOpcoes = empresas as EmpresaOpcao[];

  const empresasFiltradas = empresasOpcoes
    .filter((empresa) =>
      empresa.nome
        .toLowerCase()
        .includes(buscaEmpresa.trim().toLowerCase()),
    )
    .slice(0, 30);

  const salvarMutation = useMutation({
    mutationFn: (promocao: NovaPromocaoInput) =>
      savePromocao({
        data: { token: token!, promocao },
      }),
    onSuccess: async () => {
      toast.success(
        editandoId
          ? "Promoção atualizada."
          : "Promoção cadastrada.",
      );

      await queryClient.invalidateQueries({
        queryKey: ["plataforma-promocoes"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["promocoes"],
      });

      limparFormulario();
    },
    onError: (erro) => {
      toast.error(
        erro instanceof Error
          ? erro.message
          : "Não foi possível salvar a promoção.",
      );
    },
  });

  const excluirMutation = useMutation({
    mutationFn: (id: string) =>
      deletePromocao({
        data: { token: token!, id },
      }),
    onSuccess: async () => {
      toast.success("Promoção excluída.");

      await queryClient.invalidateQueries({
        queryKey: ["plataforma-promocoes"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["promocoes"],
      });
    },
    onError: (erro) => {
      toast.error(
        erro instanceof Error
          ? erro.message
          : "Não foi possível excluir a promoção.",
      );
    },
  });

  function liberarPreview() {
    if (imagemPreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagemPreview);
    }
  }

  function limparFormulario() {
    liberarPreview();
    setImagemArquivo(null);
    setImagemPreview("");
    setRemoverImagem(false);
    setForm({ ...VAZIO });
    setEditandoId(null);
    setBuscaEmpresa("");
    setFormAberto(false);
  }

  function abrirNovoFormulario() {
    liberarPreview();
    setImagemArquivo(null);
    setImagemPreview("");
    setRemoverImagem(false);
    setForm({ ...VAZIO });
    setEditandoId(null);
    setBuscaEmpresa("");
    setFormAberto(true);
  }

  function alterar<K extends keyof typeof VAZIO>(
    campo: K,
    valor: (typeof VAZIO)[K],
  ) {
    setForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function selecionarImagem(arquivo?: File) {
    if (!arquivo) return;

    if (!TIPOS_IMAGEM.includes(arquivo.type)) {
      toast.error("Use JPG, PNG, WEBP ou GIF.");
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5 MB.");
      return;
    }

    liberarPreview();

    setImagemArquivo(arquivo);
    setImagemPreview(URL.createObjectURL(arquivo));
    setRemoverImagem(false);
  }

  function limparImagemSelecionada() {
    liberarPreview();
    setImagemArquivo(null);
    setImagemPreview("");
    setRemoverImagem(true);
    alterar("imagem_url", "");
  }



async function enviarImagem(): Promise<string | null> {
  if (removerImagem && !imagemArquivo) {
    return null;
  }

  if (!imagemArquivo) {
    return form.imagem_url || null;
  }

  if (!token) {
    throw new Error("Sessão administrativa não encontrada.");
  }

  setEnviandoImagem(true);

  try {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result !== "string") {
          reject(new Error("Não foi possível ler a imagem."));
          return;
        }

        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(new Error("Falha ao ler o arquivo."));
      };

      reader.readAsDataURL(imagemArquivo);
    });

    const resultado = await uploadImagemPromocao({
      data: {
        token,
        nome: imagemArquivo.name,
        tipo: imagemArquivo.type,
        base64,
      },
    });

    return resultado.url;
  } finally {
    setEnviandoImagem(false);
  }
}

  function iniciarEdicao(promocao: PromocaoAdmin) {
    liberarPreview();

    setImagemArquivo(null);
    setImagemPreview("");
    setRemoverImagem(false);

    setEditandoId(promocao.id);

    setForm({
      empresa_id: promocao.empresa_id,
      titulo: promocao.titulo,
      slug: promocao.slug ?? "",
      categoria_id: promocao.categoria_id ?? "",
      descricao: promocao.descricao ?? "",
      imagem_url: promocao.imagem_url ?? "",
      preco_anterior:
        promocao.preco_anterior == null
          ? ""
          : String(promocao.preco_anterior),
      preco_promocional:
        promocao.preco_promocional == null
          ? ""
          : String(promocao.preco_promocional),
      inicio_em: paraDataLocal(promocao.inicio_em),
      fim_em: paraDataLocal(promocao.fim_em),
      status: promocao.status,
      destaque: promocao.destaque,
      ordem_destaque: String(
        promocao.ordem_destaque ?? 0,
      ),
    });

    const empresaAtual = empresasOpcoes.find(
      (empresa) => empresa.id === promocao.empresa_id,
    );

    setBuscaEmpresa(empresaAtual?.nome ?? "");
    setFormAberto(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function enviarFormulario(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();

    if (!form.empresa_id) {
      toast.error("Pesquise e selecione uma empresa.");
      return;
    }

    if (!form.titulo.trim()) {
      toast.error("Informe o título da promoção.");
      return;
    }

    const anterior =
      form.preco_anterior.trim() === ""
        ? null
        : Number(form.preco_anterior);

    const promocional =
      form.preco_promocional.trim() === ""
        ? null
        : Number(form.preco_promocional);

    if (
      anterior !== null &&
      (!Number.isFinite(anterior) || anterior < 0)
    ) {
      toast.error("Preço anterior inválido.");
      return;
    }

    if (
      promocional !== null &&
      (!Number.isFinite(promocional) || promocional < 0)
    ) {
      toast.error("Preço promocional inválido.");
      return;
    }

    if (
      anterior !== null &&
      promocional !== null &&
      promocional > anterior
    ) {
      toast.error(
        "O preço promocional não pode ser maior que o anterior.",
      );
      return;
    }

    const inicio = paraIso(form.inicio_em);
    const fim = paraIso(form.fim_em);

    if (form.inicio_em && !inicio) {
      toast.error("Data de início inválida.");
      return;
    }

    if (form.fim_em && !fim) {
      toast.error("Data de término inválida.");
      return;
    }

    if (inicio && fim && new Date(fim) < new Date(inicio)) {
      toast.error(
        "A data de término deve ser posterior à data de início.",
      );
      return;
    }

    let imagemUrl: string | null;

    try {
      imagemUrl = await enviarImagem();
    } catch (erro) {
      toast.error(
        erro instanceof Error
          ? erro.message
          : "Não foi possível enviar a imagem.",
      );
      return;
    }

const promocao: NovaPromocaoInput = {
  id: editandoId ?? undefined,
  empresa_id: form.empresa_id,
  titulo: form.titulo.trim(),
  slug: form.slug.trim() || undefined,
  categoria_negocio_id: form.categoria_id || null,
  descricao: form.descricao.trim() || null,
  imagem_url: imagemUrl,
  preco_anterior: anterior,
  preco_promocional: promocional,
  inicio_em: inicio,
  fim_em: fim,
  status: form.status,
  destaque: form.destaque,
  ordem_destaque: form.destaque
    ? Math.max(0, Number(form.ordem_destaque) || 0)
    : 0,
};


    salvarMutation.mutate(promocao);
  }

  const promocoesFiltradas = (
    promocoes as PromocaoAdmin[]
  ).filter((promocao) => {
    const termo = busca.trim().toLowerCase();

    const nomeEmpresa =
      promocao.empresa_nome ??
      empresasOpcoes.find(
        (empresa) => empresa.id === promocao.empresa_id,
      )?.nome ??
      "";

    const correspondeBusca =
      !termo ||
      promocao.titulo.toLowerCase().includes(termo) ||
      nomeEmpresa.toLowerCase().includes(termo) ||
      (promocao.slug ?? "").toLowerCase().includes(termo);

    const correspondeStatus =
      filtroStatus === "todos" ||
      promocao.status === filtroStatus;

    return correspondeBusca && correspondeStatus;
  });

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold">Promoções</h1>
            <p className="text-sm text-muted-foreground">
              Cadastre e gerencie as ofertas do Trapeza.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  isFetching ? "animate-spin" : ""
                }`}
              />
              Atualizar
            </Button>

            <Button
              onClick={() =>
                formAberto
                  ? limparFormulario()
                  : abrirNovoFormulario()
              }
            >
              {formAberto ? (
                <X className="mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {formAberto ? "Fechar formulário" : "Nova promoção"}
            </Button>

            <Button variant="outline" asChild>
              <Link to="/plataforma">Voltar ao painel</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        {formAberto && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editandoId
                  ? "Editar promoção"
                  : "Cadastrar promoção"}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={enviarFormulario}
                className="space-y-5"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="busca-empresa">
                      Empresa *
                    </Label>

                    {!form.empresa_id ? (
                      <>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="busca-empresa"
                            className="pl-9"
                            value={buscaEmpresa}
                            onChange={(evento) =>
                              setBuscaEmpresa(evento.target.value)
                            }
                            placeholder="Digite o nome da empresa..."
                            autoComplete="off"
                          />
                        </div>

                        {buscaEmpresa.trim() && (
                          <div className="max-h-60 overflow-y-auto rounded-lg border">
                            {empresasFiltradas.length > 0 ? (
                              <>
                                {empresasFiltradas.map((empresa) => (
                                  <button
                                    key={empresa.id}
                                    type="button"
                                    className="flex w-full items-center justify-between border-b px-3 py-3 text-left last:border-b-0 hover:bg-muted"
                                    onClick={() => {
                                      alterar(
                                        "empresa_id",
                                        empresa.id,
                                      );
                                      setBuscaEmpresa(empresa.nome);
                                    }}
                                  >
                                    <span className="font-medium">
                                      {empresa.nome}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      Selecionar
                                    </span>
                                  </button>
                                ))}

                                {empresasFiltradas.length === 30 && (
                                  <p className="border-t p-2 text-center text-xs text-muted-foreground">
                                    Exibindo até 30 resultados. Refine a busca.
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="p-3 text-sm text-muted-foreground">
                                Nenhuma empresa encontrada.
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 p-3">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Empresa selecionada
                          </p>
                          <p className="truncate font-medium">
                            {empresasOpcoes.find(
                              (empresa) =>
                                empresa.id === form.empresa_id,
                            )?.nome ?? "Empresa selecionada"}
                          </p>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            alterar("empresa_id", "");
                            setBuscaEmpresa("");
                          }}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Trocar
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={form.titulo}
                      onChange={(evento) =>
                        alterar("titulo", evento.target.value)
                      }
                      placeholder="Ex.: Gás de cozinha em oferta"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (opcional)</Label>
                    <Input
                      id="slug"
                      value={form.slug}
                      onChange={(evento) =>
                        alterar("slug", evento.target.value)
                      }
                      placeholder="gas-de-cozinha-em-oferta"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select
                      value={form.categoria_id || "__nenhuma__"}
                      onValueChange={(valor) =>
                        alterar(
                          "categoria_id",
                          valor === "__nenhuma__" ? "" : valor,
                        )
                      }
                    >
                      <SelectTrigger id="categoria">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__nenhuma__">
                          Sem categoria
                        </SelectItem>
                        {(categorias as PromocaoCategoria[]).map(
                          (categoria) => (
                            <SelectItem
                              key={categoria.id}
                              value={categoria.id}
                            >
                              {categoria.emoji
                                ? `${categoria.emoji} `
                                : ""}
                              {categoria.nome}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preco-anterior">
                      Preço anterior (R$)
                    </Label>
                    <Input
                      id="preco-anterior"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.preco_anterior}
                      onChange={(evento) =>
                        alterar(
                          "preco_anterior",
                          evento.target.value,
                        )
                      }
                      placeholder="120.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preco-promocional">
                      Preço promocional (R$)
                    </Label>
                    <Input
                      id="preco-promocional"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.preco_promocional}
                      onChange={(evento) =>
                        alterar(
                          "preco_promocional",
                          evento.target.value,
                        )
                      }
                      placeholder="99.90"
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="imagem-upload">
                      Foto da promoção
                    </Label>

                    <label
                      htmlFor="imagem-upload"
                      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition hover:bg-muted/50"
                    >
                      <ImagePlus className="h-8 w-8 text-muted-foreground" />
                      <span className="font-medium">
                        Clique para escolher uma foto
                      </span>
                      <span className="text-xs text-muted-foreground">
                        JPG, PNG, WEBP ou GIF · Máximo 5 MB
                      </span>
                    </label>

                    <Input
                      id="imagem-upload"
                      className="sr-only"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(evento) => {
                        selecionarImagem(
                          evento.target.files?.[0],
                        );
                        evento.target.value = "";
                      }}
                    />

                    {(imagemPreview ||
                      (!removerImagem && form.imagem_url)) && (
                      <div className="space-y-2">
                        <img
                          src={
                            imagemPreview || form.imagem_url
                          }
                          alt="Prévia da promoção"
                          className="aspect-video max-h-72 w-full rounded-xl border bg-muted object-contain"
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={limparImagemSelecionada}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remover foto
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(valor) =>
                        alterar(
                          "status",
                          valor as StatusPromocao,
                        )
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS.map((status) => (
                          <SelectItem
                            key={status.value}
                            value={status.value}
                          >
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inicio">
                      Início da promoção
                    </Label>
                    <Input
                      id="inicio"
                      type="datetime-local"
                      value={form.inicio_em}
                      onChange={(evento) =>
                        alterar("inicio_em", evento.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fim">
                      Término da promoção
                    </Label>
                    <Input
                      id="fim"
                      type="datetime-local"
                      value={form.fim_em}
                      onChange={(evento) =>
                        alterar("fim_em", evento.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={form.descricao}
                      onChange={(evento) =>
                        alterar("descricao", evento.target.value)
                      }
                      placeholder="Detalhes, condições e informações da oferta..."
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-lg border p-4 md:col-span-2">
                    <div>
                      <Label htmlFor="destaque">
                        Destacar promoção
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Prioriza esta oferta na ordenação do feed.
                      </p>
                    </div>
                    <Switch
                      id="destaque"
                      checked={form.destaque}
                      onCheckedChange={(marcado) =>
                        alterar("destaque", marcado)
                      }
                    />
                  </div>

                  {form.destaque && (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="ordem">
                        Ordem do destaque
                      </Label>
                      <Input
                        id="ordem"
                        type="number"
                        min="0"
                        step="1"
                        value={form.ordem_destaque}
                        onChange={(evento) =>
                          alterar(
                            "ordem_destaque",
                            evento.target.value,
                          )
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    disabled={
                      salvarMutation.isPending ||
                      enviandoImagem
                    }
                  >
                    {enviandoImagem
                      ? "Enviando foto..."
                      : salvarMutation.isPending
                        ? "Salvando..."
                        : editandoId
                          ? "Salvar alterações"
                          : "Cadastrar promoção"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={limparFormulario}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Total de promoções
              </p>
              <p className="mt-1 text-3xl font-bold">
                {promocoes.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Ativas
              </p>
              <p className="mt-1 text-3xl font-bold">
                {promocoes.filter(
                  (p) => p.status === "ativa",
                ).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Rascunhos
              </p>
              <p className="mt-1 text-3xl font-bold">
                {promocoes.filter(
                  (p) => p.status === "rascunho",
                ).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Destaques
              </p>
              <p className="mt-1 text-3xl font-bold">
                {promocoes.filter((p) => p.destaque).length}
              </p>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Promoções cadastradas
            </CardTitle>

            <div className="grid gap-3 pt-3 sm:grid-cols-2">
              <Input
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                placeholder="Buscar por título, empresa ou slug..."
              />

              <Select
                value={filtroStatus}
                onValueChange={setFiltroStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">
                    Todos os status
                  </SelectItem>
                  {STATUS.map((status) => (
                    <SelectItem
                      key={status.value}
                      value={status.value}
                    >
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Carregando promoções...
              </p>
            ) : error ? (
              <p className="py-8 text-center text-sm text-destructive">
                Não foi possível carregar as promoções.
                Verifique o acesso administrativo e o backend.
              </p>
            ) : promocoesFiltradas.length === 0 ? (
              <div className="py-10 text-center">
                <Tag className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="font-medium">
                  Nenhuma promoção encontrada
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cadastre uma promoção ou altere os filtros.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(promocoesFiltradas as PromocaoAdmin[]).map(
                  (promocao) => (
                    <div
                      key={promocao.id}
                      className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center"
                    >
                      {promocao.imagem_url ? (
                        <img
                          src={promocao.imagem_url}
                          alt=""
                          className="h-24 w-full rounded-lg object-cover sm:w-32"
                        />
                      ) : (
                        <div className="flex h-24 w-full items-center justify-center rounded-lg bg-muted sm:w-32">
                          <Tag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">
                            {promocao.titulo}
                          </h3>

                          <Badge
                            variant={
                              promocao.status === "ativa"
                                ? "default"
                                : promocao.status === "pausada"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {STATUS.find(
                              (s) => s.value === promocao.status,
                            )?.label ?? promocao.status}
                          </Badge>

                          {promocao.destaque && (
                            <Badge variant="secondary">
                              Destaque
                            </Badge>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {promocao.empresa_nome ??
                            empresasOpcoes.find(
                              (empresa) =>
                                empresa.id === promocao.empresa_id,
                            )?.nome ??
                            "Empresa não identificada"}
                        </p>

                        <p className="mt-2 text-sm">
                          {promocao.preco_anterior != null && (
                            <span className="mr-2 text-muted-foreground line-through">
                              {dinheiro(promocao.preco_anterior)}
                            </span>
                          )}
                          <span className="font-semibold">
                            {dinheiro(promocao.preco_promocional)}
                          </span>
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Início: {dataFormatada(promocao.inicio_em)}
                          {" · "}
                          Fim: {dataFormatada(promocao.fim_em)}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => iniciarEdicao(promocao)}
                        >
                          <Pencil className="mr-1.5 h-4 w-4" />
                          Editar
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={excluirMutation.isPending}
                          onClick={() => {
                            const confirmou = window.confirm(
                              `Excluir a promoção "${promocao.titulo}"? Essa ação não pode ser desfeita.`,
                            );

                            if (confirmou) {
                              excluirMutation.mutate(promocao.id);
                            }
                          }}
                        >
                          <Trash2 className="mr-1.5 h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}