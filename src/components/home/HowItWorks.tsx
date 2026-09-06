const PASSOS = [
  { n: "01", titulo: "Cadastre", texto: "Crie o perfil da sua empresa." },
  { n: "02", titulo: "Personalize", texto: "Adicione sua identidade, produtos e informações." },
  { n: "03", titulo: "Divulgue", texto: "Compartilhe seu catálogo com seus clientes." },
  {
    n: "04",
    titulo: "Receba pedidos",
    texto: "Seus clientes podem montar pedidos e entrar em contato pelo WhatsApp.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-center font-display text-2xl font-bold md:text-3xl">
        Coloque sua empresa no Trapeza
      </h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PASSOS.map((p) => (
          <div key={p.n} className="rounded-2xl border border-border bg-card p-5">
            <span className="font-display text-3xl font-bold text-brand-red/70">{p.n}</span>
            <h3 className="mt-2 font-display text-lg font-semibold">{p.titulo}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
