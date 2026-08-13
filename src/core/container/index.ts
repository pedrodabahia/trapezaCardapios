// Container de injeção de dependência caseiro (sem lib externa — o projeto
// não tem awilix/tsyringe instalado, e como não temos como rodar `bun add`
// nesta migração, preferimos zero dependência nova a um container maior do
// que o necessário).
//
// Como funciona:
// - `Cradle` é uma interface vazia aqui. Cada módulo faz "declaration
//   merging" nela (veja src/modules/pedidos/container.ts) pra registrar suas
//   próprias chaves com tipo — assim o core/ nunca precisa importar nada dos
//   módulos, e o resolve() continua 100% tipado.
// - Registro é lazy: só instancia quando alguém pede (resolve). Por padrão
//   é singleton (uma instância reaproveitada), porque os repositories/
//   services aqui são stateless (só guardam outras dependências).

export interface Cradle {}

export interface ContainerApi {
  resolve<K extends keyof Cradle>(key: K): Cradle[K];
}

type Factory<K extends keyof Cradle> = (c: ContainerApi) => Cradle[K];

type Registration<K extends keyof Cradle> = {
  factory: Factory<K>;
  singleton: boolean;
  instance?: Cradle[K];
};

class Container implements ContainerApi {
  private registrations = new Map<keyof Cradle, Registration<any>>();

  register<K extends keyof Cradle>(
    key: K,
    factory: Factory<K>,
    options: { singleton?: boolean } = {},
  ): void {
    this.registrations.set(key, {
      factory,
      singleton: options.singleton ?? true,
    });
  }

  resolve<K extends keyof Cradle>(key: K): Cradle[K] {
    const registration = this.registrations.get(key);
    if (!registration) {
      throw new Error(
        `[container] Nada registrado para "${String(key)}". Confira se o módulo dono dessa dependência foi importado (o registro acontece como side-effect do import do container do módulo).`,
      );
    }
    if (registration.singleton) {
      if (registration.instance === undefined) {
        registration.instance = registration.factory(this);
      }
      return registration.instance;
    }
    return registration.factory(this);
  }
}

export const container: ContainerApi & {
  register: Container["register"];
} = new Container();
