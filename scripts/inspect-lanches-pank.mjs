// Só MOSTRA os campos completos de alguns lanches (não-crepe) da Pank
// Lanches, pra eu ver o formato do subtítulo antes de escrever o script
// que extrai os ingredientes de verdade. Não altera nada no banco.
//
// Como rodar:
//   cd ~/Downloads/pedidoPronto
//   node scripts/inspect-lanches-pank.mjs

import { readFileSync } from "node:fs";
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
  const { data: empresas } = await supabase
    .from("empresas")
    .select("id")
    .ilike("nome", "%pank%");

  const empresa = empresas[0];

  const { data: produtos, error } = await supabase
    .from("produtos")
    .select("id, nome, descricao_curta, descricao, ingredientes")
    .eq("empresa_id", empresa.id)
    .not("nome", "ilike", "%,%") // pula os crepes numerados (já têm vírgula)
    .not("nome", "ilike", "0%") // pula qualquer coisa começando com número
    .limit(10);

  if (error) throw error;

  console.log(JSON.stringify(produtos, null, 2));
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
