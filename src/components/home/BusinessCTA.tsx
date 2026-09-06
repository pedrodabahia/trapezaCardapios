import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function BusinessCTA() {
  return (
    <section className="bg-brand-brown text-white">
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="font-display text-3xl font-bold md:text-4xl">
          Sua empresa pode estar aqui.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/80">
          Coloque sua empresa no Trapeza, apresente seus produtos e facilite o
          contato dos seus clientes com você.
        </p>
        <Link to="/painel/login">
          <Button
            size="lg"
            className="mt-6 rounded-full bg-brand-yellow text-brand-brown hover:bg-brand-yellow/90"
          >
            Cadastre sua empresa
          </Button>
        </Link>
      </div>
    </section>
  );
}
