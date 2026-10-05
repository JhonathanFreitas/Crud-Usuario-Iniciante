import app from "./src/app";
import { getDatabase } from "./src/config/database";

const PORT = 3000;

// Confere a conexão antes de começar a receber requisições.
async function iniciarServidor(): Promise<void> {
  await getDatabase().query("SELECT 1");
  app.listen(PORT, () => {
    console.log(`Servidor disponível em http://localhost:${PORT}`);
  });
}

iniciarServidor().catch(async (erro: unknown) => {
  // Não imprime o link, que contém a senha.
  const codigo = (erro as { code?: string } | null)?.code;
  console.error("Não foi possível iniciar o backend. Confira DATABASE_URL, a senha e o link Session pooler do Supabase.");
  if (codigo) console.error(`Código do erro: ${codigo}`);
  process.exitCode = 1;
  if (process.env.DATABASE_URL) {
    try { await getDatabase().end(); } catch { /* Configuração inválida. */ }
  }
});
