import { createFileRoute } from "@tanstack/react-router";
import { listEmpresasPublicas } from "@/modules/empresas/controllers/empresa.controller";
import { getCategoriasNegocio } from "@/modules/categorias-negocio/controllers/categoria-negocio.controller";
import { listarPromocoes } from "@/modules/promocoes/controllers/promocao.controller";

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
          const [empresas, categorias] = await Promise.all([
            listEmpresasPublicas({ data: {} }),
            getCategoriasNegocio({ data: {} }),
          ]);

          // Busca promoções públicas em lotes para que o limite de uma única
          // consulta não deixe páginas de ofertas de fora do sitemap.
          const promocoes = [];
          const tamanhoLote = 100;
          for (let offset = 0; ; offset += tamanhoLote) {
            const lote = await listarPromocoes({
              data: { limite: tamanhoLote, offset },
            });
            promocoes.push(...lote);
            if (lote.length < tamanhoLote) break;
          }

          const paths = new Set<string>(["/", "/promocoes"]);

          for (const categoria of categorias) {
            if (categoria.ativo && categoria.valor) {
              paths.add(`/categoria/${encodeURIComponent(categoria.valor)}`);
            }
          }

          // listEmpresasPublicas já retorna apenas perfis públicos ativos,
          // independentemente de o plano ser gratuito ou pago.
          for (const empresa of empresas) {
            if (!empresa.slug) continue;
            const slug = encodeURIComponent(empresa.slug);
            paths.add(`/empresa/${slug}`);
            if (empresa.tipo === "trapeza") paths.add(`/s/${slug}`);
          }

          const empresasComPromocoes = new Set<string>();
          for (const promocao of promocoes) {
            if (promocao.slug) paths.add(`/promocoes/${encodeURIComponent(promocao.slug)}`);
            if (promocao.empresa_slug) empresasComPromocoes.add(promocao.empresa_slug);
          }
          for (const slug of empresasComPromocoes) {
            paths.add(`/promocoes/empresa/${encodeURIComponent(slug)}`);
          }

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
