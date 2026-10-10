
import { createServerFn } from "@tanstack/react-start";
import { adminClient, requireSession } from "@/lib/supabase-server-auth";

type UploadPromocaoInput = {
  token: string;
  nome: string;
  tipo: string;
  base64: string;
};

const TIPOS_PERMITIDOS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const uploadImagemPromocao = createServerFn({
  method: "POST",
})
  .validator((data: UploadPromocaoInput) => data)
  .handler(async ({ data }) => {
    await requireSession(data.token);

    const extensao = TIPOS_PERMITIDOS[data.tipo];

    if (!extensao) {
      throw new Error("Formato não permitido.");
    }

    if (
      typeof data.base64 !== "string" ||
      data.base64.length > 7_000_000
    ) {
      throw new Error("Imagem inválida ou maior que 5 MB.");
    }

    const correspondencia = data.base64.match(
      /^data:image\/(?:jpeg|png|webp|gif);base64,(.+)$/
    );

    if (!correspondencia) {
      throw new Error("Conteúdo da imagem inválido.");
    }

    const bytes = Buffer.from(correspondencia[1], "base64");

    if (bytes.length === 0 || bytes.length > 5 * 1024 * 1024) {
      throw new Error("A imagem deve ter no máximo 5 MB.");
    }

    const extensaoReal = TIPOS_PERMITIDOS[data.tipo];
    const caminho = `${crypto.randomUUID()}.${extensaoReal}`;

    const supabase = adminClient();

    const { error } = await supabase.storage
      .from("promocoes")
      .upload(caminho, bytes, {
        contentType: data.tipo,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Erro no upload: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("promocoes")
      .getPublicUrl(caminho);

    return { url: urlData.publicUrl, caminho };
  });