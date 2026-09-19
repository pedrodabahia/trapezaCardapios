import { container } from "@/core/container";
import type { CadastroInteresseRepository } from "./repositories/cadastro-interesse.repository";
import { SupabaseCadastroInteresseRepository } from "./repositories/cadastro-interesse.repository";
import { CadastroInteresseService } from "./services/cadastro-interesse.service";

declare module "@/core/container" {
  interface Cradle {
    cadastroInteresseRepository: CadastroInteresseRepository;
    cadastroInteresseService: CadastroInteresseService;
  }
}

container.register("cadastroInteresseRepository", () => new SupabaseCadastroInteresseRepository());
container.register(
  "cadastroInteresseService",
  (c) => new CadastroInteresseService(c.resolve("cadastroInteresseRepository")),
);
