import type { HttpValidationError } from "@/types/api";

/**
 * Erro normalizado de API — nunca contém stack traces do backend.
 * `detail` é uma mensagem curta pensada para utilizador (string da API
 * ou texto genérico derivado do estado HTTP).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly kind: "http" | "network" | "parse" | "validation";
  /** erros de validação por campo (loc → msg) quando 422 */
  readonly fieldErrors?: Record<string, string>;

  constructor(
    status: number,
    detail: string,
    kind: ApiError["kind"] = "http",
    fieldErrors?: Record<string, string>
  ) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.kind = kind;
    this.fieldErrors = fieldErrors;
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }
  get isNotFound(): boolean {
    return this.status === 404;
  }
  /** Falha de infraestrutura/rede — as páginas podem degradar com retry. */
  get isServerOrNetwork(): boolean {
    return this.kind === "network" || this.kind === "parse" || this.status >= 500;
  }
}

export function friendlyMessage(status: number): string {
  if (status === 404) return "Recurso não encontrado.";
  if (status === 401) return "Sessão expirada. Inicie sessão novamente.";
  if (status === 403) return "Sem permissões para esta operação.";
  if (status === 429) return "Demasiados pedidos. Aguarde uns segundos.";
  if (status >= 500) return "O servidor não conseguiu processar o pedido.";
  return "O pedido não pôde ser concluído.";
}

/** Converte o corpo de erro FastAPI em mensagem + erros de campo. */
export async function parseErrorBody(res: Response): Promise<{ detail: string; fieldErrors?: Record<string, string> }> {
  let body: unknown = null;
  try {
    body = await res.clone().json();
  } catch {
    try {
      const text = (await res.text()).slice(0, 200);
      if (text) return { detail: text };
    } catch {
      /* ignore */
    }
  }
  const err = body as HttpValidationError | null;
  if (err && Array.isArray(err.detail)) {
    const fieldErrors: Record<string, string> = {};
    for (const item of err.detail) {
      const field = Array.isArray(item.loc) ? String(item.loc[item.loc.length - 1] ?? "") : "";
      if (field) fieldErrors[field] = item.msg || "Valor inválido";
    }
    const first = err.detail[0];
    return {
      detail: first?.msg ? `Dados inválidos: ${first.msg}` : "Dados inválidos.",
      fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
    };
  }
  if (err && typeof err.detail === "string" && err.detail) {
    return { detail: err.detail };
  }
  return { detail: friendlyMessage(res.status) };
}
