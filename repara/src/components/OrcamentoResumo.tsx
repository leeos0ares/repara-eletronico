import Campo from "@/components/Campo";
import { formatarData, formatarMoeda } from "@/lib/formatar";
import type { OrcamentoItem } from "@/types";

export default function OrcamentoResumo({ orcamento }: { orcamento: OrcamentoItem }) {
  const situacao = {
    pendente: "Aguardando decisão do cliente",
    aprovado: `Aprovado em ${formatarData(orcamento.decididoEm)}`,
    recusado: `Recusado em ${formatarData(orcamento.decididoEm)}`,
  }[orcamento.status];

  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Campo label="Serviços" valor={orcamento.servicos} />
      </div>
      <Campo label="Peças necessárias" valor={orcamento.pecas} />
      <Campo label="Valor das peças" valor={formatarMoeda(orcamento.valorPecas)} />
      <Campo label="Mão de obra" valor={formatarMoeda(orcamento.valorMaoDeObra)} />
      <Campo label="Total" valor={formatarMoeda(orcamento.valorTotal)} />
      <div className="sm:col-span-2">
        <Campo label="Observações" valor={orcamento.observacoes} />
      </div>
      <Campo label="Situação" valor={situacao} />
      <Campo label="Criado em" valor={formatarData(orcamento.criadoEm)} />
    </dl>
  );
}
