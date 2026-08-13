import { a as container, t as adminClient } from "./session-DEfiku9J.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/container-8xUqQOV3.js
var SupabaseMidiaRepository = class {
	sb() {
		return adminClient();
	}
	async upload(path, bytes, contentType) {
		const { error } = await this.sb().storage.from("imagens").upload(path, bytes, {
			contentType,
			upsert: true
		});
		if (error) throw new Error(`Falha ao subir imagem: ${error.message}`);
		const { data } = this.sb().storage.from("imagens").getPublicUrl(path);
		return { url: data.publicUrl };
	}
};
var TAMANHO_MAX_BYTES = 5242880;
var TIPOS_PERMITIDOS = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif"
];
function extensaoPorContentType(contentType) {
	switch (contentType) {
		case "image/png": return "png";
		case "image/webp": return "webp";
		case "image/gif": return "gif";
		default: return "jpg";
	}
}
function base64ParaBytes(base64) {
	const binario = atob(base64);
	const bytes = new Uint8Array(binario.length);
	for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
	return bytes;
}
var MidiaService = class {
	repository;
	constructor(repository) {
		this.repository = repository;
	}
	async uploadImagem(opts) {
		if (!TIPOS_PERMITIDOS.includes(opts.contentType)) throw new Error("Formato de imagem não suportado. Use JPG, PNG, WEBP ou GIF.");
		const bytes = base64ParaBytes(opts.base64Data);
		if (bytes.length > TAMANHO_MAX_BYTES) throw new Error("Imagem muito grande. Tamanho máximo: 5MB.");
		const ext = extensaoPorContentType(opts.contentType);
		const nomeArquivo = `${crypto.randomUUID()}.${ext}`;
		const path = `${opts.empresaId}/${opts.pasta}/${nomeArquivo}`;
		return this.repository.upload(path, bytes, opts.contentType);
	}
};
container.register("midiaRepository", () => new SupabaseMidiaRepository());
container.register("midiaService", (c) => new MidiaService(c.resolve("midiaRepository")));
//#endregion
export {};
