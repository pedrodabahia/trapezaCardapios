import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { brl } from "@/lib/format";
import { listarProdutosPorCategoriasNegocio, listEmpresasPublicas, type ProdutoCategoriaPlataforma } from "@/lib/admin-server";
import { CATEGORIAS_NEGOCIO, useCategoriasNegocio } from "@/lib/categorias-negocio";
import { BusinessCard } from "@/components/home/BusinessCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/categoria/$valor")({ component: PaginaCategoria });

const TODAS = "__todas__";

function PaginaCategoria() {
  const { valor } = Route.useParams();
  const [filtro, setFiltro] = useState(TODAS);
  const { data: categorias = CATEGORIAS_NEGOCIO } = useCategoriasNegocio();

  // Mesmo se alguém abrir a URL de uma subcategoria diretamente, a página
  // sobe para a categoria-pai dela e mantém os filtros das irmãs no topo.
  const categoriaClicada = categorias.find((categoria) => categoria.valor === valor);
  const categoriaPai = categoriaClicada?.categoria_pai_id
    ? categorias.find((categoria) => categoria.id === categoriaClicada.categoria_pai_id) ?? categoriaClicada
    : categoriaClicada;
  const subcategorias = useMemo(
    () => categoriaPai ? categorias.filter((categoria) => categoria.categoria_pai_id === categoriaPai.id) : [],
    [categorias, categoriaPai],
  );
  const valoresRelacionados = useMemo(() => {
    const valores = subcategorias.map((categoria) => categoria.valor);
    // Compatibilidade com empresas antigas que ainda usam o valor da pai.
    if (categoriaPai?.valor) valores.push(categoriaPai.valor);
    return [...new Set(valores)];
  }, [categoriaPai, subcategorias]);

  useEffect(() => setFiltro(TODAS), [valor]);

  const categoriasParaBusca = filtro === TODAS ? valoresRelacionados : [filtro];
  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ["produtos-categoria-negocio", categoriaPai?.valor ?? valor, filtro, categoriasParaBusca],
    queryFn: () => listarProdutosPorCategoriasNegocio({ data: { categorias: categoriasParaBusca } }),
    enabled: categoriasParaBusca.length > 0,
    staleTime: 30_000,
  });

  // Produto só existe pra empresa Trapeza (com catálogo). Empresa externa
  // não tem produto nenhum aqui, então pra ela não "sumir" da categoria,
  // mostra o card da empresa direto (leva pra /empresa/$slug). Empresa
  // Trapeza que ainda não tem produto NESSA categoria específica também
  // cai nesse caso, em vez de ficar de fora.
  const { data: empresas = [] } = useQuery({
    queryKey: ["empresas-publicas"],
    queryFn: () => listEmpresasPublicas({ data: {} as Record<string, never> }),
    staleTime: 30_000,
  });
  const empresasRelacionadas = useMemo(
    () => empresas.filter((e) => e.categorias?.some((c) => categoriasParaBusca.includes(c))),
    [empresas, categoriasParaBusca],
  );

  const totalItens = empresasRelacionadas.length;

  const titulo = categoriaPai?.label ?? valor;

  return (
    <div className="trapeza-home min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link to="/" aria-label="Voltar" className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60"><ChevronLeft className="h-4 w-4" /></Link>
          <h1 className="font-display text-base font-bold">{titulo}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-5">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Explore {titulo}</p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <FiltroCategoria label="Todos" ativo={filtro === TODAS} onClick={() => setFiltro(TODAS)} />
            {subcategorias.map((categoria) => (
              <FiltroCategoria key={categoria.id} label={categoria.label} ativo={filtro === categoria.valor} onClick={() => setFiltro(categoria.valor)} />
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Carregando...</p>
        ) : totalItens === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Ainda não há nada disponível nessa categoria.</p>
        ) : (
          <>
            <p className="pb-3 text-xs text-muted-foreground">{totalItens} {totalItens === 1 ? "resultado encontrado" : "resultados encontrados"}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {empresasRelacionadas.map((empresa) => <BusinessCard key={empresa.id} empresa={empresa} variant="grid" />)}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function FiltroCategoria({ label, ativo, onClick }: { label: string; ativo: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition", ativo ? "border-brand-brown bg-brand-brown text-white" : "border-border bg-card text-foreground hover:border-brand-brown/50")}>{label}</button>;
}

function ProdutoCard({ produto }: { produto: ProdutoCategoriaPlataforma }) {
  return (
    <Link to="/s/$slug/product/$id" params={{ slug: produto.empresaSlug, id: produto.produtoId }} className="group block">
      <Card className="h-full overflow-hidden transition group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div className="aspect-square overflow-hidden bg-muted">
          {produto.imagemUrl ? <img src={produto.imagemUrl} alt={produto.nome} className="h-full w-full object-cover transition group-hover:scale-105" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 text-3xl">🍽️</div>}
        </div>
        <CardContent className="space-y-1 p-3">
          <h2 className="truncate text-sm font-bold">{produto.nome}</h2>
          <p className="truncate text-xs text-muted-foreground">{produto.empresaNome}</p>
          {produto.descricaoCurta && <p className="line-clamp-2 text-[11px] text-muted-foreground">{produto.descricaoCurta}</p>}
          <p className="text-sm font-extrabold text-brand-brown">{brl(produto.precoAtual)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
