const FUSO = "America/Sao_Paulo";
type Data = string | Date | null | undefined;

export function formatarData(valor?: Data) {
  if (!valor) return "—";
  return new Date(valor).toLocaleDateString("pt-BR", { timeZone: FUSO });
}

export function formatarDataHora(valor?: Data) {
  if (!valor) return "—";
  return new Date(valor).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: FUSO });
}

export function formatarMoeda(valor?: number | null) {
  return (valor ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// 7 -> "#0007"
export function numeroOS(numero: number) {
  return `#${String(numero).padStart(4, "0")}`;
}
