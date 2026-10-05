import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import usuarioRoutes from './routes/usuario.routes';
import { HttpError } from './errors/http-error';


const app = express();

app.use(cors());
// Permite que a API leia o corpo das requisições em JSON.
app.use(express.json());
// Rota inicial para verificar o funcionamento da API.
app.get("/", (_req, res) => {
  res.json({ mensagem: "API de usuários funcionando!" });
});

// Todas as rotas de usuários começam com /usuarios.
app.use("/usuarios", usuarioRoutes);


app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ mensagem: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ mensagem: 'Erro interno no servidor' });
});

export default app;
