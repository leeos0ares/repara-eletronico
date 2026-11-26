import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ListaUsuarios from "@/components/ListaUsuarios";

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <p className="text-sm text-muted-foreground">Administradores, técnicos e contas de clientes.</p>
      </div>

      <ListaUsuarios meuId={session.user.id} />
    </div>
  );
}
