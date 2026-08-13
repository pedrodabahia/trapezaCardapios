import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminSession = {
  accessToken: string;
  refreshToken: string;
  email: string;
  empresaId: string | null;
  role: "admin" | "super_admin";
};

type State = {
  session: AdminSession | null;
  setSession: (s: AdminSession) => void;
  clear: () => void;
};

// Sessão do admin (tenant) ou do super-admin (plataforma).
// Chave única "current-session" — sobrescreve a anterior; nunca
// coexistem dois admins logados no mesmo browser.
export const useAuthSession = create<State>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      clear: () => set({ session: null }),
    }),
    { name: "pedidopronto-session" },
  ),
);