import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-CCH2-yNj.js
var itemUnitPrice = (i) => i.basePrice + i.customization.adicionais.reduce((s, a) => s + a.price, 0);
var itemTotal = (i) => itemUnitPrice(i) * i.quantity;
function makeCartStore(slug) {
	return create()(persist((set, get) => ({
		items: [],
		favorites: [],
		orders: [],
		drawerOpen: false,
		addItem: (i) => set((s) => ({
			items: [...s.items, i],
			drawerOpen: true
		})),
		updateQty: (id, qty) => set((s) => ({ items: s.items.map((it) => it.id === id ? {
			...it,
			quantity: Math.max(1, qty)
		} : it).filter((it) => it.quantity > 0) })),
		removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
		clear: () => set({
			items: [],
			coupon: void 0
		}),
		toggleFav: (id) => set((s) => ({ favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id] })),
		openDrawer: () => set({ drawerOpen: true }),
		closeDrawer: () => set({ drawerOpen: false }),
		applyCoupon: (code, coupons) => {
			const c = code.trim().toUpperCase();
			const found = coupons.find((x) => x.code.toUpperCase() === c);
			if (found) {
				set({ coupon: {
					code: c,
					discount: found.discount
				} });
				return true;
			}
			return false;
		},
		placeOrder: (o) => {
			const order = {
				...o,
				id: `P${Date.now().toString(36).toUpperCase().slice(-6)}`,
				createdAt: Date.now(),
				status: "Enviado pelo WhatsApp"
			};
			set((s) => ({
				orders: [order, ...s.orders],
				items: [],
				coupon: void 0,
				drawerOpen: false
			}));
			return order;
		}
	}), {
		name: `${slug}-cart`,
		partialize: (s) => ({
			items: s.items,
			favorites: s.favorites,
			orders: s.orders,
			coupon: s.coupon
		})
	}));
}
var storesPorSlug = /* @__PURE__ */ new Map();
function getCartStore(slug) {
	let s = storesPorSlug.get(slug);
	if (!s) {
		s = makeCartStore(slug);
		storesPorSlug.set(slug, s);
	}
	return s;
}
makeCartStore("default");
var cartCount = (items) => items.reduce((s, i) => s + i.quantity, 0);
var cartSubtotal = (items) => items.reduce((s, i) => s + itemTotal(i), 0);
//#endregion
export { itemUnitPrice as i, cartSubtotal as n, getCartStore as r, cartCount as t };
