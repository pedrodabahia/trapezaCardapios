import { container } from "@/core/container";
import type { ProdutoRepository } from "./repositories/produto.repository";
import { SupabaseProdutoRepository } from "./repositories/produto.repository";
import type { ProdutoIngredienteRepository } from "./repositories/produto-ingrediente.repository";
import { SupabaseProdutoIngredienteRepository } from "./repositories/produto-ingrediente.repository";
import { ProdutoService } from "./services/produto.service";

declare module "@/core/container" {
  interface Cradle {
    produtoRepository: ProdutoRepository;
    produtoIngredienteRepository: ProdutoIngredienteRepository;
    produtoService: ProdutoService;
  }
}

container.register("produtoRepository", () => new SupabaseProdutoRepository());
container.register(
  "produtoIngredienteRepository",
  () => new SupabaseProdutoIngredienteRepository(),
);
container.register(
  "produtoService",
  (c) => new ProdutoService(c.resolve("produtoRepository"), c.resolve("produtoIngredienteRepository")),
);
