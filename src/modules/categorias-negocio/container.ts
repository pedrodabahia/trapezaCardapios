import { container } from "@/core/container";
import type { CategoriaNegocioRepository } from "./repositories/categoria-negocio.repository";
import { SupabaseCategoriaNegocioRepository } from "./repositories/categoria-negocio.repository";
import { CategoriaNegocioService } from "./services/categoria-negocio.service";

declare module "@/core/container" {
  interface Cradle {
    categoriaNegocioRepository: CategoriaNegocioRepository;
    categoriaNegocioService: CategoriaNegocioService;
  }
}

container.register("categoriaNegocioRepository", () => new SupabaseCategoriaNegocioRepository());
container.register(
  "categoriaNegocioService",
  (c) => new CategoriaNegocioService(c.resolve("categoriaNegocioRepository")),
);
