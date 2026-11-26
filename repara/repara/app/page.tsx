import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";

// Mesmas etapas do fluxo de atendimento (principal caminho de um reparo)
const etapas = [
  "Recebido",
  "Em diagnóstico",
  "Aguardando aprovação",
  "Em reparo",
  "Em testes",
  "Pronto para retirada",
  "Entregue",
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) redirect("/dashboard");

  return (
    <main className="mx-auto grid min-h-screen max-w-5xl items-center gap-12 px-6 py-12 md:grid-cols-2">
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <Image src="/logo-repara.svg" alt="" width={56} height={56} priority />
          <h1 className="text-5xl font-semibold tracking-tight">Repara</h1>
        </div>
        <p className="max-w-md text-lg text-muted-foreground">
          Deixou o notebook, o videogame ou o controle na assistência? Veja em que etapa está o conserto e aprove o
          orçamento pelo celular.
        </p>
        <div className="flex gap-3">
          <Link href="/login" className={buttonVariants()}>
            Entrar
          </Link>
          <Link href="/cadastro" className={buttonVariants({ variant: "outline" })}>
            Criar conta
          </Link>
        </div>
      </section>

      <section aria-label="Etapas de um reparo">
        <ol className="border-l border-border pl-6">
          {etapas.map((etapa, i) => (
            <li key={etapa} className="relative py-3">
              <span className="absolute top-1/2 -left-[29.5px] size-2.5 -translate-y-1/2 rounded-full bg-primary" />
              <span className="mr-3 text-sm text-muted-foreground">{i + 1}</span>
              {etapa}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
