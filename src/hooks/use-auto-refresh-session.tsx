import { useEffect, useRef } from "react";
import { useAuthSession } from "@/lib/auth-session";
import { refreshAdminSession } from "@/lib/admin-server";

// Decodifica só o "exp" do JWT (sem validar assinatura — isso aqui é só
// pra saber QUANDO agendar o refresh, não é usado pra autorizar nada;
// a validação de verdade sempre acontece no servidor via requireSession).
function getExpiryMs(token: string): number | null {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

// Mantém a sessão do admin viva: agenda a renovação do access token um
// pouco antes dele expirar (Supabase costuma dar ~1h de validade), pra
// quem fica com o painel aberto o dia inteiro não cair no meio do uso.
// Chame esse hook uma vez perto da raiz do app (ex: __root.tsx).
export function useAutoRefreshSession() {
  const session = useAuthSession((s) => s.session);
  const setSession = useAuthSession((s) => s.setSession);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!session) return;

    const expMs = getExpiryMs(session.accessToken);
    // Se não der pra ler o exp, tenta de novo em 5min em vez de nunca.
    const msAteRefresh = expMs
      ? Math.max(5_000, expMs - Date.now() - 2 * 60_000) // 2min de folga
      : 5 * 60_000;

    timerRef.current = setTimeout(async () => {
      try {
        const res = await refreshAdminSession({
          data: { refreshToken: session.refreshToken },
        });
        if (res.ok) {
          setSession({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            email: res.email || session.email,
            empresaId: res.empresaId ?? session.empresaId,
            role: res.role,
          });
        }
        // Se falhar (refresh token realmente expirado/inválido), não
        // desloga na hora — deixa a próxima chamada autenticada falhar
        // com um erro claro e o usuário loga de novo. Evita deslogar
        // por causa de um erro de rede passageiro.
      } catch {
        // idem: falha de rede não desloga ninguém.
      }
    }, msAteRefresh);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [session?.accessToken, session?.refreshToken]);
}
