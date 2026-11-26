import { NextResponse } from "next/server";
import { lerJson } from "@/lib/corpo";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { exigirAcesso } from "@/lib/permissoes";
import { Cliente } from "@/models/Cliente";
import { Equipamento } from "@/models/Equipamento";
import { Usuario } from "@/models/Usuario";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const session = await exigirAcesso(["admin"]);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ erro: "ID inválido" }, { status: 400 });
  }

  const body = await lerJson(req);
  const nome = String(body.nome ?? "").trim();
  const email = String(body.email ?? "").toLowerCase().trim();
  const telefone = String(body.telefone ?? "").trim();
  const observacoes = String(body.observacoes ?? "").trim();

  if (!nome || !email.includes("@")) {
    return NextResponse.json({ erro: "Informe nome e e-mail válidos" }, { status: 400 });
  }

  await dbConnect();
  const cliente = await Cliente.findById(id);
  if (!cliente) {
    return NextResponse.json({ erro: "Cliente não encontrado" }, { status: 404 });
  }

  // o e-mail da conta de login não muda por aqui
  if (cliente.usuarioId && email !== cliente.email) {
    return NextResponse.json(
      { erro: "Esse cliente tem conta no sistema, o e-mail não pode ser alterado" },
      { status: 400 }
    );
  }
  if (await Cliente.findOne({ email, _id: { $ne: id } })) {
    return NextResponse.json({ erro: "Já existe um cliente com esse e-mail" }, { status: 409 });
  }

  cliente.set({ nome, email, telefone, observacoes });
  await cliente.save();

  // mantém o nome da conta de login igual ao do cadastro
  if (cliente.usuarioId) {
    await Usuario.findByIdAndUpdate(cliente.usuarioId, { nome });
  }

  return NextResponse.json({ mensagem: "Cliente atualizado" });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await exigirAcesso(["admin"]);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ erro: "ID inválido" }, { status: 400 });
  }

  await dbConnect();

  if (await Equipamento.exists({ clienteId: id })) {
    return NextResponse.json(
      { erro: "Esse cliente ainda tem equipamentos cadastrados. Exclua os equipamentos primeiro." },
      { status: 409 }
    );
  }

  const cliente = await Cliente.findByIdAndDelete(id);
  if (!cliente) {
    return NextResponse.json({ erro: "Cliente não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ mensagem: "Cliente excluído" });
}
