// Preenche o imagem_url de TODOS os produtos da Pank Lanches
// com fotos reais do Pexels, escolhidas aleatoriamente por grupo.
//
// Como rodar:
//   cd ~/Downloads/pedidoPronto
//   node scripts/set-imagens-pank.mjs
//
// Precisa ter rodado list-produtos-pank.mjs antes
// (usa o scripts/produtos-pank.json gerado por ele).

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

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================================
// IMAGENS PADRÃO
// ============================================================
// Cada grupo pode ter várias imagens.
// O sistema escolherá uma delas aleatoriamente.
//
// Você pode adicionar quantas imagens quiser.
// Basta colocar outra URL dentro do array.
//
// Exemplo:
//
// burger: [
//   "imagem-1",
//   "imagem-2",
//   "imagem-3",
// ],
// ============================================================

const IMG = {
  crepe: [
    "https://images.pexels.com/photos/29143160/pexels-photo-29143160.jpeg",
    "https://images.pexels.com/photos/461430/pexels-photo-461430.jpeg",
    "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg",
    "https://images.pexels.com/photos/31262976/pexels-photo-31262976.jpeg",
    "https://images.pexels.com/photos/10386373/pexels-photo-10386373.jpeg",
    "https://images.pexels.com/photos/4725641/pexels-photo-4725641.jpeg",
  ],

  xFrango: [
    "https://images.pexels.com/photos/11354334/pexels-photo-11354334.jpeg",
    "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg",
    "https://images.pexels.com/photos/2271107/pexels-photo-2271107.jpeg",
    "https://images.pexels.com/photos/20525756/pexels-photo-20525756.jpeg",
    "https://images.pexels.com/photos/13573664/pexels-photo-13573664.jpeg",
  ],

  burger: [
    "https://images.pexels.com/photos/37296924/pexels-photo-37296924.jpeg",
    "https://images.pexels.com/photos/11264609/pexels-photo-11264609.jpeg",
    "https://images.pexels.com/photos/31450815/pexels-photo-31450815.jpeg",
    "https://images.pexels.com/photos/24387027/pexels-photo-24387027.jpeg",
    "https://images.pexels.com/photos/18086476/pexels-photo-18086476.png",
  ],

  misto: [
    "https://images.pexels.com/photos/15110224/pexels-photo-15110224.jpeg",
    "https://images.pexels.com/photos/372851/pexels-photo-372851.jpeg",
    "https://images.pexels.com/photos/209540/pexels-photo-209540.jpeg",
    "https://images.pexels.com/photos/37228248/pexels-photo-37228248.jpeg",
    "https://images.pexels.com/photos/33284038/pexels-photo-33284038.jpeg",
  ],

  file: [
    "https://images.pexels.com/photos/37228413/pexels-photo-37228413.jpeg",
  ],

  vinho: [
    "https://images.pexels.com/photos/10842242/pexels-photo-10842242.jpeg",
    "https://media.istockphoto.com/id/837387558/pt/foto/pouring-red-wine-into-a-wineglass.jpg?b=1&s=612x612&w=0&k=20&c=5xYGP21cyxdUAxJCwpoTlfvDkeInSvtTx3mYsknt4Mk=",
    "https://images.pexels.com/photos/21967056/pexels-photo-21967056.jpeg"
  ],

  cerveja: [
    "https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg",
    "https://images.pexels.com/photos/11031115/pexels-photo-11031115.png",
    "https://images.pexels.com/photos/20769832/pexels-photo-20769832.jpeg",
    "https://images.pexels.com/photos/10183871/pexels-photo-10183871.jpeg",
  ],

  destilado: [
    "https://images.pexels.com/photos/14856491/pexels-photo-14856491.jpeg",
    "https://images.pexels.com/photos/34508723/pexels-photo-34508723.jpeg",
  ],

  suco: [
    "https://images.pexels.com/photos/1233319/pexels-photo-1233319.jpeg",
    "https://images.pexels.com/photos/32751740/pexels-photo-32751740.jpeg",
    "https://images.pexels.com/photos/2479242/pexels-photo-2479242.jpeg",
    "https://images.pexels.com/photos/37214597/pexels-photo-37214597.jpeg",

  ],
};

