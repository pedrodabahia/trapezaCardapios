import { a as __toESM } from "./__23tanstack-start-server-fn-resolver-RQ4HTkDC.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate, g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "./_libs/@radix-ui/react-arrow+[...].mjs";
import { C as saveOpcao, E as updateEmpresa, O as updatePedidoStatus, S as saveEmpresaConfig, T as saveProdutoIngredientes, b as saveCategoria, c as deleteOpcao, g as listPedidosEmpresa, k as uploadImagem, l as deleteProduto, o as deleteCategoriaOpcao, p as getPlanoDaEmpresa, r as changeOwnPassword, w as saveProduto, x as saveCategoriaOpcao } from "./_ssr/admin-server-CnyVybEG.mjs";
import { t as useQuery } from "./_libs/tanstack__react-query.mjs";
import { a as getFrete, d as useEmpresaAdmin, i as getCupons, m as useInvalidateEmpresa, n as getCidadeEntrega, o as getHorarios, r as getCores, t as getBairros } from "./_ssr/admin-store-AVdk2wK5.mjs";
import { t as cn } from "./_ssr/utils-C_uf36nf.mjs";
import { t as brl } from "./_ssr/format-GUzbl2Vi.mjs";
import { a as TriangleAlert, d as Plus, h as LogOut, o as Trash2, r as Upload } from "./_libs/lucide-react.mjs";
import { t as useAuthSession } from "./_ssr/auth-session-mj2pzSt5.mjs";
import { t as Route } from "./_empresaSlug-CL5LLwyC.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./_ssr/card-BXjpJ96D.mjs";
import { t as Button } from "./_ssr/button-Bq5vK6RO.mjs";
import { t as Input } from "./_ssr/input-B8Q2ztVi.mjs";
import { t as Label } from "./_ssr/label-DBD1bRRP.mjs";
import { t as Textarea } from "./_ssr/textarea-kko37XEX.mjs";
import { t as Badge } from "./_ssr/badge-D1Dupn2y.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "./_libs/radix-ui__react-tabs.mjs";
import { n as SwitchThumb, t as Switch$1 } from "./_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_empresaSlug-BXE5aNN2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = Content.displayName;
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
function ImageUploadField({ label, value, onChange, token, empresaId, pasta }) {
	const [enviando, setEnviando] = (0, import_react.useState)(false);
	const fileInputRef = (0, import_react.useRef)(null);
	function lerArquivoComoBase64(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result;
				resolve(result.split(",")[1] ?? "");
			};
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(file);
		});
	}
	async function onFileSelected(e) {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Escolha um arquivo de imagem");
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Imagem muito grande (máximo 5MB)");
			return;
		}
		setEnviando(true);
		try {
			const base64Data = await lerArquivoComoBase64(file);
			onChange((await uploadImagem({ data: {
				token,
				empresaId,
				pasta,
				contentType: file.type,
				base64Data
			} })).url);
			toast.success("Imagem enviada");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Erro ao enviar imagem");
		} finally {
			setEnviando(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value,
					onChange: (e) => onChange(e.target.value),
					placeholder: "Cole uma URL..."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					disabled: enviando,
					onClick: () => fileInputRef.current?.click(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-1 h-3 w-3" }), enviando ? "Enviando..." : "Enviar arquivo"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: fileInputRef,
					type: "file",
					accept: "image/*",
					className: "hidden",
					onChange: onFileSelected
				})
			]
		}),
		value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: value,
			alt: "Pré-visualização",
			className: "mt-2 h-16 w-16 rounded-lg object-cover"
		})
	] });
}
function PainelTenant() {
	const { empresaSlug } = Route.useParams();
	const session = useAuthSession((s) => s.session);
	const clear = useAuthSession((s) => s.clear);
	const navigate = useNavigate();
	const [publicEmpresa] = (0, import_react.useState)(null);
	const { data: completa, isLoading } = useEmpresaAdmin(session?.accessToken ?? null, session?.empresaId ?? void 0);
	const invalidateRaw = useInvalidateEmpresa();
	const invalidate = () => invalidateRaw({
		slug: completa?.empresa.slug,
		empresaId: session?.empresaId ?? void 0
	});
	if (!session) return null;
	if (isLoading || !completa) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Carregando painel..."
		})
	});
	const empresa = completa.empresa;
	if (empresa.slug !== empresaSlug) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md p-8 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm",
			children: [
				"Esta sessão pertence à empresa ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: empresa.nome }),
				", mas você acessou ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", { children: ["/painel/", empresaSlug] }),
				"."
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-4",
			onClick: () => navigate({ to: `/painel/${empresa.slug}` }),
			children: "Ir pro painel correto"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-border bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-xl font-bold",
					children: empresa.nome
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", { children: ["/s/", empresa.slug] }),
						" · ",
						session.email
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: `/s/${empresa.slug}`,
						target: "_blank",
						rel: "noreferrer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							children: "Ver cardápio"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/painel/login",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => clear(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "mr-1 h-3 w-3" }), " Sair"]
						})
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-6xl px-6 py-8",
			children: [empresa.status_pagamento !== "ativo" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mt-0.5 h-5 w-5 shrink-0 text-destructive" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display font-semibold text-destructive",
					children: empresa.status_pagamento === "suspenso" ? "Sua assinatura está suspensa." : "Sua assinatura está atrasada."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Enquanto isso, você consegue ver seus dados aqui, mas não consegue salvar alterações (produtos, categorias, config). Regularize o pagamento com a plataforma pra liberar de novo."
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "produtos",
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "flex flex-wrap",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "produtos",
								children: "Produtos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "categorias",
								children: "Categorias"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "pedidos",
								children: "Pedidos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "promocoes",
								children: "Promoções"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "cupons",
								children: "Cupons"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "entrega",
								children: "Entrega"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "personalizacao",
								children: "Personalização"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "config",
								children: "Configurações"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "conta",
								children: "Conta / Plano"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "seguranca",
								children: "Segurança"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "produtos",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProdutosTab, {
							completa,
							token: session.accessToken,
							onSaved: invalidate
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "categorias",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoriasTab, {
							completa,
							token: session.accessToken,
							onSaved: invalidate
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "pedidos",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PedidosTab, {
							completa,
							token: session.accessToken
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "promocoes",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromocoesTab, {
							completa,
							token: session.accessToken,
							onSaved: invalidate
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "cupons",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CuponsTab, {
							completa,
							token: session.accessToken,
							onSaved: invalidate
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "entrega",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntregaTab, {
							completa,
							token: session.accessToken,
							onSaved: invalidate
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "personalizacao",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonalizacaoTab, {
							completa,
							token: session.accessToken,
							onSaved: invalidate
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "config",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfigTab, {
							completa,
							token: session.accessToken,
							onSaved: invalidate
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "conta",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContaTab, {
							completa,
							token: session.accessToken
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "seguranca",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SegurancaTab, { token: session.accessToken })
					})
				]
			})]
		})]
	});
}
function ProdutosTab({ completa, token, onSaved }) {
	const [editing, setEditing] = (0, import_react.useState)(null);
	const produtos = completa.produtos;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Produtos"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setEditing({
						id: "",
						empresa_id: completa.empresa.id,
						categoria_id: completa.categorias[0]?.id ?? null,
						nome: "",
						descricao_curta: "",
						descricao: "",
						preco: 0,
						preco_antigo: null,
						imagem_url: "",
						ingredientes: [],
						nutricao: {
							kcal: 0,
							carbs: 0,
							protein: 0,
							fat: 0
						},
						tempo_preparo: "",
						tag: null,
						ordem: produtos.length,
						ativo: true
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-3 w-3" }), " Novo produto"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3",
				children: produtos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProdutoCardDisplay, {
					p,
					onEdit: () => setEditing(p),
					onDelete: async () => {
						if (!confirm(`Excluir ${p.nome}?`)) return;
						await deleteProduto({ data: {
							token,
							empresaId: completa.empresa.id,
							produtoId: p.id
						} });
						toast.success("Produto excluído");
						onSaved();
					}
				}, p.id))
			}),
			editing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProdutoEditDialog, {
				completa,
				produto: editing,
				token,
				onClose: () => setEditing(null),
				onSaved: () => {
					setEditing(null);
					onSaved();
				}
			})
		]
	});
}
function ProdutoCardDisplay({ p, onEdit, onDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-2 p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "truncate font-display font-semibold",
					children: p.nome
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						brl(p.preco),
						" ",
						p.preco_antigo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "line-through",
							children: brl(p.preco_antigo)
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: onEdit,
					children: "Editar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "destructive",
					onClick: onDelete,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap gap-1",
			children: [p.tag && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: p.tag }), !p.ativo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "secondary",
				children: "inativo"
			})]
		})]
	}) });
}
function ProdutoEditDialog({ completa, produto, token, onClose, onSaved }) {
	const [draft, setDraft] = (0, import_react.useState)(produto);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const isNew = !produto.id;
	const [ingredientesDraft, setIngredientesDraft] = (0, import_react.useState)((completa.produtoIngredientes[produto.id] ?? []).map((i) => ({
		nome: i.nome,
		removivel: i.removivel
	})));
	const [novoIngrediente, setNovoIngrediente] = (0, import_react.useState)("");
	function addIngrediente() {
		const nome = novoIngrediente.trim();
		if (!nome) return;
		setIngredientesDraft((list) => [...list, {
			nome,
			removivel: true
		}]);
		setNovoIngrediente("");
	}
	async function onSave() {
		setBusy(true);
		try {
			const result = await saveProduto({ data: {
				token,
				empresaId: completa.empresa.id,
				produto: draft
			} });
			const produtoId = isNew ? result.id : produto.id;
			await saveProdutoIngredientes({ data: {
				token,
				empresaId: completa.empresa.id,
				produtoId,
				itens: ingredientesDraft
			} });
			toast.success(isNew ? "Produto criado" : "Produto atualizado");
			onSaved();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Erro");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "mt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: isNew ? "Novo produto" : `Editar: ${produto.nome}` }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "grid gap-4 md:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nome" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: draft.nome,
					onChange: (e) => setDraft({
						...draft,
						nome: e.target.value
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Categoria" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm",
					value: draft.categoria_id ?? "",
					onChange: (e) => setDraft({
						...draft,
						categoria_id: e.target.value || null
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "—"
					}), completa.categorias.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: c.id,
						children: c.nome
					}, c.id))]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Descrição curta" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: draft.descricao_curta ?? "",
						onChange: (e) => setDraft({
							...draft,
							descricao_curta: e.target.value
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Descrição completa" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: draft.descricao ?? "",
						onChange: (e) => setDraft({
							...draft,
							descricao: e.target.value
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Preço (R$)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "number",
					step: "0.01",
					value: draft.preco,
					onChange: (e) => setDraft({
						...draft,
						preco: Number(e.target.value)
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Preço antigo (R$, opcional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "number",
					step: "0.01",
					value: draft.preco_antigo ?? "",
					onChange: (e) => setDraft({
						...draft,
						preco_antigo: e.target.value ? Number(e.target.value) : null
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "md:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploadField, {
						label: "Imagem",
						value: draft.imagem_url ?? "",
						onChange: (url) => setDraft({
							...draft,
							imagem_url: url
						}),
						token,
						empresaId: completa.empresa.id,
						pasta: "produtos"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tempo de preparo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: draft.tempo_preparo ?? "",
					onChange: (e) => setDraft({
						...draft,
						tempo_preparo: e.target.value
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tag" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm",
					value: draft.tag ?? "",
					onChange: (e) => setDraft({
						...draft,
						tag: e.target.value || null
					}),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "mais-vendido",
							children: "Mais vendido"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "promocao",
							children: "Promoção"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "novo",
							children: "Novo"
						})
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: draft.ativo,
						onCheckedChange: (v) => setDraft({
							...draft,
							ativo: v
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Produto ativo (visível no cardápio)" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:col-span-2 space-y-2 rounded-lg border p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ingredientes" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Marque como \"removível\" os ingredientes que o cliente pode pedir pra tirar. Os que ficarem desmarcados são fixos/obrigatórios. Se não cadastrar nenhum, a seção de remover ingrediente não aparece pra esse produto no cardápio."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-1",
							children: ingredientesDraft.map((ing, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex-1 truncate",
										children: ing.nome
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-center gap-1 text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: ing.removivel,
											onChange: (e) => setIngredientesDraft((list) => list.map((it, idx) => idx === i ? {
												...it,
												removivel: e.target.checked
											} : it))
										}), "removível"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										size: "sm",
										variant: "ghost",
										onClick: () => setIngredientesDraft((list) => list.filter((_, idx) => idx !== i)),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
									})
								]
							}, i))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Ex: Cebola",
								value: novoIngrediente,
								onChange: (e) => setNovoIngrediente(e.target.value),
								onKeyDown: (e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addIngrediente();
									}
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: "outline",
								onClick: addIngrediente,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" })
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:col-span-2 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: onSave,
						disabled: busy,
						children: busy ? "Salvando..." : "Salvar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: onClose,
						children: "Cancelar"
					})]
				})
			]
		})]
	});
}
function CategoriasTab({ completa, token, onSaved }) {
	const [editing, setEditing] = (0, import_react.useState)(null);
	function blankCategoria() {
		return {
			id: "",
			empresa_id: completa.empresa.id,
			slug: "",
			nome: "",
			emoji: "",
			imagem_url: "",
			ordem: completa.categorias.length,
			ativo: true,
			categorias_opcao_ids: []
		};
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Categorias"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setEditing(blankCategoria()),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-3 w-3" }), " Nova categoria"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2 lg:grid-cols-3",
				children: completa.categorias.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex items-center justify-between p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [c.imagem_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: c.imagem_url,
							alt: c.nome,
							className: "h-10 w-10 rounded-xl object-cover"
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display font-semibold",
							children: [
								!c.imagem_url && c.emoji,
								" ",
								c.nome
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: c.slug
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => setEditing(c),
							children: "Editar"
						})
					})]
				}) }, c.id))
			}),
			editing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: editing.id ? "Editar categoria" : "Nova categoria" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 md:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nome" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: editing.nome,
									onChange: (e) => setEditing({
										...editing,
										nome: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Slug" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: editing.slug,
									onChange: (e) => setEditing({
										...editing,
										slug: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Emoji" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: editing.emoji ?? "",
									onChange: (e) => setEditing({
										...editing,
										emoji: e.target.value
									}),
									placeholder: "Ex: um emoji de comida"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploadField, {
									label: "Imagem (opcional)",
									value: editing.imagem_url ?? "",
									onChange: (url) => setEditing({
										...editing,
										imagem_url: url
									}),
									token,
									empresaId: completa.empresa.id,
									pasta: "categorias"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: "Se preencher, substitui o emoji no card."
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: editing.ativo,
										onCheckedChange: (v) => setEditing({
											...editing,
											ativo: v
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ativa" })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Adicionais desta categoria" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Escolha quais categorias de adicional (criadas na aba Personalização) aparecem pros produtos dessa categoria."
							}),
							completa.categoriasOpcao.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: "Você ainda não criou nenhuma categoria de adicional. Vá na aba Personalização pra criar (ex: \"Tipo de pão\", \"Molhos\")."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 flex flex-wrap gap-3",
								children: completa.categoriasOpcao.map((co) => {
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-center gap-2 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: editing.categorias_opcao_ids.includes(co.id),
											onChange: (e) => setEditing({
												...editing,
												categorias_opcao_ids: e.target.checked ? [...editing.categorias_opcao_ids, co.id] : editing.categorias_opcao_ids.filter((id) => id !== co.id)
											})
										}), co.nome]
									}, co.id);
								})
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: async () => {
									await saveCategoria({ data: {
										token,
										empresaId: completa.empresa.id,
										categoria: editing
									} });
									toast.success("Categoria salva");
									onSaved();
								},
								children: "Salvar"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setEditing(null),
								children: "Cancelar"
							})]
						})
					]
				})]
			})
		]
	});
}
function PromocoesTab({ completa, onSaved }) {
	const grouped = {
		"mais-vendido": [],
		"promocao": [],
		"novo": []
	};
	for (const p of completa.produtos) if (p.tag) grouped[p.tag].push(p);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Promoções do dia" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-sm text-muted-foreground",
		children: [
			"A \"promoção do dia\" na home é o produto com tag",
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "promocao" }),
			" em ordem. Defina a ordem dos produtos com tag promoção na aba ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Produtos" }),
			" (em breve: dropdown para escolher 1 destaque manual). Por enquanto, a primeira opção será a usada."
		]
	}), grouped["promocao"].length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-4 text-sm",
		children: "Nenhum produto marcado como promoção."
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-4 space-y-2 text-sm",
		children: grouped["promocao"].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				p.nome,
				" — ",
				brl(p.preco)
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: ["ordem ", p.ordem] })]
		}, p.id))
	})] })] });
}
function CuponsTab({ completa, token, onSaved }) {
	const cfg = completa.config;
	const [draft, setDraft] = (0, import_react.useState)(getCupons(cfg));
	async function save() {
		const newCfg = {
			...cfg,
			cupons: draft
		};
		await saveEmpresaConfig({ data: {
			token,
			empresaId: completa.empresa.id,
			data: newCfg
		} });
		toast.success("Cupons salvos");
		onSaved();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Cupons de desconto" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-3",
		children: [draft.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "CÓDIGO",
					value: c.code,
					onChange: (e) => {
						const cp = [...draft];
						cp[i] = {
							...c,
							code: e.target.value.toUpperCase()
						};
						setDraft(cp);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "number",
					placeholder: "% desconto",
					value: c.discount,
					onChange: (e) => {
						const cp = [...draft];
						cp[i] = {
							...c,
							discount: Number(e.target.value)
						};
						setDraft(cp);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Descrição",
					value: c.desc,
					onChange: (e) => {
						const cp = [...draft];
						cp[i] = {
							...c,
							desc: e.target.value
						};
						setDraft(cp);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "destructive",
					size: "sm",
					onClick: () => setDraft(draft.filter((_, j) => j !== i)),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
				})
			]
		}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: () => setDraft([...draft, {
					code: "",
					discount: 10,
					desc: ""
				}]),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-3 w-3" }), " Adicionar cupom"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: save,
				children: "Salvar"
			})]
		})]
	})] });
}
function EntregaTab({ completa, token, onSaved }) {
	const cfg = completa.config;
	const frete = getFrete(cfg);
	const [taxa, setTaxa] = (0, import_react.useState)(frete.taxa);
	const [gratis, setGratis] = (0, import_react.useState)(frete.gratis_habilitado);
	const [acimaDe, setAcimaDe] = (0, import_react.useState)(frete.gratis_acima_de ?? 0);
	const [bairros, setBairros] = (0, import_react.useState)(getBairros(cfg));
	async function save() {
		await saveEmpresaConfig({ data: {
			token,
			empresaId: completa.empresa.id,
			data: {
				...cfg,
				frete: {
					taxa: Number(taxa),
					gratis_habilitado: !!gratis,
					gratis_acima_de: gratis ? Number(acimaDe) : null
				},
				bairros: bairros.filter((b) => b.name.trim().length > 0)
			}
		} });
		toast.success("Configurações de entrega salvas");
		onSaved();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Bairros e taxa de entrega" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Cadastre os bairros que você entrega e o valor de cada um. Se tiver pelo menos um bairro aqui, o cardápio público passa a pedir rua, número e bairro (em vez de endereço livre), e a taxa de entrega é calculada automaticamente pelo bairro escolhido — a \"Taxa de entrega\" fixa abaixo deixa de ser usada."
					}),
					bairros.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Nome do bairro",
								value: b.name,
								onChange: (e) => {
									const cp = [...bairros];
									cp[i] = {
										...b,
										name: e.target.value
									};
									setBairros(cp);
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								step: "0.01",
								placeholder: "Taxa (R$)",
								value: b.fee,
								onChange: (e) => {
									const cp = [...bairros];
									cp[i] = {
										...b,
										fee: Number(e.target.value)
									};
									setBairros(cp);
								},
								className: "w-32"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "destructive",
								size: "sm",
								onClick: () => setBairros(bairros.filter((_, j) => j !== i)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
							})
						]
					}, b.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setBairros([...bairros, {
							id: crypto.randomUUID(),
							name: "",
							fee: 0
						}]),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-3 w-3" }), " Adicionar bairro"]
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Taxa de entrega fixa" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: bairros.length > 0 ? "Como você tem bairros cadastrados acima, essa taxa fixa não é mais usada — fica aqui só de reserva caso você apague todos os bairros." : "Usada enquanto você não cadastrar nenhum bairro acima."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Taxa de entrega (R$)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								step: "0.01",
								value: taxa,
								onChange: (e) => setTaxa(Number(e.target.value))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Frete grátis acima de (R$)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								step: "0.01",
								disabled: !gratis,
								value: acimaDe,
								onChange: (e) => setAcimaDe(Number(e.target.value))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: gratis,
									onCheckedChange: setGratis
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Frete grátis habilitado" })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "O \"frete grátis acima de\" vale mesmo com bairros cadastrados — passando desse valor, a entrega fica grátis não importa o bairro."
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: save,
				children: "Salvar"
			})
		]
	});
}
function PersonalizacaoTab({ completa, token, onSaved }) {
	const [criando, setCriando] = (0, import_react.useState)(false);
	const categorias = [...completa.categoriasOpcao].sort((a, b) => a.ordem - b.ordem);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Categorias de adicional"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Crie quantas categorias quiser (ex: \"Tipo de pão\", \"Sabor da massa\", \"Molhos\") e escolha se o cliente pode marcar uma ou várias opções. Depois, ligue cada categoria às categorias de produto na aba Categorias."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setCriando(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-3 w-3" }), " Nova categoria de adicional"]
				})]
			}),
			criando && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoriaOpcaoEditor, {
				completa,
				token,
				categoriaOpcao: {
					id: "",
					empresa_id: completa.empresa.id,
					slug: "",
					nome: "",
					selecao: "unica",
					obrigatorio: false,
					ordem: categorias.length
				},
				onDone: () => {
					setCriando(false);
					onSaved();
				},
				onCancel: () => setCriando(false)
			}),
			categorias.length === 0 && !criando && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "py-8 text-center text-sm text-muted-foreground",
				children: "Nenhuma categoria de adicional criada ainda."
			}) }),
			categorias.map((co) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpcoesSection, {
				categoriaOpcao: co,
				items: completa.opcoes.filter((o) => o.categoria_opcao_id === co.id),
				completa,
				token,
				onSaved
			}, co.id))
		]
	});
}
function CategoriaOpcaoEditor({ completa, token, categoriaOpcao, onDone, onCancel }) {
	const [draft, setDraft] = (0, import_react.useState)(categoriaOpcao);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const isNew = !categoriaOpcao.id;
	function slugify(nome) {
		return nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
	}
	async function save() {
		if (!draft.nome.trim()) {
			toast.error("Dê um nome pra categoria");
			return;
		}
		setBusy(true);
		try {
			await saveCategoriaOpcao({ data: {
				token,
				empresaId: completa.empresa.id,
				categoriaOpcao: {
					...draft,
					slug: draft.slug || slugify(draft.nome)
				}
			} });
			toast.success(isNew ? "Categoria criada" : "Categoria atualizada");
			onDone();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Erro");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: isNew ? "Nova categoria de adicional" : `Editar: ${categoriaOpcao.nome}` }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "grid gap-3 md:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nome (ex: Tipo de pão)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: draft.nome,
				onChange: (e) => setDraft({
					...draft,
					nome: e.target.value
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tipo de seleção" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				className: "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm",
				value: draft.selecao,
				onChange: (e) => setDraft({
					...draft,
					selecao: e.target.value
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "unica",
					children: "Única (só uma opção)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "multipla",
					children: "Múltipla (pode marcar várias)"
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: draft.obrigatorio,
					onCheckedChange: (v) => setDraft({
						...draft,
						obrigatorio: v
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Obrigatório escolher" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md:col-span-2 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: save,
					disabled: busy,
					children: busy ? "Salvando..." : "Salvar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: onCancel,
					children: "Cancelar"
				})]
			})
		]
	})] });
}
function OpcoesSection({ categoriaOpcao, items, completa, token, onSaved }) {
	const [draft, setDraft] = (0, import_react.useState)(items);
	const [editandoCategoria, setEditandoCategoria] = (0, import_react.useState)(false);
	async function save() {
		const newIds = new Set(draft.map((d) => d.id).filter(Boolean));
		for (const o of items) if (!newIds.has(o.id)) await deleteOpcao({ data: {
			token,
			empresaId: completa.empresa.id,
			opcaoId: o.id
		} });
		for (const o of draft) await saveOpcao({ data: {
			token,
			empresaId: completa.empresa.id,
			opcao: {
				...o,
				empresa_id: completa.empresa.id,
				categoria_opcao_id: categoriaOpcao.id
			}
		} });
		toast.success(`${categoriaOpcao.nome} atualizado`);
		onSaved();
	}
	async function excluirCategoria() {
		if (!confirm(`Excluir a categoria "${categoriaOpcao.nome}" e todas as suas opções?`)) return;
		await deleteCategoriaOpcao({ data: {
			token,
			empresaId: completa.empresa.id,
			categoriaOpcaoId: categoriaOpcao.id
		} });
		toast.success("Categoria excluída");
		onSaved();
	}
	if (editandoCategoria) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoriaOpcaoEditor, {
		completa,
		token,
		categoriaOpcao,
		onDone: () => {
			setEditandoCategoria(false);
			onSaved();
		},
		onCancel: () => setEditandoCategoria(false)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
		className: "flex flex-row items-center justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, { children: [
			categoriaOpcao.nome,
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-xs font-normal text-muted-foreground",
				children: [
					"(",
					categoriaOpcao.selecao === "multipla" ? "múltipla escolha" : "escolha única",
					categoriaOpcao.obrigatorio ? ", obrigatório" : "",
					")"
				]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				onClick: () => setEditandoCategoria(true),
				children: "Editar categoria"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "destructive",
				onClick: excluirCategoria,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
			})]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-2",
		children: [draft.map((o, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Nome",
					value: o.nome,
					onChange: (e) => {
						const cp = [...draft];
						cp[i] = {
							...o,
							nome: e.target.value
						};
						setDraft(cp);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "number",
					step: "0.01",
					placeholder: "+R$",
					value: o.preco_adicional,
					onChange: (e) => {
						const cp = [...draft];
						cp[i] = {
							...o,
							preco_adicional: Number(e.target.value)
						};
						setDraft(cp);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "destructive",
					size: "sm",
					onClick: () => setDraft(draft.filter((_, j) => j !== i)),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
				})
			]
		}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: () => setDraft([...draft, {
					id: "",
					empresa_id: completa.empresa.id,
					categoria_opcao_id: categoriaOpcao.id,
					nome: "",
					preco_adicional: 0,
					ordem: draft.length
				}]),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-3 w-3" }), " Adicionar opção"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				onClick: save,
				children: ["Salvar ", categoriaOpcao.nome]
			})]
		})]
	})] });
}
function ConfigTab({ completa, token, onSaved }) {
	const empresa = completa.empresa;
	const cfg = completa.config;
	const cores = getCores(cfg);
	const [nome, setNome] = (0, import_react.useState)(empresa.nome);
	const [whatsapp, setWhatsapp] = (0, import_react.useState)(empresa.whatsapp);
	const [endereco, setEndereco] = (0, import_react.useState)(empresa.endereco ?? "");
	const [pixChave, setPixChave] = (0, import_react.useState)(empresa.pix_chave ?? "");
	const [logoUrl, setLogoUrl] = (0, import_react.useState)(empresa.logo_url ?? "");
	const [primary, setPrimary] = (0, import_react.useState)(cores.primary);
	const [accent, setAccent] = (0, import_react.useState)(cores.accent);
	const [bg, setBg] = (0, import_react.useState)(cores.bg);
	const [fg, setFg] = (0, import_react.useState)(cores.fg);
	const [cidade, setCidade] = (0, import_react.useState)(getCidadeEntrega(cfg));
	const [horarios, setHorarios] = (0, import_react.useState)(() => getHorarios(cfg));
	async function saveAll() {
		await updateEmpresa({ data: {
			token,
			empresaId: empresa.id,
			patch: {
				nome,
				whatsapp,
				endereco,
				pix_chave: pixChave,
				logo_url: logoUrl
			}
		} });
		await saveEmpresaConfig({ data: {
			token,
			empresaId: empresa.id,
			data: {
				...cfg,
				cores: {
					primary,
					accent,
					bg,
					fg
				},
				cidade_entrega: cidade,
				horarios: Object.fromEntries(horarios.map((h) => [[
					"domingo",
					"segunda",
					"terca",
					"quarta",
					"quinta",
					"sexta",
					"sabado"
				][h.day], {
					abre: h.open,
					fecha: h.close,
					fechado: h.closed
				}]))
			}
		} });
		toast.success("Configurações salvas");
		onSaved();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Identidade" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid gap-3 md:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nome" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: nome,
						onChange: (e) => setNome(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "WhatsApp" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: whatsapp,
						onChange: (e) => setWhatsapp(e.target.value.replace(/\D/g, ""))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "md:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Endereço" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: endereco,
							onChange: (e) => setEndereco(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Chave Pix" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: pixChave,
						onChange: (e) => setPixChave(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "URL do logo (opcional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: logoUrl,
						onChange: (e) => setLogoUrl(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "md:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Cidade de entrega (default no checkout)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: cidade,
							onChange: (e) => setCidade(e.target.value)
						})]
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Cores da marca" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Primária" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "color",
							value: primary,
							onChange: (e) => setPrimary(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: primary
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Accent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "color",
							value: accent,
							onChange: (e) => setAccent(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: accent
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Fundo" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "color",
							value: bg,
							onChange: (e) => setBg(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: bg
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Texto" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "color",
							value: fg,
							onChange: (e) => setFg(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: fg
						})
					] })
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Horário de funcionamento" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "space-y-2",
				children: horarios.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-24 text-sm font-semibold",
							children: h.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: !h.closed,
							onCheckedChange: (v) => {
								const cp = [...horarios];
								cp[i] = {
									...h,
									closed: !v
								};
								setHorarios(cp);
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "time",
							value: h.open,
							onChange: (e) => {
								const cp = [...horarios];
								cp[i] = {
									...h,
									open: e.target.value
								};
								setHorarios(cp);
							},
							disabled: h.closed,
							className: "w-28"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "até" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "time",
							value: h.close,
							onChange: (e) => {
								const cp = [...horarios];
								cp[i] = {
									...h,
									close: e.target.value
								};
								setHorarios(cp);
							},
							disabled: h.closed,
							className: "w-28"
						}),
						h.closed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							children: "fechado"
						})
					]
				}, h.day))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: saveAll,
				children: "Salvar tudo"
			})
		]
	});
}
var STATUS_OPTIONS = [
	"recebido",
	"preparando",
	"pronto",
	"entregue",
	"cancelado"
];
var FORMA_PAGAMENTO_LABELS = {
	pix: "Pix",
	cartao: "Cartão (na entrega)",
	dinheiro: "Dinheiro"
};
var STATUS_LABELS = {
	recebido: "Recebido",
	preparando: "Preparando",
	pronto: "Pronto",
	entregue: "Entregue",
	cancelado: "Cancelado"
};
var STATUS_BADGE_VARIANT = {
	recebido: "secondary",
	preparando: "default",
	pronto: "default",
	entregue: "secondary",
	cancelado: "destructive"
};
function PedidosTab({ completa, token }) {
	const empresaId = completa.empresa.id;
	const { data: pedidos = [], isLoading, refetch } = useQuery({
		queryKey: ["pedidos-empresa", empresaId],
		queryFn: () => listPedidosEmpresa({ data: {
			token,
			empresaId
		} }),
		enabled: !!token && !!empresaId,
		refetchInterval: 3e4
	});
	async function mudarStatus(pedidoId, status) {
		try {
			await updatePedidoStatus({ data: {
				token,
				empresaId,
				pedidoId,
				status
			} });
			toast.success("Status atualizado");
			refetch();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Erro ao atualizar status");
		}
	}
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Carregando pedidos..."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: "Pedidos"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				onClick: () => refetch(),
				children: "Atualizar"
			})]
		}), pedidos.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "py-12 text-center text-sm text-muted-foreground",
			children: "Nenhum pedido recebido ainda."
		}) }) : pedidos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-2 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display font-semibold",
							children: [
								"#",
								p.numero,
								" · ",
								p.cliente_nome
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [p.cliente_telefone, p.endereco ? ` · ${p.endereco}` : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: new Date(p.criado_em).toLocaleString("pt-BR")
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: STATUS_BADGE_VARIANT[p.status],
						children: STATUS_LABELS[p.status]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1 text-sm",
					children: p.itens.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								it.qtd,
								"x ",
								it.nome,
								it.obs ? ` (${it.obs})` : ""
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: brl(it.preco_unit * it.qtd) })]
					}, i))
				}),
				p.forma_pagamento && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Pagamento: "
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: FORMA_PAGAMENTO_LABELS[p.forma_pagamento] }),
						p.forma_pagamento === "dinheiro" && p.troco_para != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								" ",
								"— troco pra ",
								brl(p.troco_para),
								" (levar ",
								brl(p.troco_para - p.valor_total),
								")"
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between border-t pt-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: "Total"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display font-semibold",
						children: brl(p.valor_total)
					})]
				}),
				p.forma_pagamento && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-1 text-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						children: [
							p.forma_pagamento === "pix" && "Pix",
							p.forma_pagamento === "cartao" && "Cartão",
							p.forma_pagamento === "dinheiro" && (p.troco_para ? `Dinheiro · troco para ${brl(p.troco_para)}` : "Dinheiro · sem troco")
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 pt-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs text-muted-foreground",
						children: "Status:"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "flex h-9 rounded-md border border-input bg-background px-2 text-sm",
						value: p.status,
						onChange: (e) => mudarStatus(p.id, e.target.value),
						children: STATUS_OPTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s,
							children: STATUS_LABELS[s]
						}, s))
					})]
				})
			]
		}) }, p.id))]
	});
}
function ContaTab({ completa, token }) {
	const empresaId = completa.empresa.id;
	const { data, isLoading } = useQuery({
		queryKey: ["plano-empresa", empresaId],
		queryFn: () => getPlanoDaEmpresa({ data: {
			token,
			empresaId
		} }),
		enabled: !!token && !!empresaId
	});
	if (isLoading || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Carregando plano..."
	});
	const { plano, status_pagamento, produtos_usados } = data;
	const limite = plano.limite_produtos;
	const statusLabel = status_pagamento === "ativo" ? "Ativa" : status_pagamento === "atrasado" ? "Atrasada" : "Suspensa";
	const statusVariant = status_pagamento === "ativo" ? "default" : status_pagamento === "atrasado" ? "secondary" : "destructive";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Plano atual" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg font-semibold",
							children: plano.nome
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: statusVariant,
							children: statusLabel
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [brl(plano.preco_mensal), "/mês"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Produtos usados: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: produtos_usados }),
							limite != null ? ` de ${limite}` : " (sem limite)"
						] }), limite != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 h-2 w-full overflow-hidden rounded-full bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full bg-primary",
								style: { width: `${Math.min(100, produtos_usados / limite * 100)}%` }
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "space-y-1 text-sm text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [plano.tem_shopping ? "✅" : "—", " Shopping da Mata"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [plano.tem_destaque ? "✅" : "—", " Destaque pago"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [plano.tem_tv ? "✅" : "—", " Painel para TV"] })
						]
					})
				]
			})] }),
			status_pagamento !== "ativo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-destructive/40 bg-destructive/10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-4 text-sm text-destructive",
					children: [
						"Sua assinatura está ",
						statusLabel.toLowerCase(),
						". Fale com a plataforma pra regularizar."
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Quer fazer upgrade de plano? Fale com a plataforma pelo suporte."
			})
		]
	});
}
function SegurancaTab({ token }) {
	const [novaSenha, setNovaSenha] = (0, import_react.useState)("");
	const [confirmarSenha, setConfirmarSenha] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSave() {
		if (novaSenha.length < 6) {
			toast.error("A senha precisa ter pelo menos 6 caracteres");
			return;
		}
		if (novaSenha !== confirmarSenha) {
			toast.error("As senhas não são iguais");
			return;
		}
		setBusy(true);
		try {
			await changeOwnPassword({ data: {
				token,
				novaSenha
			} });
			toast.success("Senha alterada com sucesso");
			setNovaSenha("");
			setConfirmarSenha("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Erro ao trocar senha");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Trocar senha" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "max-w-sm space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Se você entrou com a senha padrão que veio no cadastro, aproveita e já troca por uma senha só sua."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nova senha" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "password",
				value: novaSenha,
				onChange: (e) => setNovaSenha(e.target.value),
				placeholder: "Mínimo 6 caracteres"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Confirmar nova senha" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "password",
				value: confirmarSenha,
				onChange: (e) => setConfirmarSenha(e.target.value)
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: onSave,
				disabled: busy,
				children: busy ? "Salvando..." : "Salvar nova senha"
			})
		]
	})] });
}
//#endregion
export { PainelTenant as component };
