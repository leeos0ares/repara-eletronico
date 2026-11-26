import { NextResponse } from "next/server";
import { lerJson } from "@/lib/corpo";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { exigirAcesso } from "@/lib/permissoes";
import { PRIORIDADES } from "@/lib/constantes";
import { lerData, novaMovimentacao, texto } from "@/lib/ordens";
import { Cliente } from "@/models/Cliente";
import { Equipamento } from "@/models/Equipamento";
import { OrdemServico, gerarNumeroOS } from "@/models/OrdemServico";
import { Usuario } from "@/models/Usuario";

// Lista as ordens que o usuário pode ver: admin = todas, técnico = as dele, cliente = as dele
export async function GET() {
  const session = await exigirAcesso();
  if (session instanceof NextResponse) return session;

  await dbConnect();
  const { role, id: userId } = session.user;

  let filtro = {};
  let campos = "numero clienteId equipamentoId status prazoEstimado problemaRelatado createdAt";

  if (role === "cliente") {
    const cliente = await Cliente.findOne({ usuarioId: userId });
    if (!cliente) return NextResponse.json([]);
    filtro = { clienteId: cliente._id };
  } else {
    campos += " tecnicoId prioridade"; // o cliente não recebe técnico nem prioridade
    if (role === "tecnico") filtro = { tecnicoId: userId };
  }

  const consulta = OrdemServico.find(filtro)
    .select(campos)
    .populate("clienteId", "nome")
    .populate("equipamentoId", "marca modelo tipo")
    .sort({ numero: -1 });

  if (role !== "cliente") consulta.populate("tecnicoId", "nome");

  return NextResponse.json(await consulta.lean());
}

// Só o admin abre ordens (recebe o equipamento no balcão)
export async function POST(req: Request) {
  const session = await exigirAcesso(["admin"]);
  if (session instanceof NextResponse) return session;

  const body = await lerJson(req);
  const equipamentoId = texto(body.equipamentoId);
  const tecnicoId = texto(body.tecnicoId);
  const problemaRelatado = texto(body.problemaRelatado);
  const prioridade = PRIORIDADES.includes(body.prioridade) ? body.prioridade : "normal";

  if (!isValidObjectId(equipamentoId)) {
    return NextResponse.json({ erro: "Escolha o equipamento" }, { status: 400 });
  }
  if (!problemaRelatado) {
    return NextResponse.json({ erro: "Descreva o problema relatado pelo cliente" }, { status: 400 });
  }

  await dbConnect();

  const equipamento = await Equipamento.findById(equipamentoId);
  if (!equipamento) {
    return NextResponse.json({ erro: "Equipamento não encontrado" }, { status: 404 });
  }

  if (tecnicoId) {
    const tecnico = isValidObjectId(tecnicoId)
      ? await Usuario.findOne({ _id: tecnicoId, role: "tecnico", ativo: true })
      : null;
    if (!tecnico) {
      return NextResponse.json({ erro: "Técnico inválido" }, { status: 400 });
    }
  }

  const numero = await gerarNumeroOS();

  const ordem = await OrdemServico.create({
    numero,
    clienteId: equipamento.clienteId, // o dono do equipamento é o cliente da ordem
    equipamentoId: equipamento._id,
    tecnicoId: tecnicoId || null,
    problemaRelatado,
    condicoesFisicas: texto(body.condicoesFisicas),
    acessorios: texto(body.acessorios),
    observacoesInternas: texto(body.observacoesInternas),
    prioridade,
    prazoEstimado: lerData(body.prazoEstimado),
    movimentacoes: [novaMovimentacao(session, "Ordem de serviço aberta. Status: Recebido")],
  });

  return NextResponse.json({ _id: ordem._id, numero: ordem.numero }, { status: 201 });
}
