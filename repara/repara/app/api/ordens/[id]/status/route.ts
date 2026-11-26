import { NextResponse } from "next/server";
import { lerJson } from "@/lib/corpo";
import { exigirAcesso } from "@/lib/permissoes";
import { STATUS_LABEL, STATUS_OS, type StatusOS } from "@/lib/constantes";
import { motivoBloqueio, proximosStatus } from "@/lib/status";
import { carregarOrdem, novaMovimentacao } from "@/lib/ordens";

type Ctx = { params: Promise<{ id: string }> };

// Muda o status seguindo as regras de src/lib/status.ts
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await exigirAcesso(["admin", "tecnico"]);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const ordem = await carregarOrdem(id, session);
  if (ordem instanceof NextResponse) return ordem;

  const { status: novo } = await lerJson(req);
  if (!STATUS_OS.includes(novo)) {
    return NextResponse.json({ erro: "Status inválido" }, { status: 400 });
  }

  const atual = ordem.status as StatusOS;

  if (!proximosStatus(atual, session.user.role).includes(novo)) {
    return NextResponse.json({ erro: "Essa mudança de status não é permitida" }, { status: 400 });
  }

  const bloqueio = motivoBloqueio(novo, {
    temTecnico: !!ordem.tecnicoId,
    orcamentoPendente: ordem.orcamento?.status === "pendente",
    temResultadoTestes: !!ordem.resultadoTestes,
  });
  if (bloqueio) {
    return NextResponse.json({ erro: bloqueio }, { status: 400 });
  }

  ordem.status = novo;
  if (novo === "pronto_retirada") ordem.dataConclusao = new Date();
  if (novo === "entregue") ordem.dataEntrega = new Date();

  ordem.movimentacoes.push(novaMovimentacao(session, `Status: ${STATUS_LABEL[atual]} → ${STATUS_LABEL[novo as StatusOS]}`));
  await ordem.save();

  return NextResponse.json({ mensagem: "Status atualizado" });
}
