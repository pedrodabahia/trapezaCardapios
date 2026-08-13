import { container } from "@/core/container";
import type { CategoriaRepository } from "./repositories/categoria.repository";
import { SupabaseCategoriaRepository } from "./repositories/categoria.repository";
import { CategoriaService } from "./services/categoria.service";

declare module "@/core/container" {
  interface Cradle {
    categoriaRepository: CategoriaRepository;
    categoriaService: CategoriaService;
  }
}

container.register("categoriaRepository", () => new SupabaseCategoriaRepository());
container.register("categoriaService", (c) => new CategoriaService(c.resolve("categoriaRepository")));
