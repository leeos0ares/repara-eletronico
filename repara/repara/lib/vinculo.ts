import { randomBytes } from "node:crypto";

// Código que o admin entrega ao cliente cadastrado no balcão. Ex.: "A1B2C-3D4E5"
export function gerarCodigoVinculo() {
  const hex = randomBytes(5).toString("hex").toUpperCase(); // 10 caracteres aleatórios
  return `${hex.slice(0, 5)}-${hex.slice(5)}`;
}

// Aceita com ou sem hífen, em minúsculas ou com espaços
export function normalizarCodigo(valor: unknown) {
  return String(valor ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}
