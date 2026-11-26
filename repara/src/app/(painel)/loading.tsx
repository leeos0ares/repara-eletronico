export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="h-32 max-w-xl animate-pulse rounded-md bg-muted" />
    </div>
  );
}
