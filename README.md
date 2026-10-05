# CRUD de Usuários

Aplicação CRUD para cadastro, consulta, edição e exclusão de usuários.

O projeto possui um frontend em Angular, uma API em Node.js com Express e utiliza PostgreSQL no Supabase para armazenar os dados.

## Tecnologias

- Angular
- TypeScript
- Node.js
- Express
- PostgreSQL
- Supabase

## Funcionalidades

- Cadastrar usuários
- Listar usuários
- Buscar usuários pelo nome
- Editar usuários
- Excluir usuários
- Definir usuário como ativo ou inativo
- Validação de nome e e-mail

## Como executar

### Backend

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` baseado no `.env.example` e configure a conexão com o Supabase:

```env
DATABASE_URL="sua_url_do_supabase"
```

Execute o backend:

```bash
npm run dev
```

A API ficará disponível em:

```text
http://localhost:3000
```

### Frontend

Abra outro terminal:

```bash
cd frontend
npm install
npm start
```

Acesse:

```text
http://localhost:4200
```

## Banco de dados

No Supabase, execute o arquivo:

```text
backend/supabase/schema.sql
```

Esse script cria a tabela de usuários utilizada pelo projeto.
