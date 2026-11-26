import { NextResponse } from "next/server";
import { lerJson } from "@/lib/corpo";
import { dbConnect } from "@/lib/mongodb";
import { exigirAcesso } from "@/lib/permissoes";
import { lerDadosEquipamento } from "@/lib/equipamento";
import { Cliente } from "@/models/Cliente";
import { Equipamento } from "@/models/Equipamento";

// Qualquer usuário logado. O cliente só enxerga os equipamentos dele.
export async function GET() {
  const session = await exigirAcesso();
  if (session instanceof NextResponse) return session;

  await dbConnect();

  let filtro = {};
  if (session.user.role === "cliente") {
    const cliente = await Cliente.findOne({ usuarioId: session.user.id });
    if (!cliente) return NextResponse.json([]);
    filtro = { clienteId: cliente._id };
  }

  const equipamentos = await Equipamento.find(filtro)
    .populate("clienteId", "nome") // troca o id do cliente por { _id, nome }
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(equipamentos);
}

export async function POST(req: Request) {
  const session = await exigirAcesso(["admin"]);
  if (session instanceof NextResponse) return session;

  const { dados, erro } = lerDadosEquipamento(await lerJson(req));
  if (erro) {
    return NextResponse.json({ erro }, { status: 400 });
  }

  await dbConnect();
  if (!(await Cliente.exists({ _id: dados.clienteId }))) {
    return NextResponse.json({ erro: "Cliente não encontrado" }, { status: 404 });
  }

  const equipamento = await Equipamento.create(dados);
  return NextResponse.json(equipamento, { status: 201 });
}
