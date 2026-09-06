// CAMADA DE INJEÇÃO DE DEPENDÊNCIA (categorias) — registra a
// implementação concreta do repository e do service no container global,
// e declara os tipos deles no "Cradle" (o dicionário de tipos do
// container). É graças a isso que o service depende só da INTERFACE
// `CategoriaRepository`, nunca da classe `SupabaseCategoriaRepository` —
// se um dia trocar de Supabase pra outro banco, só troca a implementação
// registrada aqui, service e controller não mudam nada (Dependency
// Inversion / princípio D do SOLID).
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
