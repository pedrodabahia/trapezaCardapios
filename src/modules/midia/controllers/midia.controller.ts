import { createServerFn } from "@tanstack/react-start";
import { container } from "@/core/container";
import { authTenantAtivo } from "@/core/auth/session";
import "../container";

// Upload de imagem (produto, categoria ou logo da empresa) a partir do
// painel admin — usado tanto pelo picker de arquivo (computador/celular)
// quanto poderia ser usado por outros fluxos no futuro. O admin sobe a
// imagem em base64; aqui a gente decodifica, valida e manda pro Storage.
export const uploadImagem = createServerFn({ method: "POST" })
  .validator(
    (d: {
      token: string;
      empresaId: string;
      pasta: "produtos" | "categorias" | "logo";
      contentType: string;
      base64Data: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    await authTenantAtivo(data.token, data.empresaId);
    const midiaService = container.resolve("midiaService");
    const { url } = await midiaService.uploadImagem({
      empresaId: data.empresaId,
      pasta: data.pasta,
      contentType: data.contentType,
      base64Data: data.base64Data,
    });
    return { ok: true as const, url };
  });
