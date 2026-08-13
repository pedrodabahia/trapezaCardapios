// Cliente Supabase Auth com a chave anônima (não é o admin/service_role) —
// usado só pra login/refresh, que precisam passar pelo fluxo normal de
// autenticação do Supabase.
async function anonAuthClient() {
  const sbUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!sbUrl || !anonKey) throw new Error("Server misconfigured");
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(sbUrl, anonKey, { auth: { persistSession: false } });
}

// Resultado "cru" da sessão — sem nenhuma regra de negócio aplicada ainda
// (isso fica no AuthService, que decide o que cada fluxo de login exige).
export type AuthSessionRaw =
  | {
      ok: true;
      accessToken: string;
      refreshToken: string;
      empresaId: string | null;
      role: string | null;
      email: string;
    }
  | { ok: false; error: string };

export interface AuthRepository {
  signInWithPassword(email: string, password: string): Promise<AuthSessionRaw>;
  refreshSession(refreshToken: string): Promise<AuthSessionRaw>;
}

export class SupabaseAuthRepository implements AuthRepository {
  async signInWithPassword(email: string, password: string): Promise<AuthSessionRaw> {
    const auth = await anonAuthClient();
    const { data: session, error } = await auth.auth.signInWithPassword({ email, password });
    if (error || !session.session) {
      return { ok: false, error: error?.message ?? "Invalid credentials" };
    }
    const appMeta = (session.user.app_metadata ?? {}) as {
      empresa_id?: string;
      role?: string;
    };
    return {
      ok: true,
      accessToken: session.session.access_token,
      refreshToken: session.session.refresh_token,
      empresaId: appMeta.empresa_id ?? null,
      role: appMeta.role ?? null,
      email: session.user.email ?? email,
    };
  }

  async refreshSession(refreshToken: string): Promise<AuthSessionRaw> {
    const auth = await anonAuthClient();
    const { data: session, error } = await auth.auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (error || !session.session || !session.user) {
      return { ok: false, error: error?.message ?? "Refresh failed" };
    }
    const appMeta = (session.user.app_metadata ?? {}) as {
      empresa_id?: string;
      role?: string;
    };
    return {
      ok: true,
      accessToken: session.session.access_token,
      refreshToken: session.session.refresh_token,
      empresaId: appMeta.empresa_id ?? null,
      role: appMeta.role ?? null,
      email: session.user.email ?? "",
    };
  }
}
