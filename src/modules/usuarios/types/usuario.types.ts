export type AdminRole = "admin" | "super_admin";

export type AdminLoginResult =
  | {
      ok: true;
      accessToken: string;
      refreshToken: string;
      empresaId: string | null;
      role: AdminRole;
      email: string;
    }
  | { ok: false; error: string };

export type PlatformLoginResult =
  | { ok: true; accessToken: string; refreshToken: string; email: string }
  | { ok: false; error: string };
