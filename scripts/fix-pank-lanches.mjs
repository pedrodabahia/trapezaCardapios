// Script único (rode uma vez e pode apagar depois) pra:
//  1) Limpar o imagem_url quebrado de todos os produtos da empresa "Pank Lanches"
//  2) Criar os ingredientes removíveis de cada produto a partir do próprio nome
//     dele no banco (ex: "Frango, Queijo, Presunto" -> 3 ingredientes removíveis)
//
// Como rodar:
//   cd ~/Downloads/pedidoPronto
//   node scripts/fix-pank-lanches.mjs
//
// Não precisa instalar nada — usa o @supabase/supabase-js que já está no projeto,
// e lê a SUPABASE_SERVICE_ROLE_KEY direto do seu .env (chave de admin, ignora RLS).

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// --- Lê o .env manualmente (sem precisar do pacote dotenv) ---
function loadEnv() {
  const raw = readFileSync(new URL("../.env", import.meta.url), "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    env[key] = value;
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "❌ Não achei VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env. Confere se o arquivo existe na raiz do projeto.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  // 1) Acha a empresa "Pank Lanches" (busca por nome, sem depender do slug exato)
  const { data: empresas, error: empresaErr } = await supabase
    .from("empresas")
    .select("id, nome, slug")
    .ilike("nome", "%pank%");

  if (empresaErr) throw empresaErr;

  if (!empresas || empresas.length === 0) {
    console.error("❌ Nenhuma empresa encontrada com 'pank' no nome. Confere o nome cadastrado.");
    process.exit(1);
  }
  if (empresas.length > 1) {
    console.error(
      "❌ Achei mais de uma empresa com 'pank' no nome, preciso que você especifique qual:",
    );
    console.table(empresas);
    process.exit(1);
  }

  const empresa = empresas[0];
  console.log(`✅ Empresa encontrada: ${empresa.nome} (slug: ${empresa.slug})\n`);

  // 2) Busca todos os produtos dessa empresa
  const { data: produtos, error: produtosErr } = await supabase
    .from("produtos")
    .select("id, nome, imagem_url")
    .eq("empresa_id", empresa.id)
    .order("ordem");

  if (produtosErr) throw produtosErr;

  if (!produtos || produtos.length === 0) {
    console.log("Nenhum produto encontrado pra essa empresa. Nada a fazer.");
    return;
  }

  console.log(`📦 ${produtos.length} produtos encontrados. Processando...\n`);

  let imagensLimpas = 0;
  let produtosComIngredientesNovos = 0;
  let produtosJaTinhamIngredientes = 0;
  let produtosSemVirgula = 0;
  const erros = [];

  for (const produto of produtos) {
    // --- Parte 1: limpar imagem quebrada ---
    if (produto.imagem_url) {
      const { error } = await supabase
        .from("produtos")
        .update({ imagem_url: null })
        .eq("id", produto.id);

      if (error) {
        erros.push(`Imagem de "${produto.nome}": ${error.message}`);
      } else {
        imagensLimpas++;
      }
    }

    // --- Parte 2: criar ingredientes removíveis a partir do nome ---
    // Só faz sentido se o nome tiver vírgula (ex: "Frango, Queijo, Presunto").
    // Produtos sem vírgula (ex: bebidas avulsas) ficam de fora — não tem o que remover.
    if (!produto.nome.includes(",")) {
      produtosSemVirgula++;
      continue;
    }

    const { count, error: countErr } = await supabase
      .from("produto_ingredientes")
      .select("id", { count: "exact", head: true })
      .eq("produto_id", produto.id);

    if (countErr) {
      erros.push(`Checar ingredientes de "${produto.nome}": ${countErr.message}`);
      continue;
    }

    if (count && count > 0) {
      produtosJaTinhamIngredientes++;
      continue;
    }

    const ingredientes = produto.nome
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((nome, ordem) => ({
        produto_id: produto.id,
        nome,
        removivel: true,
        ordem,
      }));

    if (ingredientes.length === 0) continue;

    const { error: insertErr } = await supabase
      .from("produto_ingredientes")
      .insert(ingredientes);

    if (insertErr) {
      erros.push(`Inserir ingredientes de "${produto.nome}": ${insertErr.message}`);
    } else {
      produtosComIngredientesNovos++;
      console.log(`  ✓ ${produto.nome} → ${ingredientes.length} ingredientes`);
    }
  }

  console.log("\n──────── Resumo ────────");
  console.log(`Imagens quebradas limpas:         ${imagensLimpas}`);
  console.log(`Produtos com ingredientes criados: ${produtosComIngredientesNovos}`);
  console.log(`Produtos que já tinham ingredientes (pulados): ${produtosJaTinhamIngredientes}`);
  console.log(`Produtos sem vírgula no nome (pulados, ex: bebidas avulsas): ${produtosSemVirgula}`);

  if (erros.length > 0) {
    console.log(`\n⚠️  ${erros.length} erro(s):`);
    for (const e of erros) console.log(`  - ${e}`);
  } else {
    console.log("\n✅ Concluído sem erros.");
  }
}

main().catch((err) => {
  console.error("❌ Erro inesperado:", err);
  process.exit(1);
});
