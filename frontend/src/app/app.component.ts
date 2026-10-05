import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from "@angular/core";
import { Subscription } from "rxjs";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Usuario } from "./models/usuario.model";
import { UsuarioService } from "./services/usuario.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css", "./app.exclusao.css", "./app.busca.css"]
})
export class AppComponent implements OnInit, OnDestroy {
  // Dados usados para mostrar a lista e controlar o formulário.
  usuarios: Usuario[] = [];
  buscaNome = "";
  carregandoUsuarios = false;
  erroListagem = "";
  private consultaUsuarios?: Subscription;
  usuario: Usuario = { nome: "", email: "", ativo: true };
  editando = false;
  salvando = false;
  mostrarFormulario = false;
  mensagem = "";
  erroFormulario = "";
  usuarioParaExcluir: Usuario | null = null;
  excluindo = false;
  erroExclusao = "";

  // Abre o diálogo assim que o Angular o coloca na tela.
  @ViewChild("popup")
  set popup(elemento: ElementRef<HTMLDialogElement> | undefined) {
    if (elemento && !elemento.nativeElement.open) {
      elemento.nativeElement.showModal();
    }
  }

  @ViewChild("popupExclusao")
  set popupExclusao(elemento: ElementRef<HTMLDialogElement> | undefined) {
    if (elemento && !elemento.nativeElement.open) {
      elemento.nativeElement.showModal();
    }
  }

  constructor(private usuarioService: UsuarioService) {}

  // Carrega a lista assim que a tela abre.
  ngOnInit(): void {
    this.listarUsuarios();
  }

  // Consulta a lista no backend.
  listarUsuarios(): void {
    // Cancela a busca anterior para evitar que uma resposta antiga substitua a atual.
    this.consultaUsuarios?.unsubscribe();
    this.carregandoUsuarios = true;
    this.erroListagem = "";
    this.consultaUsuarios = this.usuarioService.listarUsuarios(this.buscaNome).subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.carregandoUsuarios = false;
      },
      error: () => {
        this.carregandoUsuarios = false;
        this.erroListagem = "Não foi possível carregar os usuários. Confira se o backend está ligado.";
      }
    });
  }

  ngOnDestroy(): void {
    this.consultaUsuarios?.unsubscribe();
  }

  // Abre o popup com os campos vazios.
  novoUsuario(): void {
    this.limparFormulario();
    this.mensagem = "";
    this.mostrarFormulario = true;
  }

  // Copia o usuário para o popup sem alterar a tabela antes de salvar.
  editarUsuario(usuario: Usuario): void {
    this.usuario = { ...usuario };
    this.editando = true;
    this.erroFormulario = "";
    this.mensagem = "";
    this.mostrarFormulario = true;
  }

  // Cadastra ou atualiza o usuário e fecha o popup após o sucesso.
  salvarUsuario(): void {
    if (this.salvando) return;
    this.salvando = true;
    this.erroFormulario = "";
    // Na edição usamos PUT; no cadastro usamos POST.
    const operacao = this.editando && this.usuario.id !== undefined
      ? this.usuarioService.atualizarUsuario(this.usuario.id, this.usuario)
      : this.usuarioService.criarUsuario(this.usuario);
    operacao.subscribe({
      next: () => {
        this.mensagem = this.editando
          ? "Usuário atualizado com sucesso!"
          : "Usuário cadastrado com sucesso!";
        this.salvando = false;
        this.limparFormulario();
        this.listarUsuarios();
      },
      error: (erro) => {
        this.salvando = false;
        this.erroFormulario = erro.error?.mensagem || "Não foi possível salvar o usuário.";
      }
    });
  }

  // Solicita confirmação antes de excluir.
  excluirUsuario(usuario: Usuario): void {
    if (usuario.id === undefined || this.excluindo) return;
    this.usuarioParaExcluir = { ...usuario };
    this.erroExclusao = "";
    this.mensagem = "";
  }

  cancelarExclusao(): void {
    if (this.excluindo) return;
    this.usuarioParaExcluir = null;
    this.erroExclusao = "";
  }

  confirmarExclusao(): void {
    const id = this.usuarioParaExcluir?.id;
    if (id === undefined || this.excluindo) return;
    this.excluindo = true;
    this.erroExclusao = "";
    this.usuarioService.excluirUsuario(id).subscribe({
      next: () => {
        this.excluindo = false;
        this.cancelarExclusao();
        this.mensagem = "Usuário excluído com sucesso!";
        this.listarUsuarios();
      },
      error: (erro) => {
        this.excluindo = false;
        this.erroExclusao = erro.error?.mensagem || "Não foi possível excluir o usuário. Tente novamente.";
      }
    });
  }

  // Fecha o popup, exceto enquanto a requisição está em andamento.
  fecharFormulario(): void {
    if (!this.salvando) this.limparFormulario();
  }

  limparFormulario(): void {
    this.usuario = { nome: "", email: "", ativo: true };
    this.editando = false;
    this.mostrarFormulario = false;
    this.erroFormulario = "";
  }
}
