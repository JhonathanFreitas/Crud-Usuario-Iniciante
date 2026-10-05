import { NextFunction, Request, Response } from "express";
import * as service from "../services/usuario.service";

function validarId(req: Request, res: Response): number | undefined {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({ mensagem: "Informe um ID válido." });
    return undefined;
  }
  return id;
}

function validarCorpo(req: Request, res: Response): boolean {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    res.status(400).json({ mensagem: "Envie os dados do usuário em JSON." });
    return false;
  }
  return true;
}

// Express 4 exige encaminhar erros assíncronos ao middleware com next.
export async function listarUsuarios(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  const nome = req.query.nome;
  if (nome !== undefined && typeof nome !== "string") {
    res.status(400).json({ mensagem: "Informe um nome válido para a busca." });
    return;
  }
  try {
    res.status(200).json(await service.listarUsuarios(nome));
  } catch (erro) { next(erro); }
}

export async function buscarUsuarioPorId(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  const id = validarId(req, res);
  if (id === undefined) return;
  try {
    const usuario = await service.buscarUsuarioPorId(id);
    if (!usuario) {
      res.status(404).json({ mensagem: "Usuário não encontrado." });
      return;
    }
    res.status(200).json(usuario);
  } catch (erro) { next(erro); }
}

export async function criarUsuario(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  if (!validarCorpo(req, res)) return;
  try {
    res.status(201).json(await service.criarUsuario(req.body));
  } catch (erro) { next(erro); }
}

export async function atualizarUsuario(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  const id = validarId(req, res);
  if (id === undefined || !validarCorpo(req, res)) return;
  try {
    const usuario = await service.atualizarUsuario(id, req.body);
    if (!usuario) {
      res.status(404).json({ mensagem: "Usuário não encontrado." });
      return;
    }
    res.status(200).json(usuario);
  } catch (erro) { next(erro); }
}

export async function excluirUsuario(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  const id = validarId(req, res);
  if (id === undefined) return;
  try {
    if (!await service.excluirUsuario(id)) {
      res.status(404).json({ mensagem: "Usuário não encontrado." });
      return;
    }
    res.status(204).send();
  } catch (erro) { next(erro); }
}
