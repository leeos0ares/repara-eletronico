import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

// Layout de todas as páginas privadas (a pasta (painel) não aparece na URL)
export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login"); // segunda proteção, além do proxy.ts

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar nome={session.user.name ?? ""} role={session.user.role} />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
