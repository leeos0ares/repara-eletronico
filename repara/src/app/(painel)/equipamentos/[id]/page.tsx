import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { isValidObjectId } from "mongoose";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { TIPO_EQUIPAMENTO_LABEL, type TipoEquipamento } from "@/lib/constantes";
import { Cliente } from "@/models/Cliente";
import { Equipamento } from "@/models/Equipamento";
import Campo from "@/components/Campo";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HistoricoEquipamento from "@/components/HistoricoEquipamento";

export default async function EquipamentoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!isValidObjectId(id)) notFound();

  await dbConnect();
  const equipamento = await Equipamento.findById(id).lean();
  if (!equipamento) notFound();

  const cliente = await Cliente.findById(equipamento.clienteId).lean();

  // cliente só pode ver equipamento dele (se não for, finge que não existe)
  if (session.user.role === "cliente" && cliente?.usuarioId?.toString() !== session.user.id) notFound();

  const specs = equipamento.especificacoes;
  const temSpecs = specs && Object.values(specs).some(Boolean);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/equipamentos" className="text-sm text-muted-foreground hover:underline">
            Voltar para equipamentos
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {equipamento.marca} {equipamento.modelo}
          </h1>
        </div>
        {session.user.role === "admin" && (
          <Link href={`/ordens/nova?equipamento=${id}`} className={buttonVariants()}>
            Abrir ordem de serviço
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do equipamento</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Campo label="Tipo" valor={TIPO_EQUIPAMENTO_LABEL[equipamento.tipo as TipoEquipamento]} />
            <Campo label="Cliente" valor={cliente?.nome} />
            <Campo label="Número de série" valor={equipamento.numeroSerie} />
            <Campo label="Descrição" valor={equipamento.descricao} />
            {temSpecs && (
              <>
                <Campo label="Processador" valor={specs?.processador} />
                <Campo label="Memória RAM" valor={specs?.memoriaRam} />
                <Campo label="Placa de vídeo" valor={specs?.placaVideo} />
                <Campo label="Armazenamento" valor={specs?.armazenamento} />
              </>
            )}
            <div className="sm:col-span-2">
              <Campo label="Observações" valor={equipamento.observacoes} />
            </div>
          </dl>
        </CardContent>
      </Card>

      <HistoricoEquipamento equipamentoId={id} role={session.user.role} userId={session.user.id} />
    </div>
  );
}
