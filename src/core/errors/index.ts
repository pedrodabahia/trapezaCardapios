// Scaffold de erros de domínio pra próximos módulos. Nesta fase (módulo
// Pedidos) NÃO estamos trocando os `throw new Error(...)` existentes por
// essas classes — as mensagens e o tipo `Error` puro precisam continuar
// idênticos ao comportamento atual pro front não quebrar. Isso fica pronto
// pra uso a partir do próximo módulo (Empresas/Auth), quando dá pra migrar
// com mais segurança e ajustar o front junto.

export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ForbiddenError extends AppError {}
export class NotFoundError extends AppError {}
export class ValidationError extends AppError {}
export class SubscriptionPendingError extends AppError {
  constructor() {
    super("ASSINATURA_PENDENTE");
  }
}
