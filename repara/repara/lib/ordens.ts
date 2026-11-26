import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import type { Session } from "next-auth";
import { dbConnect } from "@/lib/mongodb";
import { Cliente } from "@/models/Cliente";
import { OrdemServico } from "@/models/OrdemServico";

export const texto = (valor: unknown) => String(valor ?? "").trim();

// "2026-12-05" (do input type=date) -> Date. Vazio ou inválido -> null
export function lerData(valor: unknown): Date | null {
  const t = texto(valor);
  if (!t) return null;
  const data = new Date(`${t}T12:00:00`);
  return isNaN(data.getTime()) ? null : data;
}

export function novaMovimentacao(session: Session, descricao: string) {
  return { data: new Date(), usuarioNome: session.user.name ?? "Sistema", texto: descricao };
}

// Busca a ordem e confere se QUEM ESTÁ LOGADO pode mexer nela:
//  - admin: qualquer uma
//  - técnico: só as atribuídas a ele
//  - cliente: só as dele
// Devolve a ordem ou uma resposta de erro pronta (use: if (ordem instanceof NextResponse) return ordem;)
export async function carregarOrdem(id: string, session: Session) {
  if (!isValidObjectId(id)) {
    return NextResponse.json({ erro: "ID inválido" }, { status: 400 });
  }

  await dbConnect();
  const ordem = await OrdemServico.findById(id);
  const naoEncontrada = NextResponse.json({ erro: "Ordem de serviço não encontrada" }, { status: 404 });

  if (!ordem) return naoEncontrada;

  const { role, id: userId } = session.user;

  if (role === "tecnico" && ordem.tecnicoId?.toString() !== userId) return naoEncontrada;

  if (role === "cliente") {
    const cliente = await Cliente.findOne({ usuarioId: userId });
    if (!cliente || ordem.clienteId.toString() !== cliente._id.toString()) return naoEncontrada;
  }

  return ordem;
}

// Campos que o cliente NÃO deve ver
const SO_EQUIPE = [
  "observacoesInternas",
  "procedimentosRealizados",
  "pecasUtilizadas",
  "resultadoTestes",
  "servicoExecutar",
  "tecnicoId",
  "prioridade",
];

export function limparParaCliente(ordem: object): Record<string, unknown> {
  const copia: Record<string, unknown> = { ...ordem };
  for (const campo of SO_EQUIPE) delete copia[campo];

  // diagnóstico só aparece depois que a análise terminou
  if (copia.status === "recebido" || copia.status === "em_diagnostico") delete copia.diagnostico;

  // orçamento em rascunho (ainda não enviado) não aparece
  const orcamento = copia.orcamento as { status?: string } | null | undefined;
  if (orcamento?.status === "pendente" && copia.status !== "aguardando_aprovacao") delete copia.orcamento;

  return copia;
}
