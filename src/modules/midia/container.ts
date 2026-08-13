import { container } from "@/core/container";
import type { MidiaRepository } from "./repositories/midia.repository";
import { SupabaseMidiaRepository } from "./repositories/midia.repository";
import { MidiaService } from "./services/midia.service";

declare module "@/core/container" {
  interface Cradle {
    midiaRepository: MidiaRepository;
    midiaService: MidiaService;
  }
}

container.register("midiaRepository", () => new SupabaseMidiaRepository());
container.register("midiaService", (c) => new MidiaService(c.resolve("midiaRepository")));
