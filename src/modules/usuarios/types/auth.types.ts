export type LoginResult =
  | {
      ok: true;
      accessToken: string;
      refreshToken: string;
      empresaId: string | null;
      role: "admin" | "super_admin";
      email: string;
    }
  | { ok: false; error: string };

export type RefreshResult = LoginResult;

export type PlatformLoginResult =
  | { ok: true; accessToken: string; refreshToken: string; email: string }
  | { ok: false; error: string };
