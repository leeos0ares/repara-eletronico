import { NextResponse } from "next/server";
import { lerJson } from "@/lib/corpo";
import { isValidObjectId } from "mongoose";
import { exigirAcesso } from "@/lib/permissoes";
import { PRIORIDADES, type StatusOS } from "@/lib/constantes";
import { STATUS_ENCERRADOS } from "@/lib/status";
import { carregarOrdem, lerData, limparParaCliente, texto } from "@/lib/ordens";
import { Usuario } from "@/models/Usuario";

type Ctx = { params: Promise<{ id: string }> };

const CAMPOS_TECNICO = [
  "diagnostico",
  "servicoExecutar",
  "procedimentosRealizados",
  "pecasUtilizadas",
  "resultadoTestes",
  "observacoesInternas",
];
const CAMPOS_ADMIN = [...CAMPOS_TECNICO, "problemaRelatado", "condicoesFisicas", "acessorios"];

export async function GET(_req: Request, { params }: Ctx) {
  const session = await exigirAcesso();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const ordem = await carregarOrdem(id, session);
  if (ordem instanceof NextResponse) return ordem;

  await ordem.populate([
    { path: "clienteId", select: "nome email telefone" },
    { path: "equipamentoId", select: "marca modelo tipo numeroSerie" },
    { path: "tecnicoId", select: "nome" },
  ]);
  const dados = ordem.toObject();

  return NextResponse.json(session.user.role === "cliente" ? limparParaCliente(dados) : dados);
}

// Edição dos campos de texto. Cada perfil só altera o que lhe cabe.
export async function PUT(req: Request, { params }: Ctx) {
  const session = await exigirAcesso(["admin", "tecnico"]);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const ordem = await carregarOrdem(id, session);
  if (ordem instanceof NextResponse) return ordem;

  if (STATUS_ENCERRADOS.includes(ordem.status as StatusOS)) {
    return NextResponse.json({ erro: "Esta ordem já foi encerrada e não pode mais ser editada" }, { status: 400 });
  }

  const body = await lerJson(req);
  const ehAdmin = session.user.role === "admin";
  const permitidos = ehAdmin ? CAMPOS_ADMIN : CAMPOS_TECNICO;

  if (ehAdmin && typeof body.problemaRelatado === "string" && !texto(body.problemaRelatado)) {
    return NextResponse.json({ erro: "O problema relatado não pode ficar vazio" }, { status: 400 });
  }

  for (const campo of permitidos) {
    if (typeof body[campo] === "string") ordem.set(campo, texto(body[campo]));
  }

  // Campos só do admin: prioridade, prazo e técnico responsável
  if (ehAdmin) {
    if (body.prioridade !== undefined) {
      if (!PRIORIDADES.includes(body.prioridade)) {
        return NextResponse.json({ erro: "Prioridade inválida" }, { status: 400 });
      }
      ordem.set("prioridade", body.prioridade);
    }

    if (body.prazoEstimado !== undefined) {
      ordem.set("prazoEstimado", lerData(body.prazoEstimado));
    }

    if (body.tecnicoId !== undefined) {
      const tecnicoId = texto(body.tecnicoId);
      if (!tecnicoId) {
        ordem.set("tecnicoId", null);
      } else if (tecnicoId !== String(ordem.tecnicoId ?? "")) {
        const tecnico = isValidObjectId(tecnicoId)
          ? await Usuario.findOne({ _id: tecnicoId, role: "tecnico", ativo: true })
          : null;
        if (!tecnico) {
          return NextResponse.json({ erro: "Técnico inválido" }, { status: 400 });
        }
        ordem.set("tecnicoId", tecnicoId);
      }
    }
  }

  await ordem.save();
  return NextResponse.json({ mensagem: "Ordem atualizada" });
}
