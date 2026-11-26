import Link from "next/link";

type Props = {
  rotulo: string;
  valor: number;
  maximo: number;
  href?: string;
};

// Gráfico de barras feito só com div + Tailwind (sem biblioteca de gráficos)
export default function BarraSimples({ rotulo, valor, maximo, href }: Props) {
  const largura = maximo > 0 ? Math.round((valor / maximo) * 100) : 0;

  const linha = (
    <div className="grid grid-cols-[9rem_1fr_2rem] items-center gap-3 text-sm">
      <span className="truncate">{rotulo}</span>
      <div className="h-2 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${largura}%` }} />
      </div>
      <span className="text-right tabular-nums">{valor}</span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-md px-1 py-1.5 hover:bg-muted/40">
        {linha}
      </Link>
    );
  }
  return <div className="px-1 py-1.5">{linha}</div>;
}
