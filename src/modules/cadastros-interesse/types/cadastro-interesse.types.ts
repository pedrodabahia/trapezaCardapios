export type CadastroInteresse = {
  id: string;
  nome_empresa: string;
  nome_responsavel: string;
  whatsapp: string;
  email: string | null;
  cidade: string;
  categoria_negocio_id: string;
  status: "novo" | "contatado" | "arquivado";
  criado_em: string;
};

export type NovoCadastroInteresseInput = {
  nomeEmpresa: string;
  nomeResponsavel: string;
  whatsapp: string;
  email?: string;
  cidade: string;
  categoriaNegocioId: string;
};
