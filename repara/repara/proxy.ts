import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Next.js 16: o antigo middleware.ts passou a se chamar proxy.ts.
// Protege as PÁGINAS privadas. As rotas /api não passam por aqui:
// cada rota da API confere login e perfil por conta própria (exigirAcesso em src/lib/permissoes.ts).
// A conferência no banco (usuário ainda ativo, perfil atual) é feita em getServerSession (src/lib/auth.ts).
export async function proxy(req: NextRequest) {
  // lê e valida o cookie JWT do NextAuth (usa NEXTAUTH_SECRET)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // sem login: vai para a nossa tela de login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const soAdmin = pathname.startsWith("/usuarios");
  const soEquipe = pathname.startsWith("/clientes");

  if ((soAdmin && token.role !== "admin") || (soEquipe && token.role === "cliente")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ordens/:path*",
    "/clientes/:path*",
    "/equipamentos/:path*",
    "/usuarios/:path*",
  ],
};
