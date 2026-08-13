import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link, y as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as Route } from "./_ssr/router-DYFXKq1T.mjs";
import { f as useEmpresaPublica, g as useProdutoById, h as useOpcoes, l as useCategoriasOpcao, p as useIngredientesDoProduto } from "./_ssr/admin-store-CsIVidas.mjs";
import { t as cn } from "./_ssr/utils-C_uf36nf.mjs";
import { t as brl } from "./_ssr/format-GUzbl2Vi.mjs";
import { r as getCartStore } from "./_ssr/store-CCH2-yNj.mjs";
import { C as ArrowLeft, d as Plus, p as Minus } from "./_libs/lucide-react.mjs";
import { t as Button } from "./_ssr/button-Bq5vK6RO.mjs";
import { t as Label } from "./_ssr/label-DBD1bRRP.mjs";
import { t as Textarea } from "./_ssr/textarea-kko37XEX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-BB4sj6xC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProdutoDetalhe() {
	const { slug, id } = Route.useParams();
	const navigate = useNavigate();
	const { data: empresaCompleta } = useEmpresaPublica(slug);
	const produto = useProdutoById(empresaCompleta, id);
	const opcoes = useOpcoes(empresaCompleta);
	const categoriasOpcao = useCategoriasOpcao(empresaCompleta);
	const ingredientesProdutoRaw = useIngredientesDoProduto(empresaCompleta, produto?.id);
	const idsAtivos = (empresaCompleta?.categorias.find((c) => c.id === produto?.categoria_id))?.categorias_opcao_ids ?? [];
	const [qtd, setQtd] = (0, import_react.useState)(1);
	const [selecoes, setSelecoes] = (0, import_react.useState)({});
	const [remover, setRemover] = (0, import_react.useState)([]);
	const [obs, setObs] = (0, import_react.useState)("");
	const categoriasDoProduto = (0, import_react.useMemo)(() => categoriasOpcao.filter((co) => idsAtivos.includes(co.id)).filter((co) => opcoes.some((o) => o.categoria_opcao_id === co.id)).sort((a, b) => a.ordem - b.ordem), [
		categoriasOpcao,
		idsAtivos,
		opcoes
	]);
	if (!empresaCompleta) return null;
	if (!produto) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-16 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-lg font-semibold",
			children: "Produto não encontrado."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/s/$slug",
			params: { slug },
			className: "mt-4 inline-block text-brand-red underline",
			children: "Voltar pro cardápio"
		})]
	});
	const ingredientesProduto = ingredientesProdutoRaw.slice().sort((a, b) => a.ordem - b.ordem);
	function toggleRemover(nome) {
		setRemover((r) => r.includes(nome) ? r.filter((x) => x !== nome) : [...r, nome]);
	}
	function toggleValor(categoriaOpcaoId, nome, selecao) {
		setSelecoes((s) => {
			const atuais = s[categoriaOpcaoId] ?? [];
			if (selecao === "unica") return {
				...s,
				[categoriaOpcaoId]: [nome]
			};
			const jaSelecionado = atuais.includes(nome);
			return {
				...s,
				[categoriaOpcaoId]: jaSelecionado ? atuais.filter((x) => x !== nome) : [...atuais, nome]
			};
		});
	}
	const adicionaisSelecionados = () => {
		const lista = [];
		for (const co of categoriasDoProduto) {
			const nomes = selecoes[co.id] ?? [];
			for (const nome of nomes) {
				const opt = opcoes.find((o) => o.categoria_opcao_id === co.id && o.nome === nome);
				if (opt && opt.preco_adicional > 0) lista.push({
					name: opt.nome,
					price: opt.preco_adicional
				});
			}
		}
		return lista;
	};
	function handleAdd() {
		const customization = {
			selecoes: categoriasDoProduto.map((co) => ({
				categoriaOpcaoId: co.id,
				categoriaNome: co.nome,
				valores: selecoes[co.id] ?? []
			})).filter((s) => s.valores.length > 0),
			remover,
			adicionais: adicionaisSelecionados(),
			observacoes: obs.trim() || void 0
		};
		const item = {
			id: `${produto.id}-${Date.now()}`,
			productId: produto.id,
			name: produto.nome,
			image: produto.imagem_url ?? "",
			basePrice: produto.preco,
			quantity: qtd,
			customization
		};
		getCartStore(slug).getState().addItem(item);
		toast.success("Adicionado ao carrinho!");
		navigate({
			to: "/s/$slug",
			params: { slug }
		});
	}
	const precoUnitario = produto.preco + adicionaisSelecionados().reduce((s, a) => s + a.price, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 pb-32 pt-4 md:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/s/$slug",
				params: { slug },
				className: "mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-brown",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Voltar"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-3xl bg-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "aspect-[4/3] w-full",
					children: produto.imagem_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: produto.imagem_url,
						alt: produto.nome,
						className: "h-full w-full object-cover"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl font-bold",
						children: produto.nome
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: produto.descricao
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-baseline gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-2xl font-bold text-brand-red",
							children: brl(produto.preco)
						}), produto.preco_antigo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted-foreground line-through",
							children: brl(produto.preco_antigo)
						})]
					}),
					ingredientesProduto.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: ["Ingredientes: ", ingredientesProduto.map((i) => i.nome).join(", ")]
					})
				]
			}),
			categoriasDoProduto.map((co) => {
				const items = opcoes.filter((o) => o.categoria_opcao_id === co.id);
				const selecionados = selecoes[co.id] ?? [];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "font-display text-base font-semibold",
						children: [
							co.nome,
							co.selecao === "multipla" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-1 text-xs font-normal text-muted-foreground",
								children: "(pode escolher mais de um)"
							}),
							co.obrigatorio && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-1 text-xs font-normal text-brand-red",
								children: "*"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: items.map((o) => {
							const selected = selecionados.includes(o.nome);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => toggleValor(co.id, o.nome, co.selecao),
								className: cn("rounded-full border px-4 py-2 text-sm font-semibold transition", selected ? "border-brand-red bg-brand-red text-white" : "border-border bg-card hover:bg-muted"),
								children: [o.nome, o.preco_adicional > 0 && ` (+${brl(o.preco_adicional)})`]
							}, o.id);
						})
					})]
				}, co.id);
			}),
			ingredientesProduto.some((i) => i.removivel) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-base font-semibold",
					children: "Remover algum ingrediente?"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: ingredientesProduto.filter((i) => i.removivel).map((i) => {
						const marcado = remover.includes(i.nome);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => toggleRemover(i.nome),
							className: cn("rounded-full border px-4 py-2 text-sm font-semibold transition", marcado ? "border-brand-red bg-brand-red/10 text-brand-red line-through" : "border-border bg-card hover:bg-muted"),
							children: marcado ? `Sem ${i.nome}` : i.nome
						}, i.nome);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "obs",
					children: "Alguma observação?"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "obs",
					placeholder: "Ex: sem cebola, ponto da carne, etc.",
					value: obs,
					onChange: (e) => setObs(e.target.value),
					className: "mt-1"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card p-4 shadow-2xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-3xl items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 rounded-full border bg-background p-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setQtd((q) => Math.max(1, q - 1)),
								className: "grid h-9 w-9 place-items-center rounded-full hover:bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-8 text-center font-semibold",
								children: qtd
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setQtd((q) => q + 1),
								className: "grid h-9 w-9 place-items-center rounded-full bg-brand-red text-white hover:bg-brand-red/90",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" })
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: handleAdd,
						className: "h-12 flex-1 rounded-full bg-brand-red text-base font-bold hover:bg-brand-red/90",
						children: ["Adicionar · ", brl(precoUnitario * qtd)]
					})]
				})
			})
		]
	});
}
//#endregion
export { ProdutoDetalhe as component };
