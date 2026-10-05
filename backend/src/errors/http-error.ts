export class HttpError extends Error {
  constructor(public readonly status: number, mensagem: string) {
    super(mensagem);
  }
}
