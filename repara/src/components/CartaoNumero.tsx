import Link from "next/link";

type Props = {
  titulo: string;
  valor: number;
  href?: string;
  destaque?: "alerta" | "ok";
};

export default function CartaoNumero({ titulo, valor, href, destaque }: Props) {
  const cor =
    destaque === "alerta"
      ? "border-amber-500/40 bg-amber-500/10"
      : destaque === "ok"
        ? "border-emerald-500/40 bg-emerald-500/10"
        : "border-border bg-card";

  const conteudo = (
    <>
      <p className="text-sm text-muted-foreground">{titulo}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{valor}</p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`block rounded-lg border p-4 transition-colors hover:bg-muted/40 ${cor}`}>
        {conteudo}
      </Link>
    );
  }
  return <div className={`rounded-lg border p-4 ${cor}`}>{conteudo}</div>;
}
