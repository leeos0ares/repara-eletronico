import Link from "next/link";
import { StatusBadge } from "@/components/Etiquetas";
import { numeroOS } from "@/lib/formatar";
import type { OrdemResumo } from "@/lib/dashboard";

type Props = {
  ordem: OrdemResumo;
  mostrarCliente?: boolean;
  detalhe?: React.ReactNode; // linha extra embaixo (prazo, motivo, problema...)
};

export default function LinhaOrdem({ ordem, mostrarCliente = false, detalhe }: Props) {
  return (
    <li>
      <Link
        href={`/ordens/${ordem._id}`}
        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 hover:bg-muted/40"
      >
        <span className="min-w-0">
          <span className="font-mono text-sm font-medium">{numeroOS(ordem.numero)}</span>{" "}
          <span>
            {ordem.equipamentoId?.marca} {ordem.equipamentoId?.modelo}
          </span>
          {mostrarCliente && ordem.clienteId && (
            <span className="text-sm text-muted-foreground"> de {ordem.clienteId.nome}</span>
          )}
          {detalhe && <span className="block text-sm text-muted-foreground">{detalhe}</span>}
        </span>
        <StatusBadge status={ordem.status} />
      </Link>
    </li>
  );
}