// ============================================================
// NOMES ESPECÍFICOS
// ============================================================

const MISTO_NOMES = new Set([
  "Queijo Quente",
  "Misto Quente",
  "Misto Burguer",
  "Misto Egg Burguer",
  "Misto Egg",
  "Americano",
  "Bauru",
]);

const DESTILADO_NOMES = new Set([
  "Vodka",
  "Conhaque Dreher",
  "Bacardi",
  "Campari",
  "Martini",
  "Cuba",
  "Domecq",
  "Wisky",
]);

// ============================================================
// ESCOLHE UMA IMAGEM ALEATÓRIA
// ============================================================

function imagemAleatoria(lista) {
  const indice = Math.floor(Math.random() * lista.length);

  return lista[indice];
}

// ============================================================
// ESCOLHE O GRUPO DE IMAGEM DO PRODUTO
// ============================================================

function escolherImagem(nome) {
  // Crepes: "01 - Frango, queijo..."
  if (/^\d+\s*-/.test(nome)) {
    return {
      grupo: "crepe",
      url: imagemAleatoria(IMG.crepe),
    };
  }

  if (nome.startsWith("X-Frango")) {
    return {
      grupo: "xFrango",
      url: imagemAleatoria(IMG.xFrango),
    };
  }

  if (nome.includes("Filé")) {
    return {
      grupo: "file",
      url: imagemAleatoria(IMG.file),
    };
  }

  if (MISTO_NOMES.has(nome)) {
    return {
      grupo: "misto",
      url: imagemAleatoria(IMG.misto),
    };
  }

  if (nome.startsWith("Vinho")) {
    return {
      grupo: "vinho",
      url: imagemAleatoria(IMG.vinho),
    };
  }

  if (nome.includes("Cerveja")) {
    return {
      grupo: "cerveja",
      url: imagemAleatoria(IMG.cerveja),
    };
  }

  if (DESTILADO_NOMES.has(nome)) {
    return {
      grupo: "destilado",
      url: imagemAleatoria(IMG.destilado),
    };
  }

  if (nome.startsWith("Suco de")) {
    return {
      grupo: "suco",
      url: imagemAleatoria(IMG.suco),
    };
  }

  // Sobra:
  // Hambúrguer
  // X-Burguer
  // X-Egg
  // X-Bacon
  // X-Salada
  // X-Tudo
  // Especial Duplo
  //
  // Todos recebem uma imagem aleatória de hambúrguer.

  return {
    grupo: "burger",
    url: imagemAleatoria(IMG.burger),
  };
}

// ============================================================
// EXECUÇÃO
// ============================================================

async function main() {
  const jsonPath = new URL("./produtos-pank.json", import.meta.url);

  const { produtos } = JSON.parse(
    readFileSync(jsonPath, "utf8")
  );

  console.log(
    `📦 ${produtos.length} produtos carregados de produtos-pank.json\n`
  );

  const contagem = {};

  let ok = 0;

  const erros = [];

  for (const produto of produtos) {
    const { grupo, url } = escolherImagem(produto.nome);

    const { error } = await supabase
      .from("produtos")
      .update({
        imagem_url: url,
      })
      .eq("id", produto.id);

    if (error) {
      erros.push(`${produto.nome}: ${error.message}`);
      continue;
    }

    ok++;

    contagem[grupo] = (contagem[grupo] || 0) + 1;

    console.log(
      `✅ ${produto.nome} → ${grupo}`
    );
  }

  // ==========================================================
  // RESUMO
  // ==========================================================

  console.log("\n──────── Resumo ────────");

  console.log(
    `Produtos atualizados: ${ok}/${produtos.length}\n`
  );

  for (const [grupo, quantidade] of Object.entries(contagem)) {
    console.log(
      `  ${grupo.padEnd(10)} ${quantidade}`
    );
  }

  // ==========================================================
  // ERROS
  // ==========================================================

  if (erros.length > 0) {
    console.log(`\n⚠️  ${erros.length} erro(s):`);

    for (const erro of erros) {
      console.log(`  - ${erro}`);
    }
  } else {
    console.log("\n✅ Concluído sem erros.");
  }
}

// ============================================================
// TRATAMENTO GLOBAL DE ERRO
// ============================================================

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});