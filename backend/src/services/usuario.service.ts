import { Usuario } from "../types/usuario";
import { HttpError } from "../errors/http-error";
import * as repository from "../repositories/usuario.repositories";

export function listarUsuarios(nome = ""): Promise<Usuario[]> {
  return repository.listarUsuarios(nome.trim());
}

export function buscarUsuarioPorId(id: number): Promise<Usuario | undefined> {
  return repository.buscarUsuarioPorId(id);
}

// Valida e organiza os dados usados no cadastro e na edição.
function validarDados(dados: Omit<Usuario, "id">): Omit<Usuario, "id"> {
  if (typeof dados.nome !== "string" || !dados.nome.trim()) {
    throw new HttpError(400, "O nome é obrigatório.");
  }
  if (
    typeof dados.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())
  ) {
    throw new HttpError(400, "Informe um e-mail válido.");
  }
  if (typeof dados.ativo !== "boolean") {
    throw new HttpError(400, "O campo ativo deve ser true ou false.");
  }
  return {
    nome: dados.nome.trim(),
    email: dados.email.trim().toLowerCase(),
    ativo: dados.ativo
  };
}

export async function criarUsuario(dados: Omit<Usuario, "id">): Promise<Usuario> {
  return repository.criarUsuario(validarDados(dados));
}

export async function atualizarUsuario(
  id: number, dados: Omit<Usuario, "id">
): Promise<Usuario | undefined> {
  const usuario = await repository.buscarUsuarioPorId(id);
  if (!usuario) return undefined;
  return repository.atualizarUsuario(id, validarDados(dados));
}

export function excluirUsuario(id: number): Promise<boolean> {
  return repository.excluirUsuario(id);
}
