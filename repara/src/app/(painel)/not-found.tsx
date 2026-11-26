import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFoundPainel() {
  return (
    <div className="flex max-w-md flex-col gap-3">
      <h1 className="text-xl font-semibold">Não encontramos isso</h1>
      <p className="text-sm text-muted-foreground">
        O item não existe ou você não tem permissão para vê-lo.
      </p>
      <div>
        <Link href="/dashboard" className={buttonVariants()}>
          Voltar ao dashboard
        </Link>
      </div>
    </div>
  );
}
