// Par "rótulo + valor" usado nas páginas de detalhe
export default function Campo({ label, valor }: { label: string; valor?: string | null }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="break-words">{valor || "—"}</dd>
    </div>
  );
}
