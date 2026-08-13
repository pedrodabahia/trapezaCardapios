import { adminClient } from "@/core/database/supabase-admin";

export interface UsuarioRepository {
  // Cria a conta de admin no Supabase Auth pra uma empresa nova, com senha
  // temporária gerada aqui mesmo.
  criarAdmin(email: string, empresaId: string): Promise<{ tempPassword: string }>;

  // Troca a senha de um usuário do Supabase Auth pelo id dele. Usado tanto
  // pro admin da empresa trocar a própria senha quanto pelo super-admin
  // pra resetar a senha de um cliente.
  alterarSenha(userId: string, novaSenha: string): Promise<void>;

  // Acha o usuário admin vinculado a uma empresa (pelo app_metadata.empresa_id).
  // Não existe uma coluna empresa->user no banco, então isso varre a listagem
  // de usuários do Supabase Auth até achar. Ok pro volume de clientes do MVP.
  buscarAdminPorEmpresa(empresaId: string): Promise<{ id: string; email: string } | null>;
}

export class SupabaseUsuarioRepository implements UsuarioRepository {
  private sb() {
    return adminClient();
  }

  async criarAdmin(email: string, empresaId: string): Promise<{ tempPassword: string }> {
    const tempPassword =
      Math.random().toString(36).slice(2, 10) +
      Math.random().toString(36).slice(2, 6).toUpperCase() +
      "!";
    const { error } = await this.sb().auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      app_metadata: { empresa_id: empresaId, role: "admin" },
    });
    if (error) throw new Error(`Failed to create admin: ${error.message}`);
    return { tempPassword };
  }

  async alterarSenha(userId: string, novaSenha: string): Promise<void> {
    const { error } = await this.sb().auth.admin.updateUserById(userId, {
      password: novaSenha,
    });
    if (error) throw new Error(`Failed to update password: ${error.message}`);
  }

  async buscarAdminPorEmpresa(empresaId: string): Promise<{ id: string; email: string } | null> {
    const perPage = 200;
    let page = 1;
    // Pagina a listagem de usuários do Supabase Auth até achar o que tem
    // esse empresa_id no app_metadata (não tem filtro nativo pra isso).
    while (true) {
      const { data, error } = await this.sb().auth.admin.listUsers({ page, perPage });
      if (error) throw new Error(`Failed to list users: ${error.message}`);
      const found = data.users.find(
        (u) => (u.app_metadata as { empresa_id?: string } | null)?.empresa_id === empresaId,
      );
      if (found) return { id: found.id, email: found.email ?? "" };
      if (data.users.length < perPage) return null;
      page++;
    }
  }
}
