import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ListaEquipamentos from "@/components/ListaEquipamentos";

export default async function EquipamentosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = session.user.role;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{role === "cliente" ? "Meus equipamentos" : "Equipamentos"}</h1>
        <p className="text-sm text-muted-foreground">
          {role === "cliente"
            ? "Os equipamentos que você deixou na assistência."
            : "Todos os equipamentos cadastrados, de todos os clientes."}
        </p>
      </div>

      <ListaEquipamentos podeEditar={role === "admin"} mostrarCliente={role !== "cliente"} />
    </div>
  );
}
