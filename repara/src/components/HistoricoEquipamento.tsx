import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Campo from "@/components/Campo";
import { StatusBadge } from "@/components/Etiquetas";
import type { Role, StatusOS } from "@/lib/constantes";
import { formatarData, numeroOS } from "@/lib/formatar";
import { dbConnect } from "@/lib/mongodb";
import { OrdemServico } from "@/models/OrdemServico";

type Props = {
  equipamentoId: string;
  role: Role;
  userId: string;
};

// Todas as ordens que já passaram por este equipamento, da mais recente para a mais antiga.
// A página que usa este componente já garantiu que o usuário pode ver o equipamento.
export default async function HistoricoEquipamento({ equipamentoId, role, userId }: Props) {
  await dbConnect();

  const ordens = await OrdemServico.find({ equipamentoId })
    .select(
      "numero status tecnicoId createdAt dataEntrega problemaRelatado diagnostico procedimentosRealizados pecasUtilizadas resultadoTestes"
    )
    .sort({ createdAt: -1 })
    .lean();

  const ehCliente = role === "cliente";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de reparos ({ordens.length})</CardTitle>
        <CardDescription>Do mais recente para o mais antigo.</CardDescription>
      </CardHeader>
      <CardContent>
        {ordens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma ordem de serviço para este equipamento ainda.</p>
        ) : (
          <ul className="flex flex-col gap-6">
            {ordens.map((ordem) => {
              const status = ordem.status as StatusOS;
              // o técnico só abre a ordem se for dele (as outras ele só consulta aqui)
              const podeAbrir = role !== "tecnico" || String(ordem.tecnicoId ?? "") === userId;
              // o cliente só vê o diagnóstico depois que a análise terminou
              const mostraDiagnostico = !ehCliente || (status !== "recebido" && status !== "em_diagnostico");

              return (
                <li key={String(ordem._id)} className="flex flex-col gap-3 border-l-2 border-border pl-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {podeAbrir ? (
                      <Link href={`/ordens/${ordem._id}`} className="font-mono font-medium hover:underline">
                        {numeroOS(ordem.numero)}
                      </Link>
                    ) : (
                      <span className="font-mono font-medium">{numeroOS(ordem.numero)}</span>
                    )}
                    <StatusBadge status={status} />
                    <span className="text-sm text-muted-foreground">Entrada em {formatarData(ordem.createdAt)}</span>
                    {ordem.dataEntrega && (
                      <span className="text-sm text-muted-foreground">Entregue em {formatarData(ordem.dataEntrega)}</span>
                    )}
                  </div>

                  <dl className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Campo label="Problema relatado" valor={ordem.problemaRelatado} />
                    </div>
                    {mostraDiagnostico && (
                      <div className="sm:col-span-2">
                        <Campo label="Diagnóstico" valor={ordem.diagnostico} />
                      </div>
                    )}
                    {!ehCliente && (
                      <>
                        <Campo label="Procedimentos realizados" valor={ordem.procedimentosRealizados} />
                        <Campo label="Peças utilizadas" valor={ordem.pecasUtilizadas} />
                        <div className="sm:col-span-2">
                          <Campo label="Resultado dos testes" valor={ordem.resultadoTestes} />
                        </div>
                      </>
                    )}
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
