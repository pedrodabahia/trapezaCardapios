import { container } from "@/core/container";

import type { PromocaoRepository } from "./repositories/promocao.repository";
import { SupabasePromocaoRepository } from "./repositories/promocao.repository";
import { PromocaoService } from "./services/promocao.service";

declare module "@/core/container" {
  interface Cradle {
    promocaoRepository: PromocaoRepository;
    promocaoService: PromocaoService;
  }
}

container.register(
  "promocaoRepository",
  () => new SupabasePromocaoRepository(),
);

container.register(
  "promocaoService",
  (c) => new PromocaoService(c.resolve("promocaoRepository")),
);