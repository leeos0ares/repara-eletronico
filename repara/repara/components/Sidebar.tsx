"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ROLE_LABEL, type Role } from "@/lib/constantes";

// Cada etapa nova do projeto adiciona linhas aqui
const menu: { href: string; label: string; roles: Role[] }[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["admin", "tecnico", "cliente"] },
  { href: "/ordens", label: "Ordens de serviço", roles: ["admin", "tecnico", "cliente"] },
  { href: "/clientes", label: "Clientes", roles: ["admin", "tecnico"] },
  { href: "/equipamentos", label: "Equipamentos", roles: ["admin", "tecnico", "cliente"] },
  { href: "/usuarios", label: "Usuários", roles: ["admin"] },
];

export default function Sidebar({ nome, role }: { nome: string; role: Role }) {
  const pathname = usePathname();
  const itens = menu.filter((item) => item.roles.includes(role));

  return (
    <aside className="flex flex-col gap-4 border-b border-border bg-card p-4 md:min-h-screen md:w-60 md:border-b-0 md:border-r">
      <Link href="/dashboard" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
        <Image src="/logo-repara.svg" alt="" width={28} height={28} />
        Repara
      </Link>

      <nav className="flex flex-wrap gap-1 md:flex-col">
        {itens.map((item) => {
          const ativo = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                ativo ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between gap-3 md:mt-auto md:flex-col md:items-stretch">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{nome}</p>
          <p className="text-xs text-muted-foreground">{ROLE_LABEL[role]}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
          Sair
        </Button>
      </div>
    </aside>
  );
}
