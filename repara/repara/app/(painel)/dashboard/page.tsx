import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardAdmin from "@/components/DashboardAdmin";
import DashboardCliente from "@/components/DashboardCliente";
import DashboardTecnico from "@/components/DashboardTecnico";
import type { Role } from "@/lib/constantes";

const subtitulo: Record<Role, string> = {
  admin: "Visão geral da assistência.",
  tecnico: "Seu trabalho de hoje.",
  cliente: "Acompanhe os equipamentos que você deixou na assistência.",
};

// Cada perfil vê um painel diferente
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const { name, role, id } = session.user;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Olá, {name?.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">{subtitulo[role]}</p>
      </div>

      {role === "admin" && <DashboardAdmin />}
      {role === "tecnico" && <DashboardTecnico userId={id} />}
      {role === "cliente" && <DashboardCliente userId={id} />}
    </div>
  );
}
