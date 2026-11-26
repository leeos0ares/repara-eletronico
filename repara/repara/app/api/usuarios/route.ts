import { NextResponse } from "next/server";
import { lerJson } from "@/lib/corpo";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import { exigirAcesso } from "@/lib/permissoes";
import { Usuario } from "@/models/Usuario";

// Lista todos os usuários (só admin)
export async function GET() {
  const session = await exigirAcesso(["admin"]);
  if (session instanceof NextResponse) return session;

  await dbConnect();
  const usuarios = await Usuario.find().sort({ nome: 1 }).lean(); // senhaHash não vem (select: false)
  return NextResponse.json(usuarios);
}

// Cria administrador ou técnico (clientes se cadastram sozinhos em /cadastro)
export async function POST(req: Request) {
  const session = await exigirAcesso(["admin"]);
  if (session instanceof NextResponse) return session;

  const body = await lerJson(req);
  const nome = String(body.nome ?? "").trim();
  const email = String(body.email ?? "").toLowerCase().trim();
  const senha = String(body.senha ?? "");
  const role = body.role;

  if (!nome || !email.includes("@")) {
    return NextResponse.json({ erro: "Informe nome e e-mail válidos" }, { status: 400 });
  }
  if (senha.length < 6) {
    return NextResponse.json({ erro: "A senha precisa ter pelo menos 6 caracteres" }, { status: 400 });
  }
  if (role !== "admin" && role !== "tecnico") {
    return NextResponse.json({ erro: "Perfil inválido" }, { status: 400 });
  }

  await dbConnect();
  if (await Usuario.findOne({ email })) {
    return NextResponse.json({ erro: "Já existe um usuário com esse e-mail" }, { status: 409 });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = await Usuario.create({ nome, email, senhaHash, role });

  return NextResponse.json(
    { _id: usuario._id, nome: usuario.nome, email: usuario.email, role: usuario.role },
    { status: 201 }
  );
}
