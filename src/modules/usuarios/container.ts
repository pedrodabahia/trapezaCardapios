import { container } from "@/core/container";
import type { AuthRepository } from "./repositories/auth.repository";
import { SupabaseAuthRepository } from "./repositories/auth.repository";
import type { UsuarioRepository } from "./repositories/usuario.repository";
import { SupabaseUsuarioRepository } from "./repositories/usuario.repository";
import { AuthService } from "./services/auth.service";

declare module "@/core/container" {
  interface Cradle {
    authRepository: AuthRepository;
    usuarioRepository: UsuarioRepository;
    authService: AuthService;
  }
}

container.register("authRepository", () => new SupabaseAuthRepository());
container.register("usuarioRepository", () => new SupabaseUsuarioRepository());
container.register(
  "authService",
  (c) => new AuthService(c.resolve("authRepository"), c.resolve("usuarioRepository")),
);
