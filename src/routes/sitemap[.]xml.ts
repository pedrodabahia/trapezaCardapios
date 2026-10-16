import { createFileRoute } from "@tanstack/react-router";
import { listEmpresasPublicas } from "@/modules/empresas/controllers/empresa.controller";
import { CATEGORIAS_NEGOCIO } from "@/lib/categorias-negocio";

const SITE_URL = "https://trapeza.me";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(path: string): string {
  return `  <url><loc>${escapeXml(`${SITE_URL}${path}`)}</loc></url>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const empresas = await listEmpresasPublicas({ data: {} });
          const paths = new Set<string>([
            "/",
            "/promocoes",
            ...CATEGORIAS_NEGOCIO.filter((categoria) => categoria.ativo).map(
              (categoria) => `/categoria/${encodeURIComponent(categoria.valor)}`,
            ),
            ...empresas
              .filter((empresa) => empresa.slug && empresa.status_pagamento === "ativo")
              .flatMap((empresa) => {
                const slug = encodeURIComponent(empresa.slug);
                return empresa.tipo === "trapeza"
                  ? [`/empresa/${slug}`, `/s/${slug}`]
                  : [`/empresa/${slug}`];
              }),
          ]);

          const urls = [...paths].map(urlEntry).join("\n");
          const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

          return new Response(xml, {
            status: 200,
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
              "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
            },
          });
        } catch (error) {
          console.error("Falha ao gerar sitemap.xml", error);
          return new Response("Não foi possível gerar o sitemap.", {
            status: 500,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
      },
    },
  },
});
