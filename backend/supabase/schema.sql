-- Execute no SQL Editor de um projeto novo do Supabase.
create table public.usuarios (
  id integer generated always as identity primary key,
  nome text not null check (length(trim(nome)) > 0),
  email text not null unique check (length(trim(email)) > 0),
  ativo boolean not null default true
);

-- O backend conecta com o usuário postgres do link Connect.
-- As chaves públicas da API continuam sem acesso à tabela.
alter table public.usuarios enable row level security;
revoke all on table public.usuarios from anon, authenticated;
grant select, insert, update, delete on table public.usuarios to service_role;
grant usage, select on sequence public.usuarios_id_seq to service_role;
