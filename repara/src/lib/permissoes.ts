import { NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/lib/constantes";

// Usada no começo de toda rota da API.
// Devolve a sessão, ou uma resposta de erro (401/403) que a rota só precisa retornar:
//
//   const session = await exigirAcesso(["admin"]);
//   if (session instanceof NextResponse) return session;
export async function exigirAcesso(roles?: Role[]): Promise<Session | NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ erro: "Você precisa estar logado" }, { status: 401 });
  }
  if (roles && !roles.includes(session.user.role)) {
    return NextResponse.json({ erro: "Você não tem permissão para isso" }, { status: 403 });
  }
  return session;
}
