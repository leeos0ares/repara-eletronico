import { formatarDataHora } from "@/lib/formatar";
import type { Movimentacao } from "@/types";

export default function LinhaDoTempo({ movimentacoes }: { movimentacoes: Movimentacao[] }) {
  // mais recente primeiro
  const ordenadas = [...movimentacoes].reverse();

  if (ordenadas.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>;
  }

  return (
    <ol className="border-l border-border pl-5">
      {ordenadas.map((mov, i) => (
        <li key={i} className="relative pb-4 last:pb-0">
          <span className="absolute top-1.5 -left-[25.5px] size-2 rounded-full bg-primary" />
          <p className="text-sm">{mov.texto}</p>
          <p className="text-xs text-muted-foreground">
            {formatarDataHora(mov.data)} por {mov.usuarioNome}
          </p>
        </li>
      ))}
    </ol>
  );
}
