import { NextResponse } from "next/server";
import { lerJson } from "@/lib/corpo";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import { normalizarCodigo } from "@/lib/vinculo";
import { Usuario } from "@/models/Usuario";
import { Cliente } from "@/models/Cliente";

export async function POST(req: Request) {
  const body = await lerJson(req);
  const nome = String(body.nome ?? "").trim();
  const email = String(body.email ?? "").toLowerCase().trim();
  const telefone = String(body.telefone ?? "").trim();
  const senha = String(body.senha ?? "");
  const codigo = normalizarCodigo(body.codigoVinculo);

  if (!nome || !email || !senha) {
    return NextResponse.json({ erro: "Preencha nome, e-mail e senha" }, { status: 400 });
  }
  if (!email.includes("@")) {
    return NextResponse.json({ erro: "E-mail inválido" }, { status: 400 });
  }
  if (senha.length < 6) {
    return NextResponse.json({ erro: "A senha precisa ter pelo menos 6 caracteres" }, { status: 400 });
  }

  await dbConnect();

  const jaExiste = await Usuario.findOne({ email });
  if (jaExiste) {
    return NextResponse.json({ erro: "Já existe uma conta com esse e-mail" }, { status: 409 });
  }

  // Se a assistência já cadastrou esse e-mail no balcão, a conta só é ligada a esse cadastro
  // com o código de vínculo que o admin entregou ao cliente. Só o e-mail não basta,
  // senão qualquer pessoa veria os equipamentos e ordens de outro cliente.
  const clienteExistente = await Cliente.findOne({ email }).select("+codigoVinculo");
  if (clienteExistente) {
    if (clienteExistente.usuarioId) {
      return NextResponse.json({ erro: "Já existe uma conta para esse cliente" }, { status: 409 });
    }
    const codigoCerto = !!clienteExistente.codigoVinculo && normalizarCodigo(clienteExistente.codigoVinculo) === codigo;
    if (!codigoCerto) {
      return NextResponse.json(
        { erro: "Esse e-mail já está cadastrado na assistência. Informe o código de vínculo que a assistência te passou." },
        { status: 403 }
      );
    }
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  // role fixo em "cliente": quem cria técnico ou admin é o administrador
  const usuario = await Usuario.create({ nome, email, senhaHash, role: "cliente" });

  if (clienteExistente) {
    clienteExistente.set({ usuarioId: usuario._id, codigoVinculo: null }); // o código é de uso único
    await clienteExistente.save();
  } else {
    await Cliente.create({ nome, email, telefone, usuarioId: usuario._id });
  }

  return NextResponse.json({ mensagem: "Conta criada com sucesso" }, { status: 201 });
}
