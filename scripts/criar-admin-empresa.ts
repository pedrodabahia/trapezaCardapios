// Cria o admin (Supabase Auth) pra uma empresa que já existe no banco mas
// nunca passou pelo fluxo normal de "Nova empresa" — é exatamente o caso
// da Pank Lanches, criada direto via SQL, sem login.
//
// Roda com bun (ele já carrega o .env sozinho):
//
//   bun run scripts/criar-admin-empresa.ts pank-lanches dono@pank.com
//
// Troca "pank-lanches" pelo slug e "dono@pank.com" pelo email que você
// quer usar. Se já existir um usuário com esse empresa_id, o script avisa
// e não cria duplicado.

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const [, , slug, email] = process.argv;

if (!slug || !email) {
  console.error("Uso: bun run scripts/criar-admin-empresa.ts <slug> <email>");
  process.exit(1);
}

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltam VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}

const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  const { data: empresa, error: empresaErr } = await sb
    .from("empresas")
    .select("id, nome, slug")
    .eq("slug", slug)
    .single();

  if (empresaErr || !empresa) {
    console.error(`Empresa com slug "${slug}" não encontrada.`, empresaErr?.message ?? "");
    process.exit(1);
  }

  // Confere se já existe admin pra essa empresa (mesma lógica do
  // buscarAdminPorEmpresa do usuario.repository.ts) — evita duplicar.
  let page = 1;
  const perPage = 200;
  while (true) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`Falha ao listar usuários: ${error.message}`);
    const jaExiste = data.users.find(
      (u) => (u.app_metadata as { empresa_id?: string } | null)?.empresa_id === empresa.id,
    );
    if (jaExiste) {
      console.log(`Já existe um admin pra "${empresa.nome}": ${jaExiste.email}`);
      console.log("Se esqueceu a senha, usa 'Trocar senha do cliente' no painel da plataforma.");
      process.exit(0);
    }
    if (data.users.length < perPage) break;
    page++;
  }

  const tempPassword =
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 6).toUpperCase() +
    "!";

  const { error: createErr } = await sb.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    app_metadata: { empresa_id: empresa.id, role: "admin" },
  });

  if (createErr) {
    console.error(`Falha ao criar admin: ${createErr.message}`);
    process.exit(1);
  }

  console.log(`Admin criado pra "${empresa.nome}" (slug: ${empresa.slug}).`);
  console.log(`Email: ${email}`);
  console.log(`Senha temporária: ${tempPassword}`);
  console.log(`Entra em /painel/login e troca a senha em Segurança assim que logar.`);
}

main();
