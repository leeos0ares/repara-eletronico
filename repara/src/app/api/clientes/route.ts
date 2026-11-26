import { NextResponse } from "next/server";
import { lerJson } from "@/lib/corpo";
import { dbConnect } from "@/lib/mongodb";
import { exigirAcesso } from "@/lib/permissoes";
import { gerarCodigoVinculo } from "@/lib/vinculo";
import { Cliente } from "@/models/Cliente";

// Admin e técnico podem consultar
export async function GET() {
  const session = await exigirAcesso(["admin", "tecnico"]);
  if (session instanceof NextResponse) return session;

  await dbConnect();
  const clientes = await Cliente.find().select("-codigoVinculo").sort({ nome: 1 }).lean(); // o código nunca vai na lista
  return NextResponse.json(clientes);
}

// Só o admin cadastra
export async function POST(req: Request) {
  const session = await exigirAcesso(["admin"]);
  if (session instanceof NextResponse) return session;

  const body = await lerJson(req);
  const nome = String(body.nome ?? "").trim();
  const email = String(body.email ?? "").toLowerCase().trim();
  const telefone = String(body.telefone ?? "").trim();
  const observacoes = String(body.observacoes ?? "").trim();

  if (!nome || !email.includes("@")) {
    return NextResponse.json({ erro: "Informe nome e e-mail válidos" }, { status: 400 });
  }

  await dbConnect();
  if (await Cliente.findOne({ email })) {
    return NextResponse.json({ erro: "Já existe um cliente com esse e-mail" }, { status: 409 });
  }

  const cliente = await Cliente.create({ nome, email, telefone, observacoes, codigoVinculo: gerarCodigoVinculo() });
  return NextResponse.json(cliente, { status: 201 });
}
