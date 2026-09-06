import { useState } from "react";
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
import { CATEGORIAS_NEGOCIO } from "@/lib/categorias-negocio";

// TODO(Pedro): trocar pelo WhatsApp real da Studio Matos/Trapeza que vai
// receber os leads de cadastro (formato só dígitos, com DDI 55).
const WHATSAPP_TRAPEZA = "5573900000000";

export function FinalCTA() {
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cidade, setCidade] = useState("");
  const [categoria, setCategoria] = useState("");

  const podeEnviar = nome.trim() && empresa.trim() && whatsapp.trim();

  function enviar() {
    const categoriaLabel =
      CATEGORIAS_NEGOCIO.find((c) => c.valor === categoria)?.label ?? "";
    const linhas = [
      "Olá! Quero cadastrar minha empresa no Trapeza.",
      `Nome: ${nome}`,
      `Empresa: ${empresa}`,
      `WhatsApp: ${whatsapp}`,
      cidade && `Cidade: ${cidade}`,
      categoriaLabel && `Categoria: ${categoriaLabel}`,
    ].filter(Boolean);
    const texto = encodeURIComponent(linhas.join("\n"));
    window.open(`https://wa.me/${WHATSAPP_TRAPEZA}?text=${texto}`, "_blank");
  }

  return (
    <section className="hero-gradient text-white">
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h2 className="font-display text-3xl font-bold md:text-4xl">
          Pronto para colocar sua empresa no Trapeza?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-white/85">
          Cadastre sua empresa e comece a apresentar seus produtos para novos
          clientes.
        </p>

        <div className="mt-8 grid gap-3 rounded-3xl bg-white p-5 text-left text-brand-brown sm:grid-cols-2">
          <div>
            <Label>Seu nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div>
            <Label>Nome da empresa</Label>
            <Input value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
              placeholder="DDD + número"
            />
          </div>
          <div>
            <Label>Cidade</Label>
            <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS_NEGOCIO.map((c) => (
                  <SelectItem key={c.valor} value={c.valor}>
                    {c.emoji} {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Button
              onClick={enviar}
              disabled={!podeEnviar}
              size="lg"
              className="w-full rounded-full bg-brand-red text-white hover:bg-brand-red/90"
            >
              Quero cadastrar minha empresa
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Vamos abrir uma conversa no WhatsApp com seus dados pra gente dar
              sequência no seu cadastro.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
