# CRUD com Supabase via PostgreSQL

O Angular continua chamando a API Express em `http://localhost:3000/usuarios`.
O backend conecta ao PostgreSQL do Supabase usando apenas `DATABASE_URL`.

## 1. Criar a tabela

Se você já criou `public.usuarios`, não precisa executar o SQL novamente.
Para um projeto novo, abra **SQL Editor**, cole o conteúdo de
[supabase/schema.sql](supabase/schema.sql) e execute com **Run**.
A tabela possui ID automático e e-mail único. Os dados existentes são preservados.

## 2. Copiar o link de conexão

1. Abra seu projeto no painel do Supabase.
2. Clique em **Connect** no topo.
3. Selecione **Session pooler** e o formato **URI**.
4. Copie o link e substitua `[YOUR-PASSWORD]` pela senha do banco definida
   quando você criou o projeto. Essa senha é diferente da senha de login no Supabase.

Use os valores de host, porta e usuário do link copiado. O Session pooler
funciona em redes IPv4; a conexão Direct geralmente depende de IPv6.
Veja a [documentação de conexão](https://supabase.com/docs/guides/database/connecting-to-postgres).

No arquivo `backend/.env`, preencha:

```dotenv
DATABASE_URL="postgresql://postgres.PROJETO:SENHA@HOST_POOLER:5432/postgres"
```

O exemplo acima é ilustrativo: cole o link real do painel. Mantenha as aspas.
Se a senha tiver caracteres reservados, codifique esses caracteres na URL:
`@` vira `%40`, `#` vira `%23`, `?` vira `%3F`, `/` vira `%2F` e `%` vira `%25`.
As aspas evitam que o `.env` trate `#` como comentário, mas não substituem a
codificação dos caracteres na URL.

Se ainda não tiver `.env`, copie `.env.example` dentro da pasta `backend`:

```powershell
Copy-Item .env.example .env
```

Não sobrescreva um `.env` já preenchido. As variáveis antigas `SUPABASE_URL` e
`SUPABASE_SECRET_KEY` não são mais usadas e podem ser removidas.
O link fica somente no backend, pois contém a senha; o `.env` está ignorado pelo Git.
A conexão usa TLS com verificação de certificado.
O certificado público oficial do Supabase está incluído em
`supabase/certs/prod-ca-2021.crt` e é carregado automaticamente, inclusive no
build em `dist`. Mantenha a pasta `supabase/certs` junto do backend ao distribuí-lo.
Isso permite validar a cadeia SSL do banco sem alterar o link nem adicionar
variáveis ao `.env`. Consulte a
[documentação SSL do Supabase](https://supabase.com/docs/guides/platform/ssl-enforcement).

## 3. Iniciar

Em um terminal na pasta `backend`:

```powershell
npm.cmd install
npm.cmd run dev
```

O backend verifica a conexão com `SELECT 1` antes de iniciar na porta 3000.
Se não iniciar, confira o link, a senha, a disponibilidade do projeto e o código
apresentado no terminal. `28P01` indica falha de autenticação; `ENOTFOUND`
indica que o host não foi encontrado.

Em outro terminal na pasta `frontend`:

```powershell
npm.cmd start
```

Abra `http://localhost:4200` e use o CRUD. A mudança de conexão usa a mesma tabela
e não exige alterações na tela nem recadastro dos usuários.

## Verificar o código

```powershell
npm.cmd test
```

Os testes verificam as rotas com consultas de banco simuladas, incluindo
validações, duplicidade, erros e configuração. A conexão real depende do link
com a senha no `.env`.

Esta API continua sendo um CRUD sem login. Antes de publicar, adicione
autenticação e autorização na API.
