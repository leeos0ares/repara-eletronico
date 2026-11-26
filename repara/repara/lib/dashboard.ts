import type { Prioridade, StatusOS } from "@/lib/constantes";

// Formato das ordens (já com populate) usadas nos dashboards
export type OrdemResumo = {
  _id: { toString(): string };
  numero: number;
  status: StatusOS;
  prioridade?: Prioridade;
  prazoEstimado?: Date | null;
  dataConclusao?: Date | null;
  dataEntrega?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  problemaRelatado?: string;
  equipamentoId?: { _id: { toString(): string }; marca: string; modelo: string } | null;
  clienteId?: { nome: string } | null;
  tecnicoId?: { nome: string } | null;
  movimentacoes?: { data: Date; usuarioNome: string; texto: string }[];
};

// Para ordenar a fila do técnico (urgente primeiro)
export const PESO_PRIORIDADE: Record<Prioridade, number> = { urgente: 0, alta: 1, normal: 2, baixa: 3 };

const DIA = 24 * 60 * 60 * 1000;

// Por que uma ordem em aberto merece atenção (lista vazia = está tudo certo)
export function motivosAtencao(ordem: OrdemResumo): string[] {
  const motivos: string[] = [];
  const agora = Date.now();
  const naoConcluida = ordem.status !== "pronto_retirada" && ordem.status !== "recusado";

  if (naoConcluida && ordem.prioridade === "urgente") {
    motivos.push("Prioridade urgente");
  }

  // o prazo é salvo ao meio-dia, então só consideramos vencido depois do fim daquele dia
  if (naoConcluida && ordem.prazoEstimado && new Date(ordem.prazoEstimado).getTime() + DIA / 2 < agora) {
    motivos.push("Prazo vencido");
  }

  if (ordem.status === "pronto_retirada" && ordem.dataConclusao && agora - new Date(ordem.dataConclusao).getTime() > 7 * DIA) {
    motivos.push("Pronto há mais de 7 dias sem retirada");
  }

  if (ordem.status === "recusado") {
    motivos.push("Orçamento recusado: falta decidir a devolução");
  }

  return motivos;
}
