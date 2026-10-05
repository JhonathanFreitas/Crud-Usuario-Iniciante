// Formato de usuário usado pelo frontend.
export interface Usuario {
  // O ID é criado pelo backend depois do cadastro.
  id?: number;
  nome: string;
  email: string;
  ativo: boolean;
}
