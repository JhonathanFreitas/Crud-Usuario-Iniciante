import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Usuario } from "../models/usuario.model";

@Injectable({ providedIn: "root" })
export class UsuarioService {
  // Endereço base da API do backend.
  private apiUrl = "http://localhost:3000/usuarios";
  constructor(private http: HttpClient) {}
  // Os métodos abaixo enviam as ações do CRUD para a API.
  listarUsuarios(nome = ""): Observable<Usuario[]> {
    let params = new HttpParams();
    if (nome.trim()) params = params.set("nome", nome.trim());
    return this.http.get<Usuario[]>(this.apiUrl, { params });
  }
  buscarUsuarioPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }
  criarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }
  atualizarUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }
  excluirUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
