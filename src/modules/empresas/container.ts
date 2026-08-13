import { container } from "@/core/container";
import type { EmpresaRepository } from "./repositories/empresa.repository";
import { SupabaseEmpresaRepository } from "./repositories/empresa.repository";
import { EmpresaService } from "./services/empresa.service";
import { CardapioService } from "./services/cardapio.service";
import { DashboardService } from "./services/dashboard.service";
import "@/modules/produtos/container";
import "@/modules/categorias/container";
import "@/modules/planos/container";
import "@/modules/usuarios/container";
import "@/modules/pedidos/container";

declare module "@/core/container" {
  interface Cradle {
    empresaRepository: EmpresaRepository;
    empresaService: EmpresaService;
    cardapioService: CardapioService;
    dashboardService: DashboardService;
  }
}

container.register("empresaRepository", () => new SupabaseEmpresaRepository());

container.register(
  "empresaService",
  (c) => new EmpresaService(c.resolve("empresaRepository"), c.resolve("usuarioRepository")),
);

container.register(
  "cardapioService",
  (c) =>
    new CardapioService(
      c.resolve("empresaRepository"),
      c.resolve("produtoRepository"),
      c.resolve("categoriaRepository"),
      c.resolve("produtoService"),
    ),
);

container.register(
  "dashboardService",
  (c) =>
    new DashboardService(
      c.resolve("empresaRepository"),
      c.resolve("planoRepository"),
      c.resolve("pedidoRepository"),
    ),
);
