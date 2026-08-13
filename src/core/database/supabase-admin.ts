// Re-exporta o cliente admin do Supabase (service_role) que já existia em
// src/lib/supabase-server-auth.ts. Centralizamos o acesso a dados sob core/
// sem duplicar a implementação nem quebrar quem ainda importa do caminho
// antigo — os dois caminhos apontam pro mesmo client.
export { adminClient } from "@/lib/supabase-server-auth";
