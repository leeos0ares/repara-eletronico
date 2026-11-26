import { NextResponse } from "next/server";
import { lerJson } from "@/lib/corpo";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { exigirAcesso } from "@/lib/permissoes";
import { lerDadosEquipamento } from "@/lib/equipamento";
import { Cliente } from "@/models/Cliente";
import { Equipamento } from "@/models/Equipamento";
import { OrdemServico } from "@/models/OrdemServico";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const session = await exigirAcesso(["admin"]);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ erro: "ID inválido" }, { status: 400 });
  }

  const { dados, erro } = lerDadosEquipamento(await lerJson(req));
  if (erro) {
    return NextResponse.json({ erro }, { status: 400 });
  }

  await dbConnect();
  const equipamento = await Equipamento.findById(id);
  if (!equipamento) {
    return NextResponse.json({ erro: "Equipamento não encontrado" }, { status: 404 });
  }
  if (!(await Cliente.exists({ _id: dados.clienteId }))) {
    return NextResponse.json({ erro: "Cliente não encontrado" }, { status: 404 });
  }

  // as ordens guardam o cliente, então o dono não pode mudar depois que existe ordem
  if (String(equipamento.clienteId) !== dados.clienteId && (await OrdemServico.exists({ equipamentoId: id }))) {
    return NextResponse.json(
      { erro: "Esse equipamento já tem ordens de serviço, o cliente não pode ser trocado" },
      { status: 409 }
    );
  }

  equipamento.set(dados);
  await equipamento.save();
  return NextResponse.json({ mensagem: "Equipamento atualizado" });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await exigirAcesso(["admin"]);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ erro: "ID inválido" }, { status: 400 });
  }

  await dbConnect();

  if (await OrdemServico.exists({ equipamentoId: id })) {
    return NextResponse.json(
      { erro: "Esse equipamento tem ordens de serviço e não pode ser excluído" },
      { status: 409 }
    );
  }

  const equipamento = await Equipamento.findByIdAndDelete(id);
  if (!equipamento) {
    return NextResponse.json({ erro: "Equipamento não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ mensagem: "Equipamento excluído" });
}
