import { createClient } from "@supabase/supabase-js";

// Server-only: cliente admin do Supabase (service_role). Bypassa RLS.
// Use este client em TODAS as server fns que escrevem no banco.
export function adminClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    const hasProcessEnv = typeof process !== "undefined" && !!process.env;
    const relatedKeys = hasProcessEnv
      ? Object.keys(process.env).filter((k) =>
          /SUPABASE|VERCEL|CF_|NITRO|CLOUDFLARE/i.test(k),
        )
      : [];
    throw new Error(
      `Missing Supabase server env vars — url present: ${!!url}, serviceKey present: ${!!serviceKey}, ` +
        `process.env available: ${hasProcessEnv}, related env keys seen: [${relatedKeys.join(", ")}]`,
    );
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

// Tipos dos claims que colocamos em app_metadata dos users do Supabase Auth,
// mais o id do próprio usuário (não vem do app_metadata, vem do registro
// do Supabase Auth) — precisamos dele pra ações que afetam a própria conta,
// tipo troca de senha.
export type AppMetadata = {
  id: string;
  empresa_id?: string;
  role?: "admin" | "super_admin";
};

// Valida sempre via supabase.auth.getUser (round-trip real no Supabase Auth,
// verifica assinatura e expiração). É a Única forma de validar sessão nesse
// projeto — de propósito não existe um "decode sem verificar assinatura" aqui,
// porque isso permitiria forjar um token com role:"super_admin" e qualquer
// empresa_id sem senha nenhuma. Não adicione um atalho desses de volta.
export async function requireSession(token: string): Promise<AppMetadata> {
  const sb = adminClient();
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) throw new Error("Invalid session");
  return { id: data.user.id, ...(data.user.app_metadata ?? {}) } as AppMetadata;
}