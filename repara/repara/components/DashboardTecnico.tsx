import LinhaOrdem from "@/components/LinhaOrdem";
import CartaoNumero from "@/components/CartaoNumero";
import { PrioridadeBadge } from "@/components/Etiquetas";
import type { StatusOS } from "@/lib/constantes";
import { PESO_PRIORIDADE, motivosAtencao, type OrdemResumo } from "@/lib/dashboard";
import { formatarDataHora } from "@/lib/formatar";
import { dbConnect } from "@/lib/mongodb";
import { OrdemServico } from "@/models/OrdemServico";

// Status em que o técnico tem algo para fazer ou acompanhar
const FILA: StatusOS[] = ["recebido", "em_diagnostico", "em_reparo", "aguardando_pecas", "em_testes"];

export default async function DashboardTecnico({ userId }: { userId: string }) {
  await dbConnect();

  const [abertasBruto, atualizadasBruto] = await Promise.all([
    OrdemServico.find({ tecnicoId: userId, status: { $nin: ["entregue", "cancelado"] } })
      .select("numero status prioridade prazoEstimado dataConclusao problemaRelatado clienteId equipamentoId createdAt updatedAt")
      .populate("clienteId", "nome")
      .populate("equipamentoId", "marca modelo")
      .lean(),

    OrdemServico.find({ tecnicoId: userId })
      .select("numero status equipamentoId movimentacoes createdAt updatedAt")
      .populate("equipamentoId", "marca modelo")
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const abertas = abertasBruto as unknown as OrdemResumo[];
  const atualizadas = atualizadasBruto as unknown as OrdemResumo[];

  const quantas = (...status: StatusOS[]) => abertas.filter((o) => status.includes(o.status)).length;

  const fila = abertas
    .filter((o) => FILA.includes(o.status))
    .sort(
      (a, b) =>
        PESO_PRIORIDADE[a.prioridade ?? "normal"] - PESO_PRIORIDADE[b.prioridade ?? "normal"] ||
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  return (
    <div className="flex flex-col gap-8">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <CartaoNumero titulo="Atribuídas a mim" valor={abertas.length} href="/ordens" />
        <CartaoNumero titulo="Aguardando diagnóstico" valor={quantas("recebido")} href="/ordens?status=recebido" />
        <CartaoNumero titulo="Em andamento" valor={quantas("em_diagnostico", "em_reparo")} href="/ordens" />
        <CartaoNumero titulo="Aguardando peças" valor={quantas("aguardando_pecas")} href="/ordens?status=aguardando_pecas" />
        <CartaoNumero titulo="Pendentes de testes" valor={quantas("em_testes")} href="/ordens?status=em_testes" />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Minha fila de trabalho</h2>
        {fila.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma ordem para trabalhar agora.</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border px-4">
            {fila.map((ordem) => {
              const motivos = motivosAtencao(ordem);
              return (
                <LinhaOrdem
                  key={String(ordem._id)}
                  ordem={ordem}
                  mostrarCliente
                  detalhe={
                    <>
                      {ordem.prioridade && <PrioridadeBadge prioridade={ordem.prioridade} />} {ordem.problemaRelatado}
                      {motivos.length > 0 && <span className="text-amber-300"> ({motivos.join("; ")})</span>}
                    </>
                  }
                />
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Últimas atualizações</h2>
        {atualizadas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma atualização ainda.</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border px-4">
            {atualizadas.map((ordem) => {
              const ultima = ordem.movimentacoes?.[ordem.movimentacoes.length - 1];
              return (
                <LinhaOrdem
                  key={String(ordem._id)}
                  ordem={ordem}
                  detalhe={ultima ? `${ultima.texto} (${formatarDataHora(ultima.data)})` : undefined}
                />
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
