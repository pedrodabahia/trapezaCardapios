import { create } from "zustand";
import { persist } from "zustand/middleware";

// Uma seleção dentro de uma categoria de adicional dinâmica (ex:
// categoriaNome "Tipo de pão" -> valores ["Brioche"], ou "Molhos" ->
// valores ["Ketchup", "Maionese"] se for de seleção múltipla).
export type CartCustomizationSelecao = {
  categoriaOpcaoId: string;
  categoriaNome: string;
  valores: string[];
};

export type CartCustomization = {
  selecoes: CartCustomizationSelecao[];
  remover: string[];
  adicionais: { name: string; price: number }[];
  observacoes?: string;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  image: string;
  basePrice: number;
  quantity: number;
  customization: CartCustomization;
};

export type Order = {
  id: string;
  createdAt: number;
  items: CartItem[];
  total: number;
  status: string;
  address: string;
  payment: string;
};

export type Coupon = { code: string; discount: number; desc: string };

type State = {
  items: CartItem[];
  favorites: string[];
  orders: Order[];
  drawerOpen: boolean;
  coupon?: { code: string; discount: number };
  addItem: (i: CartItem) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  toggleFav: (id: string) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  applyCoupon: (code: string, coupons: Coupon[]) => boolean;
  placeOrder: (o: Omit<Order, "id" | "createdAt" | "status">) => Order;
};

export const itemUnitPrice = (i: CartItem) =>
  i.basePrice + i.customization.adicionais.reduce((s, a) => s + a.price, 0);

export const itemTotal = (i: CartItem) => itemUnitPrice(i) * i.quantity;

// Cria uma store escopada por slug do tenant — evita misturar carrinhos
// de empresas diferentes e dá reset limpo entre tenants.
export function makeCartStore(slug: string) {
  return create<State>()(
    persist(
      (set, get) => ({
        items: [],
        favorites: [],
        orders: [],
        drawerOpen: false,
        addItem: (i) =>
          set((s) => ({ items: [...s.items, i], drawerOpen: true })),
        updateQty: (id, qty) =>
          set((s) => ({
            items: s.items
              .map((it) =>
                it.id === id ? { ...it, quantity: Math.max(1, qty) } : it,
              )
              .filter((it) => it.quantity > 0),
          })),
        removeItem: (id) =>
          set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
        clear: () => set({ items: [], coupon: undefined }),
        toggleFav: (id) =>
          set((s) => ({
            favorites: s.favorites.includes(id)
              ? s.favorites.filter((x) => x !== id)
              : [...s.favorites, id],
          })),
        openDrawer: () => set({ drawerOpen: true }),
        closeDrawer: () => set({ drawerOpen: false }),
        applyCoupon: (code, coupons) => {
          const c = code.trim().toUpperCase();
          const found = coupons.find((x) => x.code.toUpperCase() === c);
          if (found) {
            set({ coupon: { code: c, discount: found.discount } });
            return true;
          }
          return false;
        },
        placeOrder: (o) => {
          const order: Order = {
            ...o,
            id: `P${Date.now().toString(36).toUpperCase().slice(-6)}`,
            createdAt: Date.now(),
            status: "Enviado pelo WhatsApp",
          };
          set((s) => ({
            orders: [order, ...s.orders],
            items: [],
            coupon: undefined,
            drawerOpen: false,
          }));
          return order;
        },
      }),
      {
        name: `${slug}-cart`,
        partialize: (s) => ({
          items: s.items,
          favorites: s.favorites,
          orders: s.orders,
          coupon: s.coupon,
        }),
      },
    ),
  );
}

// Uma store zustand por slug de empresa, criada sob demanda e
// reaproveitada (cache em módulo) — evita misturar carrinho de
// empresas diferentes no mesmo navegador.
const storesPorSlug = new Map<string, ReturnType<typeof makeCartStore>>();
export function getCartStore(slug: string) {
  let s = storesPorSlug.get(slug);
  if (!s) {
    s = makeCartStore(slug);
    storesPorSlug.set(slug, s);
  }
  return s;
}

// Hook legado (sem slug) — mantido só pra não quebrar imports antigos.
// Prefira `getCartStore(slug)()` em componentes novos.
const legacyStore = makeCartStore("default");
export const useStore = legacyStore;

export const cartCount = (items: CartItem[]) =>
  items.reduce((s, i) => s + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((s, i) => s + itemTotal(i), 0);