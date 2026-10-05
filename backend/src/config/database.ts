import dotenv from "dotenv";
import { Pool } from "pg";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { rootCertificates } from "tls";

dotenv.config();
let pool: Pool | undefined;

export function getDatabase(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("Cole o link PostgreSQL com a senha em DATABASE_URL no arquivo backend/.env.");
  }

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("DATABASE_URL deve ser o link postgresql://usuario:senha@host:porta/postgres.");
  }
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname || !url.username || !url.password) {
    throw new Error("DATABASE_URL deve conter o link PostgreSQL completo, incluindo usuário e senha.");
  }
  if (decodeURIComponent(url.password).includes("[YOUR-PASSWORD]")) {
    throw new Error("Substitua [YOUR-PASSWORD] pela senha do banco no link DATABASE_URL.");
  }

  // Mantém TLS com verificação de certificado mesmo se o link tiver sslmode.
  for (const param of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) {
    url.searchParams.delete(param);
  }
  // Localiza o certificado tanto no código TypeScript quanto no build em dist.
  const certificatePath = [
    resolve(__dirname, "../../supabase/certs/prod-ca-2021.crt"),
    resolve(__dirname, "../../../supabase/certs/prod-ca-2021.crt")
  ].find((path) => existsSync(path));
  if (!certificatePath) {
    throw new Error("Certificado SSL ausente: backend/supabase/certs/prod-ca-2021.crt.");
  }
  pool = new Pool({
    connectionString: url.toString(),
    ssl: {
      rejectUnauthorized: true,
      ca: [...rootCertificates, readFileSync(certificatePath, "utf8")]
    },
    max: 5,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000
  });
  pool.on("error", () => {
    console.error("Uma conexão ociosa com o banco foi encerrada. O pool tentará reconectar na próxima consulta.");
  });
  return pool;
}
