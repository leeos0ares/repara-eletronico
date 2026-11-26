import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FormCadastro from "@/components/FormCadastro";

export default async function CadastroPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
        <Image src="/logo-repara.svg" alt="" width={32} height={32} />
        Repara
      </Link>
      <FormCadastro />
    </main>
  );
}
