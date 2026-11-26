import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DetalheOrdem from "@/components/DetalheOrdem";

// A rota /api/ordens/[id] é quem confere se este usuário pode ver esta ordem
export default async function OrdemDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <DetalheOrdem id={id} role={session.user.role} />;
}
