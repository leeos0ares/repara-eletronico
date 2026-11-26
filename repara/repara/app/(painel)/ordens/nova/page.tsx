import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FormNovaOrdem from "@/components/FormNovaOrdem";

// ?equipamento=ID vem do botão "Abrir ordem de serviço" da página do equipamento
export default async function NovaOrdemPage({ searchParams }: { searchParams: Promise<{ equipamento?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/ordens");

  const { equipamento } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/ordens" className="text-sm text-muted-foreground hover:underline">
          Voltar para ordens
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Nova ordem de serviço</h1>
        <p className="text-sm text-muted-foreground">Registre o recebimento do equipamento na assistência.</p>
      </div>

      <FormNovaOrdem equipamentoInicial={equipamento ?? ""} />
    </div>
  );
}
