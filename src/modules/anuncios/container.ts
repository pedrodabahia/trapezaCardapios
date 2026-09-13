import { container } from "@/core/container";
import type { AnuncioRepository } from "./repositories/anuncio.repository";
import { SupabaseAnuncioRepository } from "./repositories/anuncio.repository";
import { AnuncioService } from "./services/anuncio.service";

declare module "@/core/container" {
  interface Cradle {
    anuncioRepository: AnuncioRepository;
    anuncioService: AnuncioService;
  }
}

container.register("anuncioRepository", () => new SupabaseAnuncioRepository());
container.register("anuncioService", (c) => new AnuncioService(c.resolve("anuncioRepository")));
