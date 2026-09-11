import { createServerFn } from "@tanstack/react-start";
import { container } from "@/core/container";
import { authTenantAtivo, authPlatform } from "@/core/auth/session";
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
      pasta: "produtos" | "categorias" | "logo" | "capa";
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

// Mesma coisa, mas autenticada como SUPER-ADMIN em vez de dono de
// empresa — usada nos formulários de /plataforma (cadastrar/editar
// qualquer empresa, inclusive externa). `pastaId` normalmente é o id da
// empresa, mas no formulário de "nova empresa externa" ela ainda não
// existe no banco nesse momento — nesse caso o front manda um id
// temporário (gerado só pra organizar a pasta no Storage; não precisa
// bater com o id final da empresa).
export const uploadImagemPlataforma = createServerFn({ method: "POST" })
  .validator(
    (d: {
      token: string;
      pastaId: string;
      pasta: "produtos" | "categorias" | "logo" | "capa";
      contentType: string;
      base64Data: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    await authPlatform(data.token);
    const midiaService = container.resolve("midiaService");
    const { url } = await midiaService.uploadImagem({
      empresaId: data.pastaId,
      pasta: data.pasta,
      contentType: data.contentType,
      base64Data: data.base64Data,
    });
    return { ok: true as const, url };
  });
