import { container } from "@/core/container";
import type { PedidoRepository } from "./repositories/pedido.repository";
import { SupabasePedidoRepository } from "./repositories/pedido.repository";
import type { PedidoPricingRepository } from "./repositories/pedido-pricing.repository";
import { SupabasePedidoPricingRepository } from "./repositories/pedido-pricing.repository";
import { PedidoService } from "./services/pedido.service";

// Registra os tipos deste módulo no container central via declaration
// merging — o core/container não precisa importar nada daqui, mas o
// container.resolve("pedidoService") em qualquer outro arquivo já sai
// tipado corretamente, desde que este arquivo (ou algo que o importe) tenha
// sido carregado antes.
declare module "@/core/container" {
  interface Cradle {
    pedidoRepository: PedidoRepository;
    pedidoPricingRepository: PedidoPricingRepository;
    pedidoService: PedidoService;
  }
}

// Registro roda como side-effect no import deste arquivo. Import é
// idempotente (módulos ES só executam uma vez), então não há risco de
// registrar duas vezes.
container.register("pedidoRepository", () => new SupabasePedidoRepository());
container.register("pedidoPricingRepository", () => new SupabasePedidoPricingRepository());
container.register(
  "pedidoService",
  (c) =>
    new PedidoService(
      c.resolve("pedidoRepository"),
      c.resolve("pedidoPricingRepository"),
    ),
);
