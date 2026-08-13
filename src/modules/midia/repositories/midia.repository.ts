import { adminClient } from "@/core/database/supabase-admin";

export interface MidiaRepository {
  // Sobe um arquivo (já em bytes) pro bucket público "imagens" e retorna a
  // URL pública. path é relativo dentro do bucket, ex: "empresa123/produtos/nome.jpg".
  upload(path: string, bytes: Uint8Array, contentType: string): Promise<{ url: string }>;
}

export class SupabaseMidiaRepository implements MidiaRepository {
  private sb() {
    return adminClient();
  }

  async upload(path: string, bytes: Uint8Array, contentType: string): Promise<{ url: string }> {
    const { error } = await this.sb()
      .storage.from("imagens")
      .upload(path, bytes, { contentType, upsert: true });
    if (error) throw new Error(`Falha ao subir imagem: ${error.message}`);

    const { data } = this.sb().storage.from("imagens").getPublicUrl(path);
    return { url: data.publicUrl };
  }
}
