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
import CodigoVinculo from "@/components/CodigoVinculo";
import { formatarData } from "@/lib/formatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Server Component: busca direto no banco, por isso confere a permissão aqui também
export default async function ClienteDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "cliente") redirect("/dashboard");
  if (!isValidObjectId(id)) notFound();

  await dbConnect();
  // o código de vínculo só é carregado para o admin
  const consulta = Cliente.findById(id);
  if (session.user.role === "admin") consulta.select("+codigoVinculo");
  const cliente = await consulta.lean();
  if (!cliente) notFound();

  const equipamentos = await Equipamento.find({ clienteId: id }).sort({ createdAt: -1 }).lean();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <Link href="/clientes" className="text-sm text-muted-foreground hover:underline">
          Voltar para clientes
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{cliente.nome}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Campo label="E-mail" valor={cliente.email} />
            <Campo label="Telefone" valor={cliente.telefone} />
            {/* a data de cadastro vem do próprio _id do Mongo; formatarData usa o fuso de São Paulo */}
            <Campo label="Cadastrado em" valor={formatarData(cliente._id.getTimestamp())} />
            <Campo label="Conta no sistema" valor={cliente.usuarioId ? "Sim" : "Não"} />
            <div className="sm:col-span-2">
              <Campo label="Observações" valor={cliente.observacoes} />
            </div>
          </dl>
        </CardContent>
      </Card>

      {session.user.role === "admin" && !cliente.usuarioId && (
        <Card>
          <CardHeader>
            <CardTitle>Código de vínculo</CardTitle>
          </CardHeader>
          <CardContent>
            <CodigoVinculo clienteId={id} codigoInicial={cliente.codigoVinculo ?? null} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Equipamentos ({equipamentos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {equipamentos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum equipamento cadastrado para este cliente.</p>
          ) : (
            <ul className="divide-y divide-border">
              {equipamentos.map((equipamento) => (
                <li key={String(equipamento._id)}>
                  <Link
                    href={`/equipamentos/${equipamento._id}`}
                    className="flex items-center justify-between gap-3 py-3 hover:underline"
                  >
                    <span className="font-medium">
                      {equipamento.marca} {equipamento.modelo}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {TIPO_EQUIPAMENTO_LABEL[equipamento.tipo as TipoEquipamento]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
