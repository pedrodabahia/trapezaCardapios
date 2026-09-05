// Só LISTA os produtos da Pank Lanches num arquivo JSON local — não altera
// nada no banco. Usado pra eu (Claude) ver os nomes exatos antes de escolher
// as imagens certas pra cada grupo de produto.
//
// Como rodar:
//   cd ~/Downloads/pedidoPronto
//   node scripts/list-produtos-pank.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const raw = readFileSync(new URL("../.env", import.meta.url), "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

const env = loadEnv();
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: empresas, error: empresaErr } = await supabase
    .from("empresas")
    .select("id, nome, slug")
    .ilike("nome", "%pank%");

  if (empresaErr) throw empresaErr;
  if (!empresas || empresas.length !== 1) {
    console.error("❌ Esperava achar exatamente 1 empresa com 'pank' no nome.");
    process.exit(1);
  }

  const empresa = empresas[0];

  const { data: produtos, error } = await supabase
    .from("produtos")
    .select("id, nome, categoria_id")
    .eq("empresa_id", empresa.id)
    .order("ordem");

  if (error) throw error;

  const outPath = new URL("./produtos-pank.json", import.meta.url);
  writeFileSync(outPath, JSON.stringify({ empresa, produtos }, null, 2), "utf8");

  console.log(`✅ ${produtos.length} produtos salvos em scripts/produtos-pank.json`);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
