import type { MidiaRepository } from "../repositories/midia.repository";

const TAMANHO_MAX_BYTES = 5 * 1024 * 1024; // 5MB
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function extensaoPorContentType(contentType: string): string {
  switch (contentType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

// Decodifica base64 -> bytes usando só Web APIs padrão (atob), sem Buffer
// nem nada de "node:*". O projeto builda pra Cloudflare Workers (ver
// vite.config.ts — nitro usa cloudflare como target), que não é Node de
// verdade: APIs exclusivas de Node (Buffer, node:crypto etc) podem faltar
// ou depender de polyfill. atob/Uint8Array/crypto.randomUUID são padrão
// web e funcionam em qualquer lugar (browser, Workers, Node).
function base64ParaBytes(base64: string): Uint8Array {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i);
  }
  return bytes;
}

export class MidiaService {
  constructor(private repository: MidiaRepository) {}

  // base64Data vem sem o prefixo "data:image/...;base64," (o front já tira
  // isso antes de mandar).
  async uploadImagem(opts: {
    empresaId: string;
    pasta: "produtos" | "categorias" | "logo";
    contentType: string;
    base64Data: string;
  }): Promise<{ url: string }> {
    if (!TIPOS_PERMITIDOS.includes(opts.contentType)) {
      throw new Error("Formato de imagem não suportado. Use JPG, PNG, WEBP ou GIF.");
    }

    const bytes = base64ParaBytes(opts.base64Data);
    if (bytes.length > TAMANHO_MAX_BYTES) {
      throw new Error("Imagem muito grande. Tamanho máximo: 5MB.");
    }

    const ext = extensaoPorContentType(opts.contentType);
    const nomeArquivo = `${crypto.randomUUID()}.${ext}`;
    const path = `${opts.empresaId}/${opts.pasta}/${nomeArquivo}`;

    return this.repository.upload(path, bytes, opts.contentType);
  }
}
