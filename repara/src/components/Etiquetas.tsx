import { PRIORIDADE_LABEL, STATUS_LABEL, type Prioridade, type StatusOS } from "@/lib/constantes";

const coresStatus: Record<StatusOS, string> = {
  recebido: "border-slate-500/40 bg-slate-500/15 text-slate-200",
  em_diagnostico: "border-sky-500/40 bg-sky-500/15 text-sky-300",
  aguardando_aprovacao: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  aguardando_pecas: "border-orange-500/40 bg-orange-500/15 text-orange-300",
  em_reparo: "border-blue-500/40 bg-blue-500/15 text-blue-300",
  em_testes: "border-violet-500/40 bg-violet-500/15 text-violet-300",
  pronto_retirada: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  entregue: "border-zinc-500/40 bg-zinc-500/10 text-zinc-400",
  recusado: "border-red-500/40 bg-red-500/15 text-red-300",
  cancelado: "border-zinc-600/40 bg-zinc-600/10 text-zinc-500 line-through",
};

// Prioridade usa só borda e texto, para não se misturar com as cores do status
const coresPrioridade: Record<Prioridade, string> = {
  baixa: "border-border text-muted-foreground",
  normal: "border-border text-foreground",
  alta: "border-amber-500/60 text-amber-300",
  urgente: "border-red-500/70 bg-red-500/10 font-semibold text-red-300",
};

export function StatusBadge({ status }: { status: StatusOS }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs ${coresStatus[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PrioridadeBadge({ prioridade }: { prioridade: Prioridade }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-md border px-2 py-0.5 text-xs ${coresPrioridade[prioridade]}`}>
      {PRIORIDADE_LABEL[prioridade]}
    </span>
  );
}
