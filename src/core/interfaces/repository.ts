// Interface genérica de referência pro padrão de Repository usado nos
// módulos. Não é obrigatório os repositories implementarem isso — cada
// módulo define sua própria interface (ex: PedidoRepository) com os métodos
// que fazem sentido pro seu domínio. Isso aqui é só documentação do padrão.
export interface Repository<TEntity, TId = string> {
  buscar(id: TId): Promise<TEntity | null>;
}
