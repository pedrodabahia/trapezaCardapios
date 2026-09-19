import { useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  categoriaNegocioId: string;
};

const vazio: Formulario = {
  nomeEmpresa: "",
  nomeResponsavel: "",
  whatsapp: "",
  email: "",
  cidade: "",
  categoriaNegocioId: "",
};

export function BusinessSignupCTA() {
  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState<Formulario>(vazio);
  const { data: categorias = [] } = useCategoriasNegocio();

  // Só a folha da árvore: a empresa escolhe a atividade específica, não
  // uma categoria pai genérica. Se ainda não houver categorias aninhadas,
  // o campo permanece vazio e explica o motivo sem enviar dado incompleto.
  const subcategorias = useMemo(
    () => categorias.filter((categoria) => categoria.categoria_pai_id !== null),
    [categorias],
  );

  function fechar() {
    setAberto(false);
    setEnviado(false);
    setForm(vazio);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.categoriaNegocioId) {
      toast.error("Escolha a atividade que mais combina com seu negócio.");
      return;
    }
    setEnviando(true);
    try {
      await criarCadastroInteresse({ data: form });
      setEnviado(true);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível enviar seu cadastro.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
        <div className="group relative overflow-hidden rounded-3xl border border-brand-brown/10 bg-gradient-to-r from-brand-cream via-[#fff8ea] to-brand-yellow/35 px-5 py-5 shadow-sm transition sm:px-7 sm:py-6">
          <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-brand-red/10 blur-2xl transition group-hover:scale-125" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-brown text-brand-yellow shadow-sm">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-red">Para quem empreende</p>
                <h2 className="font-display text-lg font-extrabold text-brand-brown sm:text-xl">
                  Sua empresa já apareceu no Trapeza?
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">Tem uma ideia boa para colocar ela no mapa.</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAberto(true)}
              className="w-full rounded-full border-brand-brown/30 bg-background/70 font-bold text-brand-brown hover:border-brand-brown hover:bg-brand-brown hover:text-white sm:w-auto"
            >
              Descobrir como <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={aberto} onOpenChange={(open) => (open ? setAberto(true) : fechar())}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          {enviado ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
              <DialogTitle className="mt-4 text-2xl">Cadastro recebido!</DialogTitle>
              <DialogDescription className="mx-auto mt-3 max-w-sm leading-relaxed">
                Valeu pelo interesse. Nosso time vai analisar seu negócio e entrar em contato pelo WhatsApp informado.
              </DialogDescription>
              <Button className="mt-6 rounded-full" onClick={fechar}>Fechar</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Leve sua empresa para o Trapeza</DialogTitle>
                <DialogDescription>
                  Preencha seus dados. É gratuito e sem compromisso — falamos com você antes de publicar qualquer coisa.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={enviar}>
                <div>
                  <Label htmlFor="lead-empresa">Nome da empresa</Label>
                  <Input id="lead-empresa" required value={form.nomeEmpresa} onChange={(e) => setForm({ ...form, nomeEmpresa: e.target.value })} placeholder="Ex.: Pizzaria do João" />
                </div>
                <div>
                  <Label htmlFor="lead-responsavel">Seu nome</Label>
                  <Input id="lead-responsavel" required value={form.nomeResponsavel} onChange={(e) => setForm({ ...form, nomeResponsavel: e.target.value })} placeholder="Quem cuida do negócio?" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="lead-whatsapp">WhatsApp com DDD</Label>
                    <Input id="lead-whatsapp" required inputMode="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="(73) 99999-9999" />
                  </div>
                  <div>
                    <Label htmlFor="lead-cidade">Cidade</Label>
                    <Input id="lead-cidade" required value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="Sua cidade" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="lead-email">E-mail <span className="text-muted-foreground">(opcional)</span></Label>
                  <Input id="lead-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="voce@empresa.com" />
                </div>
                <div>
                  <Label htmlFor="lead-categoria">Qual é a atividade da empresa?</Label>
                  <select
                    id="lead-categoria"
                    required
                    value={form.categoriaNegocioId}
                    onChange={(e) => setForm({ ...form, categoriaNegocioId: e.target.value })}
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Selecione uma atividade</option>
                    {subcategorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.label}</option>)}
                  </select>
                  {subcategorias.length === 0 && <p className="mt-1 text-xs text-muted-foreground">As atividades específicas ainda estão sendo configuradas.</p>}
                </div>
                <Button className="w-full rounded-full" type="submit" disabled={enviando || subcategorias.length === 0}>
                  {enviando ? "Enviando..." : "Enviar meu cadastro gratuito"}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
