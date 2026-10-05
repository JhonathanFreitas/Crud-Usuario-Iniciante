import { QueryResultRow } from "pg";
import { getDatabase } from "../config/database";
import { HttpError } from "../errors/http-error";
import { Usuario } from "../types/usuario";

const campos = "id, nome, email, ativo";

// Os valores são enviados separadamente do SQL para evitar injeção.
async function consultar<T extends QueryResultRow>(sql: string, valores: unknown[] = []): Promise<T[]> {
  try {
    const resultado = await getDatabase().query<T>(sql, valores);
    return resultado.rows;
  } catch (erro) {
    if ((erro as { code?: string } | null)?.code === "23505") {
      throw new HttpError(400, "Este e-mail já está cadastrado.");
    }
    throw erro;
  }
}

export async function listarUsuarios(nome = ""): Promise<Usuario[]> {
  if (nome) {
    return consultar<Usuario>(
      `SELECT ${campos} FROM public.usuarios WHERE nome ILIKE $1 ORDER BY id`,
      [`%${nome}%`]
    );
  }
  return consultar<Usuario>(`SELECT ${campos} FROM public.usuarios ORDER BY id`);
}

export async function buscarUsuarioPorId(id: number): Promise<Usuario | undefined> {
  const usuarios = await consultar<Usuario>(`SELECT ${campos} FROM public.usuarios WHERE id = $1`, [id]);
  return usuarios[0];
}

export async function criarUsuario(dados: Omit<Usuario, "id">): Promise<Usuario> {
  const usuarios = await consultar<Usuario>(
    `INSERT INTO public.usuarios (nome, email, ativo) VALUES ($1, $2, $3) RETURNING ${campos}`,
    [dados.nome, dados.email, dados.ativo]
  );
  if (!usuarios[0]) throw new Error("O banco não retornou o usuário cadastrado.");
  return usuarios[0];
}

export async function atualizarUsuario(
  id: number, dados: Omit<Usuario, "id">
): Promise<Usuario | undefined> {
  const usuarios = await consultar<Usuario>(
    `UPDATE public.usuarios SET nome = $1, email = $2, ativo = $3 WHERE id = $4 RETURNING ${campos}`,
    [dados.nome, dados.email, dados.ativo, id]
  );
  return usuarios[0];
}

export async function excluirUsuario(id: number): Promise<boolean> {
  const usuarios = await consultar<{ id: number }>(
    "DELETE FROM public.usuarios WHERE id = $1 RETURNING id", [id]
  );
  return usuarios.length > 0;
}
