export function Stats({
  empresasCount,
  cidadesCount,
  pedidosCount,
}: {
  empresasCount: number;
  cidadesCount: number;
  pedidosCount: number | null;
}) {
  // Só mostra números que vêm de dado real: contagem das empresas ativas
  // carregadas na home, e a contagem de pedidos vinda direto da tabela
  // `pedidos` no banco (soma de todas as empresas). Se a contagem de
  // pedidos ainda não carregou, só não mostra esse item — nunca inventa.
  if (empresasCount === 0) return null;

  const itens = [
    { valor: empresasCount, label: empresasCount === 1 ? "Empresa cadastrada" : "Empresas cadastradas" },
    { valor: empresasCount, label: empresasCount === 1 ? "Catálogo publicado" : "Catálogos publicados" },
  ];
  if (cidadesCount > 0) {
    itens.push({
      valor: cidadesCount,
      label: cidadesCount === 1 ? "Cidade atendida" : "Cidades atendidas",
    });
  }
  if (pedidosCount != null && pedidosCount > 0) {
    itens.push({
      valor: pedidosCount,
      label: pedidosCount === 1 ? "Pedido realizado" : "Pedidos realizados",
    });
  }else{
    itens.push({
      valor: 0,
      label: pedidosCount === 1 ? "Pedido realizado" : "Pedidos realizados",
    });
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
        {itens.map((it, i) => (
          <div key={i}>
            <p className="font-display text-3xl font-bold text-brand-red md:text-4xl">
              {it.valor}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{it.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
