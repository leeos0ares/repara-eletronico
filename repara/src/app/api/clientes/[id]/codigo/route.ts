import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { exigirAcesso } from "@/lib/permissoes";
import { gerarCodigoVinculo } from "@/lib/vinculo";
import { Cliente } from "@/models/Cliente";

type Ctx = { params: Promise<{ id: string }> };

// Gera (ou troca) o código de vínculo de um cliente que ainda não tem conta
export async function POST(_req: Request, { params }: Ctx) {
  const session = await exigirAcesso(["admin"]);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ erro: "ID inválido" }, { status: 400 });
  }

  await dbConnect();
  const cliente = await Cliente.findById(id);
  if (!cliente) {
    return NextResponse.json({ erro: "Cliente não encontrado" }, { status: 404 });
  }
  if (cliente.usuarioId) {
    return NextResponse.json({ erro: "Esse cliente já tem conta no sistema" }, { status: 400 });
  }

  const codigo = gerarCodigoVinculo();
  cliente.set({ codigoVinculo: codigo });
  await cliente.save();

  return NextResponse.json({ codigo });
}
