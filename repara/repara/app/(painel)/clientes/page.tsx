import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ListaClientes from "@/components/ListaClientes";

export default async function ClientesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "cliente") redirect("/dashboard");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="text-sm text-muted-foreground">Quem já deixou algum equipamento na assistência.</p>
      </div>

      <ListaClientes podeEditar={session.user.role === "admin"} />
    </div>
  );
}
