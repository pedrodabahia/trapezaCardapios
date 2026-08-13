import { container } from "@/core/container";
import type { PlanoRepository } from "./repositories/plano.repository";
import { SupabasePlanoRepository } from "./repositories/plano.repository";
import { PlanoService } from "./services/plano.service";

declare module "@/core/container" {
  interface Cradle {
    planoRepository: PlanoRepository;
    planoService: PlanoService;
  }
}

container.register("planoRepository", () => new SupabasePlanoRepository());
container.register(
  "planoService",
  (c) =>
    new PlanoService(
      c.resolve("planoRepository"),
      c.resolve("empresaRepository"),
      c.resolve("produtoRepository"),
    ),
);
