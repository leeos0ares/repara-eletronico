import { NextResponse } from "next/server";
import { lerJson } from "@/lib/corpo";
import { isValidObjectId } from "mongoose";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import { exigirAcesso } from "@/lib/permissoes";
import { Usuario } from "@/models/Usuario";
import { Cliente } from "@/models/Cliente";
import { OrdemServico } from "@/models/OrdemServico";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const session = await exigirAcesso(["admin"]);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ erro: "ID inválido" }, { status: 400 });
  }

  const body = await lerJson(req);
  await dbConnect();

  const usuario = await Usuario.findById(id);
  if (!usuario) {
    return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });
  }

  const ehEuMesmo = id === session.user.id;

  // Conta de cliente: nome, e-mail e perfil ficam no cadastro de clientes, aqui só muda status e senha
  if (usuario.role !== "cliente") {
    const nome = String(body.nome ?? "").trim();
    const email = String(body.email ?? "").toLowerCase().trim();

    if (!nome || !email.includes("@")) {
      return NextResponse.json({ erro: "Informe nome e e-mail válidos" }, { status: 400 });
    }
    if (await Usuario.findOne({ email, _id: { $ne: id } })) {
      return NextResponse.json({ erro: "Já existe um usuário com esse e-mail" }, { status: 409 });
    }

    usuario.nome = nome;
    usuario.email = email;

    // o admin não pode tirar o próprio acesso de administrador
    if (!ehEuMesmo && (body.role === "admin" || body.role === "tecnico")) {
      usuario.role = body.role;
    }
  }

  if (!ehEuMesmo && typeof body.ativo === "boolean") {
    usuario.ativo = body.ativo;
  }

  if (body.senha) {
    if (String(body.senha).length < 6) {
      return NextResponse.json({ erro: "A senha precisa ter pelo menos 6 caracteres" }, { status: 400 });
    }
    usuario.senhaHash = await bcrypt.hash(String(body.senha), 10);
  }

  await usuario.save();
  return NextResponse.json({ mensagem: "Usuário atualizado" });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await exigirAcesso(["admin"]);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ erro: "ID inválido" }, { status: 400 });
  }
  if (id === session.user.id) {
    return NextResponse.json({ erro: "Você não pode excluir a própria conta" }, { status: 400 });
  }

  await dbConnect();

  if (await OrdemServico.exists({ tecnicoId: id })) {
    return NextResponse.json(
      { erro: "Esse técnico tem ordens de serviço. Desative o usuário em vez de excluir." },
      { status: 409 }
    );
  }

  const usuario = await Usuario.findByIdAndDelete(id);
  if (!usuario) {
    return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });
  }

  // se era conta de um cliente, o cadastro do cliente continua, só perde o vínculo
  await Cliente.updateMany({ usuarioId: id }, { usuarioId: null });

  return NextResponse.json({ mensagem: "Usuário excluído" });
}
