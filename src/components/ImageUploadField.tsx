import { useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { uploadImagem } from "@/lib/admin-server";

// Campo de imagem com duas formas de preencher: colar uma URL, ou enviar um
// arquivo do dispositivo (computador ou celular — o <input type="file"> já
// abre o seletor nativo, que no celular inclui câmera/galeria sem precisar
// de código extra). Usado tanto no form de Produto quanto no de Categoria.
export function ImageUploadField({
  label,
  value,
  onChange,
  token,
  empresaId,
  pasta,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  token: string;
  empresaId: string;
  pasta: "produtos" | "categorias" | "logo";
}) {
  const [enviando, setEnviando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function lerArquivoComoBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // reader.result vem como "data:image/png;base64,AAAA..." — a gente
        // só quer a parte depois da vírgula.
        const result = reader.result as string;
        resolve(result.split(",")[1] ?? "");
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite escolher o mesmo arquivo de novo depois
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Escolha um arquivo de imagem");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máximo 5MB)");
      return;
    }

    setEnviando(true);
    try {
      const base64Data = await lerArquivoComoBase64(file);
      const result = await uploadImagem({
        data: { token, empresaId, pasta, contentType: file.type, base64Data },
      });
      onChange(result.url);
      toast.success("Imagem enviada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar imagem");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cole uma URL..."
        />
        <Button
          type="button"
          variant="outline"
          disabled={enviando}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-1 h-3 w-3" />
          {enviando ? "Enviando..." : "Enviar arquivo"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileSelected}
        />
      </div>
      {value && (
        <img
          src={value}
          alt="Pré-visualização"
          className="mt-2 h-16 w-16 rounded-lg object-cover"
        />
      )}
    </div>
  );
}
