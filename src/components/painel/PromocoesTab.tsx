import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { brl } from "@/lib/format";
import { type EmpresaCompleta, type Produto } from "@/lib/admin-store";

export function PromocoesTab({
  completa,
  onSaved,
}: {
  completa: EmpresaCompleta;
  token: string;
  onSaved: () => void;
}) {
  const tags = ["mais-vendido", "promocao", "novo"] as const;
  const grouped: Record<typeof tags[number], Produto[]> = {
    "mais-vendido": [],
    "promocao": [],
    "novo": [],
  };
  for (const p of completa.produtos) {
    if (p.tag) grouped[p.tag].push(p);
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Promoções do dia</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          A "promoção do dia" na home é o produto com tag{" "}
          <code>promocao</code> em ordem. Defina a ordem dos produtos com tag
          promoção na aba <strong>Produtos</strong> (em breve: dropdown para
          escolher 1 destaque manual). Por enquanto, a primeira opção será a
          usada.
        </p>
        {grouped["promocao"].length === 0 ? (
          <p className="mt-4 text-sm">Nenhum produto marcado como promoção.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {grouped["promocao"].map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span>
                  {p.nome} — {brl(p.preco)}
                </span>
                <Badge>ordem {p.ordem}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
