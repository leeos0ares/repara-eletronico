// <select> do HTML com o visual dos inputs do ShadCN (mais simples que o Select do ShadCN)
export default function SelectNativo({ className = "", ...props }: React.ComponentProps<"select">) {
  return (
    <select
      {...props}
      style={{ colorScheme: "dark" }}
      className={`h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
}
