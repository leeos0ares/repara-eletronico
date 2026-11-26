import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/constantes";

// Adiciona id e role nos tipos do NextAuth
declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: { id: string; role: Role } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    invalido?: boolean; // true quando o usuário foi desativado ou excluído depois do login
  }
}
