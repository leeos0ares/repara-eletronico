import { NextResponse } from "next/server";
import { lerJson } from "@/lib/corpo";
import { exigirAcesso } from "@/lib/permissoes";
import { STATUS_LABEL, type StatusOS } from "@/lib/constantes";
import { STATUS_ORCAMENTO_EDITAVEL } from "@/lib/status";
import { carregarOrdem, novaMovimentacao, texto } from "@/lib/ordens";

type Ctx = { params: Promise<{ id: string }> };

// Técnico ou admin cria / altera o orçamento. Ele sempre volta a ficar "pendente".
export async function PUT(req: Request, { params }: Ctx) {
  const session = await exigirAcesso(["admin", "tecnico"]);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const ordem = await carregarOrdem(id, session);
  if (ordem instanceof NextResponse) return ordem;

  if (!STATUS_ORCAMENTO_EDITAVEL.includes(ordem.status as StatusOS)) {
    return NextResponse.json({ erro: "Neste status não é possível alterar o orçamento" }, { status: 400 });
  }

  const body = await lerJson(req);
  const servicos = texto(body.servicos);
  const valorPecas = Number(body.valorPecas || 0);
  const valorMaoDeObra = Number(body.valorMaoDeObra || 0);

  if (!servicos) {
    return NextResponse.json({ erro: "Descreva os serviços do orçamento" }, { status: 400 });
  }
  if (!Number.isFinite(valorPecas) || !Number.isFinite(valorMaoDeObra) || valorPecas < 0 || valorMaoDeObra < 0) {
    return NextResponse.json({ erro: "Os valores precisam ser números maiores ou iguais a zero" }, { status: 400 });
  }

  ordem.set("orcamento", {
    servicos,
    pecas: texto(body.pecas),
    valorPecas,
    valorMaoDeObra,
    valorTotal: valorPecas + valorMaoDeObra,
    observacoes: texto(body.observacoes),
    status: "pendente",
    criadoEm: new Date(),
  });
  await ordem.save();

  return NextResponse.json({ mensagem: "Orçamento salvo" });
}

// Cliente aprova ou recusa. O admin também pode registrar a decisão (ex.: cliente avisou no balcão).
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await exigirAcesso(["admin", "cliente"]);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const ordem = await carregarOrdem(id, session);
  if (ordem instanceof NextResponse) return ordem;

  const { decisao } = await lerJson(req);
  if (decisao !== "aprovado" && decisao !== "recusado") {
    return NextResponse.json({ erro: "Decisão inválida" }, { status: 400 });
  }

  if (ordem.status !== "aguardando_aprovacao" || ordem.orcamento?.status !== "pendente") {
    return NextResponse.json({ erro: "Não há orçamento aguardando decisão" }, { status: 400 });
  }

  const nome = session.user.name ?? "Cliente";
  const quem = session.user.role === "admin" ? `${nome} (administrador, em nome do cliente)` : nome;
  const novoStatus: StatusOS = decisao === "aprovado" ? "em_reparo" : "recusado";

  ordem.set("orcamento.status", decisao);
  ordem.set("orcamento.decididoEm", new Date());
  ordem.status = novoStatus;
  ordem.movimentacoes.push(
    novaMovimentacao(
      session,
      `Orçamento ${decisao === "aprovado" ? "aprovado" : "recusado"} por ${quem}. Status: Aguardando aprovação → ${STATUS_LABEL[novoStatus]}`
    )
  );
  await ordem.save();

  return NextResponse.json({ mensagem: decisao === "aprovado" ? "Orçamento aprovado" : "Orçamento recusado" });
}
