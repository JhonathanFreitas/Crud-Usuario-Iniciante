import { Router } from "express";
import * as controller from "../controllers/usuario.controller";

const router = Router();

// Lista todos os usuários.
router.get("/", controller.listarUsuarios);

// Busca um usuário pelo ID.
router.get("/:id", controller.buscarUsuarioPorId);

// Cadastra um usuário.
router.post("/", controller.criarUsuario);

// Atualiza um usuário pelo ID.
router.put("/:id", controller.atualizarUsuario);

// Exclui um usuário pelo ID.
router.delete("/:id", controller.excluirUsuario);

export default router;