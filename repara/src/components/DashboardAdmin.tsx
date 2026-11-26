import Link from "next/link";
import BarraSimples from "@/components/BarraSimples";
import CartaoNumero from "@/components/CartaoNumero";
import LinhaOrdem from "@/components/LinhaOrdem";
import { STATUS_LABEL, STATUS_OS, type StatusOS } from "@/lib/constantes";
import { motivosAtencao, type OrdemResumo } from "@/lib/dashboard";
import { formatarDataHora } from "@/lib/formatar";
import { dbConnect } from "@/lib/mongodb";
import { OrdemServico } from "@/models/OrdemServico";

// Server Component: busca direto no banco a cada acesso (a página é dinâmica por causa do login)
export default async function DashboardAdmin() {
  await dbConnect();

  const [totais, abertasBruto, recentesBruto] = await Promise.all([
    // uma consulta só: quantas ordens existem em cada status
    OrdemServico.aggregate<{ _id: StatusOS; total: number }>([{ $group: { _id: "$status", total: { $sum: 1 } } }]),

    OrdemServico.find({ status: { $nin: ["entregue", "cancelado"] } })
      .select("numero status prioridade prazoEstimado dataConclusao clienteId equipamentoId tecnicoId createdAt updatedAt")
      .populate("clienteId", "nome")
      .populate("equipamentoId", "marca modelo")
      .populate("tecnicoId", "nome")
      .lean(),

    OrdemServico.find()
      .select("numero status clienteId equipamentoId createdAt updatedAt")
      .populate("clienteId", "nome")
      .populate("equipamentoId", "marca modelo")
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const abertas = abertasBruto as unknown as OrdemResumo[];
  const recentes = recentesBruto as unknown as OrdemResumo[];

  const contagem = (status: StatusOS) => totais.find((t) => t._id === status)?.total ?? 0;
  const totalGeral = totais.reduce((soma, t) => soma + t.total, 0);
  const maiorStatus = Math.max(1, ...STATUS_OS.map(contagem));

  const atencao = abertas
    .map((ordem) => ({ ordem, motivos: motivosAtencao(ordem) }))
    .filter((item) => item.motivos.length > 0);

  // quantas ordens em aberto cada técnico tem
  const carga = new Map<string, number>();
  abertas.forEach((ordem) => {
    const nome = ordem.tecnicoId?.nome ?? "Sem técnico";
    carga.set(nome, (carga.get(nome) ?? 0) + 1);
  });
  const cargaOrdenada = Array.from(carga).sort((a, b) => b[1] - a[1]);
  const maiorCarga = Math.max(1, ...cargaOrdenada.map(([, total]) => total));

  if (totalGeral === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma ordem de serviço ainda. Abra a primeira pela página de um{" "}
        <Link href="/equipamentos" className="text-primary hover:underline">
          equipamento
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-4 sm:grid-cols-3">
        <CartaoNumero titulo="Total de ordens" valor={totalGeral} href="/ordens" />
        <CartaoNumero titulo="Em aberto" valor={abertas.length} />
        <CartaoNumero titulo="Precisam de atenção" valor={atencao.length} destaque={atencao.length > 0 ? "alerta" : undefined} />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-2 text-lg font-semibold">Ordens por status</h2>
          <div className="flex flex-col">
            {STATUS_OS.map((status) => (
              <BarraSimples
                key={status}
                rotulo={STATUS_LABEL[status]}
                valor={contagem(status)}
                maximo={maiorStatus}
                href={`/ordens?status=${status}`}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Ordens em aberto por técnico</h2>
          <div className="flex flex-col">
            {cargaOrdenada.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma ordem em aberto.</p>
            ) : (
              cargaOrdenada.map(([nome, total]) => <BarraSimples key={nome} rotulo={nome} valor={total} maximo={maiorCarga} />)
            )}
          </div>
        </section>
      </div>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Precisam de atenção</h2>
        {atencao.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma ordem com prazo vencido, urgente ou esquecida.</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border px-4">
            {atencao.slice(0, 8).map(({ ordem, motivos }) => (
              <LinhaOrdem
                key={String(ordem._id)}
                ordem={ordem}
                mostrarCliente
                detalhe={<span className="text-amber-300">{motivos.join("; ")}</span>}
              />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Atividade recente</h2>
        <ul className="divide-y divide-border rounded-md border border-border px-4">
          {recentes.map((ordem) => (
            <LinhaOrdem
              key={String(ordem._id)}
              ordem={ordem}
              mostrarCliente
              detalhe={`Atualizada em ${formatarDataHora(ordem.updatedAt)}`}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}
