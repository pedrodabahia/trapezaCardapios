import type { EmpresaRepository, EmpresaPatch } from "../repositories/empresa.repository";
import type { UsuarioRepository } from "@/modules/usuarios/repositories/usuario.repository";
import type {
  Empresa,
  EmpresaConfigJson,
  NovaEmpresaInput,
  NovaEmpresaExternaInput,
  EmpresaPlataformaPatch,
} from "../types/empresa.types";

// Aceita só http/https com host de verdade — pega tanto "não é uma URL"
// quanto coisas tipo "javascript:..." que passariam num regex ingênuo.
function validarUrlExterna(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      "URL externa inválida. Use um endereço completo, ex: https://www.exemplo.com.br",
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("URL externa precisa começar com http:// ou https://");
  }
}

export class EmpresaService {
  constructor(
    private repository: EmpresaRepository,
    private usuarioRepository: UsuarioRepository,
  ) {}

  buscarPorId(empresaId: string) {
    return this.repository.buscarPorId(empresaId);
  }

  listarPublicasAtivas() {
    return this.repository.listarPublicasAtivas();
  }

  listarTodas() {
    return this.repository.listarTodas();
  }

  async atualizar(empresaId: string, patch: EmpresaPatch) {
    await this.repository.atualizar(empresaId, patch);
  }

  async salvarConfig(empresaId: string, config: EmpresaConfigJson) {
    await this.repository.salvarConfig(empresaId, config);
  }

  // Cria a empresa + config vazia + usuário admin. Se a criação do usuário
  // falhar, desfaz a empresa (rollback) pra não ficar registro "meia-boca".
  async criar(input: NovaEmpresaInput) {
    const primeiroVencimento = new Date();
    primeiroVencimento.setDate(primeiroVencimento.getDate() + 30);

    const empresa = await this.repository.criar({
      slug: input.slug,
      nome: input.nome,
      whatsapp: input.whatsapp,
      plano_id: input.planoId,
      proximo_vencimento: primeiroVencimento.toISOString().slice(0, 10),
    });
    await this.repository.criarConfigVazia(empresa.id);

    try {
      const { tempPassword } = await this.usuarioRepository.criarAdmin(input.adminEmail, empresa.id);
      return { ok: true as const, empresaId: empresa.id, tempPassword };
    } catch (err) {
      await this.repository.remover(empresa.id);
      throw err;
    }
  }

  async atualizarStatus(empresaId: string, status: Empresa["status_pagamento"]) {
    await this.repository.atualizarStatus(empresaId, status);
  }

  // Soma 30 dias no vencimento (a partir do vencimento atual se ainda não
  // passou, ou de hoje se já tiver vencido) e volta o status pra ativo.
  async renovarAssinatura(empresaId: string) {
    const vencimentoAtualStr = await this.repository.buscarVencimento(empresaId);
    const hoje = new Date();
    const vencimentoAtual = vencimentoAtualStr
      ? new Date(vencimentoAtualStr + "T00:00:00")
      : hoje;
    const base = vencimentoAtual > hoje ? vencimentoAtual : hoje;
    base.setDate(base.getDate() + 30);
    const proximoVencimento = base.toISOString().slice(0, 10);
    await this.repository.atualizarVencimento(empresaId, proximoVencimento, "ativo");
    return { ok: true as const, proximoVencimento };
  }

  async remover(empresaId: string) {
    await this.repository.remover(empresaId);
  }

  // Empresa externa: só entra no diretório (sem login/painel/página
  // pública). Já nasce ativa — não tem cobrança nem vencimento.
  async criarExterna(input: NovaEmpresaExternaInput) {
    validarUrlExterna(input.urlExterna);
    const empresa = await this.repository.criarExterna(input);
    return { ok: true as const, empresaId: empresa.id };
  }

  // Edição do perfil de diretório (nome, categoria, cidade, destaque,
  // url externa etc) por qualquer tipo de empresa — só super-admin chama
  // isso (ver authPlatform no controller).
  async atualizarPlataforma(empresaId: string, patch: EmpresaPlataformaPatch) {
    if (patch.url_externa) validarUrlExterna(patch.url_externa);
    await this.repository.atualizarPlataforma(empresaId, patch);
  }
}
