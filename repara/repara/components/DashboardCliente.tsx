import CartaoNumero from "@/components/CartaoNumero";
import LinhaOrdem from "@/components/LinhaOrdem";
import type { StatusOS } from "@/lib/constantes";
import type { OrdemResumo } from "@/lib/dashboard";
import { formatarData } from "@/lib/formatar";
import { dbConnect } from "@/lib/mongodb";
import { Cliente } from "@/models/Cliente";
import { Equipamento } from "@/models/Equipamento";
import { OrdemServico } from "@/models/OrdemServico";

const EM_ANDAMENTO: StatusOS[] = ["recebido", "em_diagnostico", "aguardando_pecas", "em_reparo", "em_testes", "recusado"];

export default async function DashboardCliente({ userId }: { userId: string }) {
  await dbConnect();

  const cliente = await Cliente.findOne({ usuarioId: userId });
  if (!cliente) {
    return (
      <p className="text-sm text-muted-foreground">
        Não encontramos o seu cadastro de cliente. Fale com a assistência para vincular a sua conta.
      </p>
    );
  }

  const [ordensBruto, totalEquipamentos] = await Promise.all([
    // sem técnico, prioridade ou notas internas: o cliente só recebe o que pode ver
    OrdemServico.find({ clienteId: cliente._id })
      .select("numero status prazoEstimado dataConclusao dataEntrega equipamentoId createdAt updatedAt")
      .populate("equipamentoId", "marca modelo")
      .sort({ createdAt: -1 })
      .lean(),
    Equipamento.countDocuments({ clienteId: cliente._id }),
  ]);

  const ordens = ordensBruto as unknown as OrdemResumo[];

  const aguardandoDecisao = ordens.filter((o) => o.status === "aguardando_aprovacao");
  const prontas = ordens.filter((o) => o.status === "pronto_retirada");
  const andamento = ordens.filter((o) => EM_ANDAMENTO.includes(o.status));
  const concluidas = ordens.filter((o) => o.status === "entregue");
  const abertas = ordens.filter((o) => o.status !== "entregue" && o.status !== "cancelado");

  return (
    <div className="flex flex-col gap-8">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <CartaoNumero titulo="Equipamentos registrados" valor={totalEquipamentos} href="/equipamentos" />
        <CartaoNumero titulo="Ordens abertas" valor={abertas.length} href="/ordens" />
        <CartaoNumero
          titulo="Orçamentos para decidir"
          valor={aguardandoDecisao.length}
          destaque={aguardandoDecisao.length > 0 ? "alerta" : undefined}
          href="/ordens?status=aguardando_aprovacao"
        />
        <CartaoNumero
          titulo="Prontos para retirada"
          valor={prontas.length}
          destaque={prontas.length > 0 ? "ok" : undefined}
          href="/ordens?status=pronto_retirada"
        />
      </section>

      {aguardandoDecisao.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Aguardando a sua decisão</h2>
          <ul className="divide-y divide-border rounded-md border border-amber-500/40 bg-amber-500/5 px-4">
            {aguardandoDecisao.map((ordem) => (
              <LinhaOrdem
                key={String(ordem._id)}
                ordem={ordem}
                detalhe="Abra a ordem para ver o orçamento e aprovar ou recusar"
              />
            ))}
          </ul>
        </section>
      )}

      {prontas.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Prontos para retirar</h2>
          <ul className="divide-y divide-border rounded-md border border-emerald-500/40 bg-emerald-500/5 px-4">
            {prontas.map((ordem) => (
              <LinhaOrdem
                key={String(ordem._id)}
                ordem={ordem}
                detalhe={`Pronto desde ${formatarData(ordem.dataConclusao)}`}
              />
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-lg font-semibold">Em andamento</h2>
        {andamento.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum equipamento em atendimento no momento.</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border px-4">
            {andamento.map((ordem) => (
              <LinhaOrdem
                key={String(ordem._id)}
                ordem={ordem}
                detalhe={ordem.prazoEstimado ? `Prazo estimado: ${formatarData(ordem.prazoEstimado)}` : undefined}
              />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Serviços concluídos</h2>
        {concluidas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Seus serviços finalizados vão aparecer aqui.</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border px-4">
            {concluidas.slice(0, 5).map((ordem) => (
              <LinhaOrdem
                key={String(ordem._id)}
                ordem={ordem}
                detalhe={`Entregue em ${formatarData(ordem.dataEntrega)}`}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
