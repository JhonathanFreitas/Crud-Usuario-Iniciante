<div align="center">

# 👥 CRUD de Usuários

**Gerencie usuários com uma interface simples e dados salvos no Supabase.**

![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-222222?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=222222)

[Funcionalidades](#-funcionalidades) · [Como executar](#-como-executar) · [Estrutura](#-estrutura-do-projeto) · [API](#-rotas-da-api)

</div>

---

## 📌 Sobre o projeto

Aplicação para praticar o desenvolvimento de um CRUD completo: **criar, consultar,
atualizar e excluir** usuários. O frontend em Angular conversa com uma API Express,
e o backend conecta ao PostgreSQL do Supabase usando um link com a senha do banco.

Os usuários possuem **nome, e-mail e status ativo/inativo**. Os dados permanecem
salvos mesmo depois de reiniciar o servidor.

## ✨ Funcionalidades

- Cadastro e edição em janelas sobre a lista de usuários.
- Busca por parte do nome enquanto você digita, sem diferenciar maiúsculas e minúsculas.
- Confirmação de exclusão com nome e e-mail do usuário.
- Indicação de usuário ativo ou inativo.
- Validação de nome, e-mail e status no backend.
- Bloqueio de e-mails duplicados pelo banco de dados.
- Mensagens de carregamento, sucesso, erro e busca sem resultados.
- Layout adaptado para telas menores.
- Conexão ao banco com SSL e certificado do Supabase verificado.

## 🛠️ Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Interface | Angular 18, HTML, CSS e formulários com `ngModel` |
| Comunicação | `HttpClient` e RxJS |
| API | Node.js, Express 4 e TypeScript |
| Banco de dados | PostgreSQL hospedado no Supabase |
| Conexão | `pg`, pool de conexões e configuração com `dotenv` |
| Testes do backend | Test runner nativo do Node.js |

## 🚀 Como executar

### 1. Preparar o ambiente

Tenha o **Node.js e o npm** instalados e um **projeto no Supabase**.
Os comandos abaixo são para PowerShell no Windows. Em outros terminais, use
`npm` no lugar de `npm.cmd`.

Clone o repositório ou baixe e extraia o ZIP. Abra um terminal na pasta principal,
que contém `backend` e `frontend`.

### 2. Criar a tabela no Supabase

No painel do Supabase, abra **SQL Editor**, cole o conteúdo de
[`backend/supabase/schema.sql`](backend/supabase/schema.sql) e clique em **Run**.

O script cria a tabela `public.usuarios`. Se essa tabela já existir com a estrutura
do projeto, pule esta etapa.

### 3. Configurar o backend

Na pasta principal do projeto:

```powershell
cd backend
npm.cmd ci
```

Se ainda não tiver um arquivo `.env`, crie a partir do exemplo:

```powershell
Copy-Item .env.example .env
```

No painel do Supabase, abra **Connect → Session pooler → URI**. Copie o link e
substitua `[YOUR-PASSWORD]` pela **senha do banco** definida na criação do projeto.
Cole o link no arquivo `backend/.env`:

```dotenv
DATABASE_URL="postgresql://postgres.PROJETO:SENHA@HOST_POOLER:5432/postgres"
```

Esse endereço é apenas um exemplo: use o host e o usuário do link do seu projeto.
Se a senha contiver caracteres reservados, codifique-os na URL: `@` vira `%40`,
`#` vira `%23`, `?` vira `%3F`, `/` vira `%2F` e `%` vira `%25`.

**Mantenha o link somente no `.env` do backend**, pois ele contém a senha.
O `.gitignore` já impede o envio desse arquivo ao Git.

O certificado público está incluído em
[`backend/supabase/certs/prod-ca-2021.crt`](backend/supabase/certs/prod-ca-2021.crt)
e é carregado automaticamente. Não é necessário configurar uma secret key.

Inicie a API:

```powershell
npm.cmd run dev
```

O backend verifica a conexão antes de iniciar em **http://localhost:3000**.

### 4. Iniciar o frontend

Abra **outro terminal** na pasta principal:

```powershell
cd frontend
npm.cmd ci
npm.cmd start
```

Acesse **http://localhost:4200** no navegador. Mantenha os dois terminais abertos.

## 📂 Estrutura do projeto

```text
backend/
├── src/
│   ├── config/          # Conexão PostgreSQL e certificado SSL
│   ├── controllers/     # Entrada e saída das requisições HTTP
│   ├── errors/          # Erros com status HTTP
│   ├── repositories/    # Consultas SQL parametrizadas
│   ├── routes/          # Endereços da API
│   ├── services/        # Validações e regras do CRUD
│   ├── types/           # Tipos dos dados
│   └── app.ts           # Configuração do Express
├── supabase/            # Script da tabela e certificado público
├── tests/               # Testes do backend
├── .env.example         # Modelo de configuração sem credenciais reais
└── server.ts            # Inicialização do servidor

frontend/
└── src/
    └── app/
        ├── models/      # Modelo de usuário
        ├── services/    # Chamadas HTTP para o backend
        └── app.component.*  # Tela, formulários e confirmação de exclusão
```

O backend segue este fluxo:

```mermaid
flowchart LR
    A[Angular] --> B[Rotas e controllers]
    B --> C[Services: validações]
    C --> D[Repositories: SQL]
    D --> E[(PostgreSQL no Supabase)]
```

## 🔌 Rotas da API

Endereço base: `http://localhost:3000`.

| Método | Rota | Ação |
| --- | --- | --- |
| `GET` | `/` | Verificar se a API está respondendo |
| `GET` | `/usuarios` | Listar todos os usuários |
| `GET` | `/usuarios?nome=ana` | Buscar por parte do nome |
| `GET` | `/usuarios/:id` | Consultar um usuário pelo ID |
| `POST` | `/usuarios` | Cadastrar um usuário |
| `PUT` | `/usuarios/:id` | Atualizar nome, e-mail e status |
| `DELETE` | `/usuarios/:id` | Excluir um usuário |

Exemplo de corpo JSON para cadastro ou edição:

```json
{
  "nome": "Ana Silva",
  "email": "ana@example.com",
  "ativo": true
}
```

O ID é gerado pelo banco. O backend remove espaços nas extremidades do nome e
do e-mail e salva o e-mail em letras minúsculas.

## ✅ Verificação

Dentro de `backend`, execute:

```powershell
npm.cmd test
```

O comando compila o backend e executa os testes de CRUD, busca, validações,
duplicidade, tratamento de erros e configuração da conexão. As consultas são
simuladas nos testes; eles não modificam seu banco no Supabase.

Para compilar cada parte, execute na respectiva pasta:

```powershell
npm.cmd run build
```

## 💡 Problemas comuns

| Problema | O que conferir |
| --- | --- |
| Backend não inicia | Preencha `DATABASE_URL` em `backend/.env` e confirme que o projeto do Supabase está disponível. |
| Código `28P01` | Confira a senha do banco e a codificação de caracteres especiais no link. |
| Código `ENOTFOUND` | Confira o host copiado do painel do Supabase. |
| Erro de certificado SSL | Mantenha `backend/supabase/certs` junto do backend. |
| Tabela não encontrada | Execute o script SQL para criar `public.usuarios`. |
| Interface não carrega os usuários | Confira se o backend está rodando na porta 3000. |

Mais detalhes sobre a conexão estão no [README do backend](backend/README.md).

## 📚 Escopo

Este projeto é um CRUD para estudo e ainda não possui login ou autorização.
Antes de publicar a API para acesso externo, implemente o controle de acesso.

`node_modules`, `dist` e `.env` ficam fora do Git. Os arquivos `package-lock.json`
devem acompanhar o projeto para permitir a instalação com `npm ci`.
