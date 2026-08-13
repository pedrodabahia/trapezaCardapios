export type Plano = {
  id: string;
  nome: string;
  preco_mensal: number;
  limite_produtos: number | null;
  // features extras que existem na tabela mas não eram tipadas antes —
  // mantidas opcionais pra não mudar nada de comportamento.
  tem_shopping?: boolean;
  tem_destaque?: boolean;
  tem_tv?: boolean;
};
