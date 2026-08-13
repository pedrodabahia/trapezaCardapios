import { defineConfig } from "vitest/config";
import path from "node:path";

// Config separada do vite.config.ts (que já vem pré-configurado pelo
// @lovable.dev/vite-tanstack-config e não deve ser mexido na mão — ver o
// comentário no topo dele). O Vitest só precisa do alias @/ pra resolver
// os imports dos módulos, nada do resto do bundler de produção.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
