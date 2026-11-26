type AlertaProps = {
  tipo?: "erro" | "sucesso";
  children: React.ReactNode;
};

export default function Alerta({ tipo = "erro", children }: AlertaProps) {
  const cores =
    tipo === "erro"
      ? "border-red-500/40 bg-red-500/10 text-red-300"
      : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";

  return (
    <div role="alert" className={`rounded-md border px-3 py-2 text-sm ${cores}`}>
      {children}
    </div>
  );
}
